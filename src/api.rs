use axum::{
    extract::{Path, Query, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
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
use crate::hdd::{HddManager, HddStatus};
use crate::mastermind::MastermindSolver;
use crate::models::*;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Mutex<Database>>,
    pub hdd: HddManager,
    pub start_time: Instant,
    pub pin_hash: Option<String>,
    pub latest_cast: Arc<Mutex<Option<WorkoutCastEvent>>>,
}

impl AppState {
    pub fn new(db: Database, hdd_path: &str) -> Self {
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
            hdd: HddManager::new(hdd_path),
            start_time: Instant::now(),
            pin_hash,
            latest_cast: Arc::new(Mutex::new(None)),
        }
    }

    pub fn hash_password(password: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(b"bugar_salt_2026_");
        hasher.update(password.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    pub fn verify_token(&self, headers: &HeaderMap) -> bool {
        if self.pin_hash.is_none() {
            return true; // No PIN configured, allow access
        }
        if let Some(auth) = headers.get(header::AUTHORIZATION) {
            if let Ok(val) = auth.to_str() {
                if let Some(token) = val.strip_prefix("Bearer ") {
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

/// POST /api/auth/register
pub async fn auth_register_handler(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> (StatusCode, Json<AuthAccountResponse>) {
    let username = req.username.trim();
    let display_name = if req.display_name.trim().is_empty() {
        username.to_string()
    } else {
        req.display_name.trim().to_string()
    };

    if username.len() < 3 || req.password.len() < 4 {
        return (
            StatusCode::BAD_REQUEST,
            Json(AuthAccountResponse {
                success: false,
                token: None,
                user_id: None,
                username: None,
                display_name: None,
                message: "Username minimal 3 karakter dan password minimal 4 karakter.".to_string(),
            }),
        );
    }

    let mut db = match state.db.lock() {
        Ok(guard) => guard,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(AuthAccountResponse {
                    success: false,
                    token: None,
                    user_id: None,
                    username: None,
                    display_name: None,
                    message: "Database lock error".to_string(),
                }),
            )
        }
    };

    // Check if username already exists
    if let Ok(Some(_)) = db.find_account_by_username(username) {
        return (
            StatusCode::CONFLICT,
            Json(AuthAccountResponse {
                success: false,
                token: None,
                user_id: None,
                username: None,
                display_name: None,
                message: format!("Username '{}' sudah terdaftar. Silakan gunakan nama lain atau login.", username),
            }),
        );
    }

    let password_hash = AppState::hash_password(&req.password);
    match db.create_account(username, &password_hash, &display_name) {
        Ok(account) => {
            // Also initialize custom user profile for this user ID
            let user_profile = UserProfile {
                id: account.id.clone(),
                name: account.display_name.clone(),
                age: req.age.unwrap_or(28),
                gender: req.gender.unwrap_or_else(|| "male".to_string()),
                height_cm: req.height_cm.unwrap_or(172.0),
                weight_kg: req.weight_kg.unwrap_or(70.0),
                activity_level: 1.375,
                goal: req.goal.unwrap_or_else(|| "fat_loss".to_string()),
                target_calories: 2000.0,
                target_protein_g: 130.0,
                target_carbs_g: 220.0,
                target_fat_g: 55.0,
                target_water_ml: 2500.0,
                updated_at: chrono::Utc::now().timestamp_millis(),
            };
            let mut sync_payload = SyncPayload::default();
            sync_payload.profile = Some(user_profile);
            let _ = db.apply_sync_payload(&sync_payload);

            let token = db.create_session(&account.id).unwrap_or_else(|_| format!("tok-{}", uuid::Uuid::new_v4()));

            (
                StatusCode::CREATED,
                Json(AuthAccountResponse {
                    success: true,
                    token: Some(token),
                    user_id: Some(account.id),
                    username: Some(account.username),
                    display_name: Some(account.display_name),
                    message: "Akun berhasil dibuat dan otomatis masuk.".to_string(),
                }),
            )
        }
        Err(e) => {
            eprintln!("Error creating account: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(AuthAccountResponse {
                    success: false,
                    token: None,
                    user_id: None,
                    username: None,
                    display_name: None,
                    message: "Gagal menyimpan akun ke database.".to_string(),
                }),
            )
        }
    }
}

/// POST /api/auth/login
pub async fn auth_login_handler(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> (StatusCode, Json<AuthAccountResponse>) {
    let username = req.username.trim();
    let db = match state.db.lock() {
        Ok(guard) => guard,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(AuthAccountResponse {
                    success: false,
                    token: None,
                    user_id: None,
                    username: None,
                    display_name: None,
                    message: "Database lock error".to_string(),
                }),
            )
        }
    };

    let account = match db.find_account_by_username(username) {
        Ok(Some(acc)) => acc,
        _ => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(AuthAccountResponse {
                    success: false,
                    token: None,
                    user_id: None,
                    username: None,
                    display_name: None,
                    message: "Username atau kata sandi tidak sesuai.".to_string(),
                }),
            );
        }
    };

    let input_hash = AppState::hash_password(&req.password);
    if account.password_hash != input_hash {
        return (
            StatusCode::UNAUTHORIZED,
            Json(AuthAccountResponse {
                success: false,
                token: None,
                user_id: None,
                username: None,
                display_name: None,
                message: "Username atau kata sandi tidak sesuai.".to_string(),
            }),
        );
    }

    let token = db.create_session(&account.id).unwrap_or_else(|_| format!("tok-{}", uuid::Uuid::new_v4()));

    (
        StatusCode::OK,
        Json(AuthAccountResponse {
            success: true,
            token: Some(token),
            user_id: Some(account.id),
            username: Some(account.username),
            display_name: Some(account.display_name),
            message: "Login berhasil.".to_string(),
        }),
    )
}

/// GET /api/auth/me
pub async fn auth_me_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> (StatusCode, Json<AuthAccountResponse>) {
    let auth_header = match headers.get(header::AUTHORIZATION).and_then(|h| h.to_str().ok()) {
        Some(val) => val,
        None => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(AuthAccountResponse {
                    success: false,
                    token: None,
                    user_id: None,
                    username: None,
                    display_name: None,
                    message: "Token autentikasi tidak ditemukan.".to_string(),
                }),
            );
        }
    };

    let token = auth_header.trim_start_matches("Bearer ").trim();
    let db = match state.db.lock() {
        Ok(guard) => guard,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(AuthAccountResponse {
                    success: false,
                    token: None,
                    user_id: None,
                    username: None,
                    display_name: None,
                    message: "Database lock error".to_string(),
                }),
            )
        }
    };

    match db.verify_session(token) {
        Ok(Some(account)) => (
            StatusCode::OK,
            Json(AuthAccountResponse {
                success: true,
                token: Some(token.to_string()),
                user_id: Some(account.id),
                username: Some(account.username),
                display_name: Some(account.display_name),
                message: "Sesi valid.".to_string(),
            }),
        ),
        _ => (
            StatusCode::UNAUTHORIZED,
            Json(AuthAccountResponse {
                success: false,
                token: None,
                user_id: None,
                username: None,
                display_name: None,
                message: "Sesi telah kedaluwarsa atau tidak valid. Silakan login kembali.".to_string(),
            }),
        ),
    }
}

/// POST /api/auth/logout
pub async fn auth_logout_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> (StatusCode, Json<AuthAccountResponse>) {
    if let Some(auth_val) = headers.get(header::AUTHORIZATION).and_then(|h| h.to_str().ok()) {
        let token = auth_val.trim_start_matches("Bearer ").trim();
        if let Ok(db) = state.db.lock() {
            let _ = db.delete_session(token);
        }
    }

    (
        StatusCode::OK,
        Json(AuthAccountResponse {
            success: true,
            token: None,
            user_id: None,
            username: None,
            display_name: None,
            message: "Berhasil keluar dari sesi akun.".to_string(),
        }),
    )
}

/// POST /api/cast/event
pub async fn workout_cast_event_handler(
    State(state): State<AppState>,
    Json(event): Json<WorkoutCastEvent>,
) -> (StatusCode, Json<serde_json::Value>) {
    if let Ok(mut lock) = state.latest_cast.lock() {
        *lock = Some(event);
    }
    (StatusCode::OK, Json(serde_json::json!({ "success": true })))
}

/// GET /api/cast/status
pub async fn workout_cast_status_handler(
    State(state): State<AppState>,
) -> Json<Option<WorkoutCastEvent>> {
    let cast = state.latest_cast.lock().map(|l| l.clone()).unwrap_or(None);
    Json(cast)
}

/// POST /api/health-connect/sync
pub async fn health_connect_sync_handler(
    State(state): State<AppState>,
    Json(payload): Json<HealthConnectPayload>,
) -> (StatusCode, Json<serde_json::Value>) {
    let db = match state.db.lock() {
        Ok(guard) => guard,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "success": false, "error": "Database lock failure" })),
            );
        }
    };

    match db.save_health_connect_log(&payload) {
        Ok(_) => (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Data kesehatan dari {} berhasil disinkronisasi.", payload.source)
            })),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "success": false, "error": format!("{:?}", e) })),
        ),
    }
}

/// GET /api/health-connect/status
pub async fn health_connect_status_handler(
    State(_state): State<AppState>,
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "apple_health_ready": true,
        "google_fit_ready": true,
        "web_bluetooth_ready": true,
        "endpoint_webhook": "/api/health-connect/sync"
    }))
}

#[derive(Debug, serde::Deserialize)]
pub struct SyncQuery {
    pub user_id: Option<String>,
}

/// GET /api/sync
pub async fn sync_get_handler(
    State(state): State<AppState>,
    Query(query): Query<SyncQuery>,
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

    let snap = match query.user_id {
        Some(ref uid) if !uid.trim().is_empty() => db.get_user_snapshot(uid),
        _ => db.get_full_snapshot(),
    };

    snap.map(Json).map_err(|e| {
        eprintln!("Error fetching snapshot: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Gagal mengambil snapshot database")
    })
}

/// GET /api/media/*path
pub async fn media_file_handler(
    State(state): State<AppState>,
    Path(path): Path<String>,
) -> Result<Response, (StatusCode, &'static str)> {
    let clean_path = path.trim_start_matches('/').replace("..", "");
    let hdd_media = std::path::Path::new(&state.hdd.base_path).join("media").join(&clean_path);
    if hdd_media.exists() && hdd_media.is_file() {
        if let Ok(bytes) = fs::read(&hdd_media) {
            let mime = mime_guess::from_path(&clean_path).first_or_octet_stream();
            let res = Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, HeaderValue::from_str(mime.as_ref()).unwrap_or(HeaderValue::from_static("application/octet-stream")))
                .header(header::CACHE_CONTROL, "public, max-age=86400")
                .body(axum::body::Body::from(bytes))
                .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Response builder error"))?;
            return Ok(res);
        }
    }
    Err((StatusCode::NOT_FOUND, "Media file not found on HDD"))
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
        Ok(count) => {
            // Mirror to external HDD (/mnt/hdd1/bugar) if accessible
            if let Ok(full_snap) = db.get_full_snapshot() {
                let _ = state.hdd.write_backup(&full_snap);
            }

            Ok(Json(SyncResponse {
                success: true,
                server_timestamp: chrono::Utc::now().timestamp_millis(),
                applied_count: count,
                message: format!("Berhasil sinkronisasi {} entitas.", count),
            }))
        }
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

    // Also mirror to HDD
    let _ = state.hdd.write_backup(&snapshot);

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

/// POST /api/backup/import
pub async fn backup_import_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(req): Json<ImportBackupRequest>,
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

    let res = if req.replace_all {
        db.replace_full_snapshot(&req.payload)
    } else {
        db.apply_sync_payload(&req.payload)
    };

    match res {
        Ok(count) => {
            // Write to HDD backup directory immediately
            if let Ok(full_snap) = db.get_full_snapshot() {
                let _ = state.hdd.write_backup(&full_snap);
            }

            let mode_str = if req.replace_all { "timpa bersih" } else { "gabungkan" };
            Ok(Json(SyncResponse {
                success: true,
                server_timestamp: chrono::Utc::now().timestamp_millis(),
                applied_count: count,
                message: format!("Berhasil memulihkan ({}) {} entitas data.", mode_str, count),
            }))
        }
        Err(e) => {
            eprintln!("Error importing backup payload: {:?}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, "Gagal memproses file backup"))
        }
    }
}

/// GET /api/hdd/status
pub async fn hdd_status_handler(State(state): State<AppState>) -> Json<HddStatus> {
    let status = state.hdd.check_status();
    Json(status)
}

/// POST /api/hdd/backup
pub async fn hdd_backup_now_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<HddStatus>, (StatusCode, &'static str)> {
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
            "Gagal membaca snapshot database",
        )
    })?;

    state.hdd.write_backup(&snapshot).map_err(|e| {
        eprintln!("Error writing backup to HDD: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Gagal menulis backup ke /mnt/hdd1/bugar")
    })?;

    Ok(Json(state.hdd.check_status()))
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
