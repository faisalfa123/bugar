mod api;
mod db;
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
struct Args {
    /// Port to listen on
    #[arg(short, long, default_value_t = 8080, env = "BUGAR_PORT")]
    port: u16,

    /// Path to SQLite database file
    #[arg(short, long, default_value = "bugar.db", env = "BUGAR_DB_PATH")]
    db: String,

    /// Bind host address
    #[arg(long, default_value = "0.0.0.0", env = "BUGAR_HOST")]
    host: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();

    println!("==========================================================");
    println!("  🏋️ BUGAR Edge Server v{}", env!("CARGO_PKG_VERSION"));
    println!("  Arsitektur : {}", std::env::consts::ARCH);
    println!("  Database   : {}", args.db);
    println!("==========================================================");

    // Initialize Database
    let database = Database::open(&args.db)
        .map_err(|e| format!("Gagal menginisialisasi SQLite database: {:?}", e))?;
    println!("✅ SQLite database siap (WAL Mode, synchronous NORMAL).");

    let state = AppState::new(database);
    if state.pin_hash.is_some() {
        println!("🔒 Proteksi PIN aktif (BUGAR_PIN terdeteksi).");
    } else {
        println!("ℹ️ Akses terbuka (BUGAR_PIN tidak disetel).");
    }

    // Configure Routes
    let app = Router::new()
        // API Endpoints
        .route("/api/health", get(api::health_handler))
        .route("/api/auth/verify", post(api::auth_verify_handler))
        .route("/api/sync", get(api::sync_get_handler).post(api::sync_post_handler))
        .route("/api/mastermind/recommend", post(api::mastermind_recommend_handler))
        .route("/api/backup/export", get(api::backup_export_handler))
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

    // Placeholder if web/dist hasn't been built yet during dev check
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
