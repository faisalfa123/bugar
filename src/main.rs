mod api;
mod db;
mod hdd;
mod mastermind;
mod models;

use axum::{
    http::{header, HeaderValue, StatusCode, Uri},
    response::{Html, IntoResponse, Response},
    routing::{get, post},
    Router,
};
use clap::Parser;
use rust_embed::RustEmbed;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

use crate::api::AppState;
use crate::db::Database;
use crate::hdd::HddManager;

#[derive(RustEmbed)]
#[folder = "web/dist/"]
struct DistAsset;

#[derive(Parser, Debug)]
#[command(
    name = "bugar",
    author = "Faisal <faisal@bugar.local>",
    version,
    about = "BUGAR: All-in-One Fitness, Nutrition & Fat Burner Edge Server for ODROID-C2 (ARM64)"
)]
pub struct Args {
    /// Port to listen on (supports both --port, -p, and -port from Mastermind)
    #[arg(short = 'p', long = "port", default_value_t = 1200, env = "PORT")]
    pub port: u16,

    /// Path to SQLite database file
    #[arg(short = 'd', long = "db", default_value = "bugar.db", env = "BUGAR_DB_PATH")]
    pub db: String,

    /// Bind host address
    #[arg(long = "host", default_value = "0.0.0.0", env = "BUGAR_HOST")]
    pub host: String,

    /// External HDD Directory for human-readable backups & configuration
    #[arg(long = "hdd-dir", default_value = "/mnt/hdd1/bugar", env = "BUGAR_HDD_DIR")]
    pub hdd_dir: String,
}

fn resolve_db_path(configured_path: &str, hdd_dir: &str) -> std::path::PathBuf {
    let p = std::path::Path::new(configured_path);
    // If an explicit absolute path is provided, use it directly
    if p.is_absolute() {
        return p.to_path_buf();
    }

    // 1. Check systemd $STATE_DIRECTORY (set automatically by systemd StateDirectory=mastermind/bugar)
    if let Ok(state_dir) = std::env::var("STATE_DIRECTORY") {
        if !state_dir.is_empty() {
            return std::path::Path::new(&state_dir).join("bugar.db");
        }
    }

    // 2. Check /var/lib/mastermind/bugar
    let mm_state = std::path::Path::new("/var/lib/mastermind/bugar");
    if mm_state.exists() {
        return mm_state.join("bugar.db");
    }

    // 3. Test if current directory is writable
    let test_file = std::path::Path::new(".write_test_probe");
    if let Ok(f) = std::fs::OpenOptions::new().write(true).create(true).open(test_file) {
        drop(f);
        let _ = std::fs::remove_file(test_file);
        return p.to_path_buf();
    }

    // 4. Check if external HDD dir exists
    let hdd_path = std::path::Path::new(hdd_dir);
    if hdd_path.exists() {
        return hdd_path.join("bugar.db");
    }

    // 5. Fallback to /tmp
    std::path::PathBuf::from("/tmp/bugar.db")
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Normalize arguments: Mastermind passes single-dash flags like "-port 1200" or "-db /path"
    // We rewrite them to double-dash standard flags "--port 1200" before Clap parses them.
    let raw_args: Vec<String> = std::env::args().collect();
    let normalized_args: Vec<String> = raw_args
        .into_iter()
        .map(|arg| {
            if arg == "-port" {
                "--port".to_string()
            } else if let Some(rest) = arg.strip_prefix("-port=") {
                format!("--port={}", rest)
            } else if arg == "-db" {
                "--db".to_string()
            } else if let Some(rest) = arg.strip_prefix("-db=") {
                format!("--db={}", rest)
            } else if arg == "-hdd-dir" {
                "--hdd-dir".to_string()
            } else {
                arg
            }
        })
        .collect();

    let args = Args::parse_from(normalized_args);
    let db_path = resolve_db_path(&args.db, &args.hdd_dir);

    println!("==========================================================");
    println!("  🏋️ BUGAR Edge Server v{}", env!("CARGO_PKG_VERSION"));
    println!("  Arsitektur : {}", std::env::consts::ARCH);
    println!("  Port Server: {}", args.port);
    println!("  Database   : {}", db_path.display());
    println!("  Backup HDD : {}", args.hdd_dir);
    println!("==========================================================");

    // Initialize Database
    let mut database = Database::open(&db_path)
        .map_err(|e| format!("Gagal menginisialisasi SQLite database: {:?}", e))?;
    println!("✅ SQLite database siap (WAL Mode, synchronous NORMAL).");

    // Disaster Recovery Check: If database is empty, check /mnt/hdd1/bugar/backup_latest.json
    let hdd_manager = HddManager::new(&args.hdd_dir);
    if hdd_manager.try_recover_empty_db(&mut database) {
        println!("🎉 Database berhasil dipulihkan dari cadangan HDD: {}", args.hdd_dir);
    }

    let state = AppState::new(database, &args.hdd_dir);
    if state.pin_hash.is_some() {
        println!("🔒 Proteksi PIN aktif (BUGAR_PIN terdeteksi).");
    } else {
        println!("ℹ️ Akses terbuka (BUGAR_PIN tidak disetel).");
    }

    // Configure Routes
    let app = Router::new()
        // Core API Endpoints
        .route("/api/health", get(api::health_handler))
        .route("/api/auth/verify", post(api::auth_verify_handler))
        .route("/api/sync", get(api::sync_get_handler).post(api::sync_post_handler))
        .route("/api/mastermind/recommend", post(api::mastermind_recommend_handler))
        .route("/api/backup/export", get(api::backup_export_handler))
        .route("/api/backup/import", post(api::backup_import_handler))
        // HDD External Storage Endpoints
        .route("/api/hdd/status", get(api::hdd_status_handler))
        .route("/api/hdd/backup", post(api::hdd_backup_now_handler))
        .with_state(state)
        // Static assets fallback (rust-embed)
        .fallback(static_asset_handler)
        .layer(CorsLayer::permissive());

    let addr: SocketAddr = format!("{}:{}", args.host, args.port).parse()?;
    println!("🚀 Server mendengarkan pada http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    println!("👋 Server BUGAR berhenti dengan bersih.");
    Ok(())
}

/// Serve static embedded assets with SPA client routing fallback to index.html
async fn static_asset_handler(uri: Uri) -> Response {
    let mut path = uri.path().trim_start_matches('/').to_string();

    if path.is_empty() {
        path = "index.html".to_string();
    }

    // Try finding exact file
    if let Some(content) = DistAsset::get(&path) {
        let mime = mime_guess::from_path(&path).first_or_octet_stream();
        return (
            StatusCode::OK,
            [
                (header::CONTENT_TYPE, HeaderValue::from_str(mime.as_ref()).unwrap()),
                (header::CACHE_CONTROL, HeaderValue::from_static("public, max-age=31536000, immutable")),
            ],
            content.data,
        )
            .into_response();
    }

    // SPA Fallback: serve index.html for non-asset routes
    if let Some(index) = DistAsset::get("index.html") {
        return (
            StatusCode::OK,
            [
                (header::CONTENT_TYPE, HeaderValue::from_static("text/html; charset=utf-8")),
                (header::CACHE_CONTROL, HeaderValue::from_static("no-cache")),
            ],
            index.data,
        )
            .into_response();
    }

    // Fallback if web/dist hasn't been built yet during dev check
    Html(
        r#"<!DOCTYPE html>
<html>
<head><title>BUGAR Server Ready</title></head>
<body style="font-family:sans-serif;background:#090D16;color:#e2e8f0;text-align:center;padding:50px;">
  <h1>🏋️ BUGAR Edge Server Active</h1>
  <p>Static assets sedang dalam proses build frontend. API backend aktif di <code>/api/health</code>.</p>
</body>
</html>"#
    ).into_response()
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("Gagal mendengarkan sinyal shutdown");
    println!("\n🛑 Menerima sinyal interrupt, mematikan server...");
}
