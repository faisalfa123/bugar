use axum::{
    extract::State,
    http::{header, HeaderMap, StatusCode},
    response::Response,
    Json,
};
use sha2::{Digest, Sha256};
use std::{
    fs,
    sync::{Arc, Mutex},
    time::Instant,
};

use crate::db::Database;
use crate::mastermind::MastermindSolver;
use crate::models::*;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Mutex<Database>>,
    pub start_time: Instant,
    pub pin_hash: Option<String>,
}

impl AppState {
    pub fn new(db: Database) -> Self {
        let pin_hash = std::env::var("BUGAR_PIN")
            .ok()
            .filter(|p| !p.trim().is_empty())
            .map(|p| {
                let mut hasher = Sha256::new();
                hasher.update(p.trim().as_bytes());
                format!("{:x}", hasher.finalize())
            });

        Self {
            db: Arc::new(Mutex::new(db)),
            start_time: Instant::now(),
            pin_hash,
        }
    }

    pub fn verify_token(&self, headers: &HeaderMap) -> bool {
        if self.pin_hash.is_none() {
            return true; // No PIN configured, allow access
        }
        if let Some(auth) = headers.get(header::AUTHORIZATION) {
            if let Ok(val) = auth.to_str() {
                if let Some(token) = val.strip_prefix("Bearer ") {
                    // Check against current pin hash
                    if let Some(ref expected) = self.pin_hash {
                        return token == expected;
                    }
                }
            }
        }
        false
    }
}

/// GET /api/health
pub async fn health_handler(State(state): State<AppState>) -> Json<ServerHealth> {
    let uptime = state.start_time.elapsed().as_secs();
    let (rss_kb, vms_kb) = read_proc_memory();

    Json(ServerHealth {
        status: "healthy".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        arch: std::env::consts::ARCH.to_string(),
        uptime_secs: uptime,
        memory_rss_kb: rss_kb,
        memory_vms_kb: vms_kb,
        pin_protected: state.pin_hash.is_some(),
    })
}

/// POST /api/auth/verify
pub async fn auth_verify_handler(
    State(state): State<AppState>,
    Json(payload): Json<AuthVerifyRequest>,
) -> (StatusCode, Json<AuthVerifyResponse>) {
    match &state.pin_hash {
        None => (
            StatusCode::OK,
            Json(AuthVerifyResponse {
                success: true,
                token: Some("open-access".to_string()),
                message: "Server tidak memerlukan PIN akses.".to_string(),
            }),
        ),
        Some(expected_hash) => {
            let mut hasher = Sha256::new();
            hasher.update(payload.pin.trim().as_bytes());
            let input_hash = format!("{:x}", hasher.finalize());

            if input_hash == *expected_hash {
                (
                    StatusCode::OK,
                    Json(AuthVerifyResponse {
                        success: true,
                        token: Some(input_hash),
                        message: "Autentikasi PIN berhasil.".to_string(),
                    }),
                )
            } else {
                (
                    StatusCode::UNAUTHORIZED,
                    Json(AuthVerifyResponse {
                        success: false,
                        token: None,
                        message: "PIN yang dimasukkan salah. Silakan coba lagi.".to_string(),
                    }),
                )
            }
        }
    }
}

/// GET /api/sync
pub async fn sync_get_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<SyncPayload>, (StatusCode, &'static str)> {
    if !state.verify_token(&headers) {
        return Err((StatusCode::UNAUTHORIZED, "Unauthorized: PIN required"));
    }

    let db = state.db.lock().map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Database lock failure",
        )
    })?;

    db.get_full_snapshot().map(Json).map_err(|e| {
        eprintln!("Error fetching snapshot: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Gagal mengambil snapshot database")
    })
}

/// POST /api/sync
pub async fn sync_post_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<SyncPayload>,
) -> Result<Json<SyncResponse>, (StatusCode, &'static str)> {
    if !state.verify_token(&headers) {
        return Err((StatusCode::UNAUTHORIZED, "Unauthorized: PIN required"));
    }

    let mut db = state.db.lock().map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Database lock failure",
        )
    })?;

    match db.apply_sync_payload(&payload) {
        Ok(count) => Ok(Json(SyncResponse {
            success: true,
            server_timestamp: chrono::Utc::now().timestamp_millis(),
            applied_count: count,
            message: format!("Berhasil sinkronisasi {} entitas.", count),
        })),
        Err(e) => {
            eprintln!("Error applying sync payload: {:?}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, "Gagal menerapkan sinkronisasi"))
        }
    }
}

/// POST /api/mastermind/recommend
pub async fn mastermind_recommend_handler(
    Json(req): Json<MastermindRequest>,
) -> Json<MastermindRecommendation> {
    let rec = MastermindSolver::solve(&req);
    Json(rec)
}

/// GET /api/backup/export
pub async fn backup_export_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Response, (StatusCode, &'static str)> {
    if !state.verify_token(&headers) {
        return Err((StatusCode::UNAUTHORIZED, "Unauthorized: PIN required"));
    }

    let db = state.db.lock().map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Database lock failure",
        )
    })?;

    let snapshot = db.get_full_snapshot().map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Gagal mengekspor data",
        )
    })?;

    let json_bytes = serde_json::to_vec_pretty(&snapshot).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Gagal serialisasi data",
        )
    })?;

    let filename = format!(
        "bugar-backup-{}.json",
        chrono::Utc::now().format("%Y%m%d-%H%M%S")
    );

    let res = Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "application/json")
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{}\"", filename),
        )
        .body(axum::body::Body::from(json_bytes))
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Gagal menyusun response file",
            )
        })?;

    Ok(res)
}

/// Helper function to read current process memory from /proc/self/status on Linux
fn read_proc_memory() -> (u64, u64) {
    let mut rss = 0;
    let mut vms = 0;

    if let Ok(content) = fs::read_to_string("/proc/self/status") {
        for line in content.lines() {
            if line.starts_with("VmRSS:") {
                if let Some(val) = line
                    .split_whitespace()
                    .nth(1)
                    .and_then(|s| s.parse::<u64>().ok())
                {
                    rss = val;
                }
            } else if line.starts_with("VmSize:") {
                if let Some(val) = line
                    .split_whitespace()
                    .nth(1)
                    .and_then(|s| s.parse::<u64>().ok())
                {
                    vms = val;
                }
            }
        }
    }
    (rss, vms)
}
