use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use crate::db::Database;
use crate::models::{SyncPayload, UserProfile};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HddStatus {
    pub path: String,
    pub available: bool,
    pub writable: bool,
    pub last_backup_time: Option<i64>,
    pub files: Vec<String>,
    pub backup_size_bytes: u64,
    pub message: String,
}

#[derive(Clone)]
pub struct HddManager {
    pub base_path: PathBuf,
}

impl HddManager {
    pub fn new(path_str: &str) -> Self {
        Self {
            base_path: PathBuf::from(path_str),
        }
    }

    /// Check if the HDD directory is mounted, accessible, and writable
    pub fn check_status(&self) -> HddStatus {
        let path_str = self.base_path.to_string_lossy().to_string();
        let mut available = self.base_path.exists();
        let mut writable = false;
        let mut files = Vec::new();
        let mut backup_size_bytes = 0;
        let mut last_backup_time = None;

        // Try creating directory if it doesn't exist
        if !available {
            if let Ok(()) = fs::create_dir_all(&self.base_path) {
                available = true;
            }
        }

        if available {
            // Test writability
            let test_file = self.base_path.join(".write_test");
            if fs::write(&test_file, b"ok").is_ok() {
                writable = true;
                let _ = fs::remove_file(test_file);
            }

            // List files in directory
            if let Ok(entries) = fs::read_dir(&self.base_path) {
                for entry in entries.flatten() {
                    let file_name = entry.file_name().to_string_lossy().to_string();
                    if !file_name.starts_with('.') {
                        files.push(file_name);
                    }
                }
            }

            // Check backup_latest.json metadata
            let latest_backup = self.base_path.join("backup_latest.json");
            if let Ok(meta) = fs::metadata(&latest_backup) {
                backup_size_bytes = meta.len();
                if let Ok(modified) = meta.modified() {
                    if let Ok(duration) = modified.duration_since(std::time::UNIX_EPOCH) {
                        last_backup_time = Some(duration.as_millis() as i64);
                    }
                }
            }
        }

        let message = if available && writable {
            format!("Direktori '{}' aktif, terhubung, dan siap untuk backup/restore.", path_str)
        } else if available {
            format!("Direktori '{}' ditemukan tetapi bersifat read-only.", path_str)
        } else {
            format!("Direktori '{}' belum terpasang atau tidak dapat diakses.", path_str)
        };

        HddStatus {
            path: path_str,
            available,
            writable,
            last_backup_time,
            files,
            backup_size_bytes,
            message,
        }
    }

    /// Save human-readable config.json, backup_latest.json, and data_overview.txt
    pub fn write_backup(&self, payload: &SyncPayload) -> std::io::Result<()> {
        if !self.base_path.exists() {
            fs::create_dir_all(&self.base_path)?;
        }

        let exports_dir = self.base_path.join("exports");
        if !exports_dir.exists() {
            let _ = fs::create_dir_all(&exports_dir);
        }

        // 1. Write Human-Readable Config / Profile
        if let Some(ref prof) = payload.profile {
            let config_path = self.base_path.join("config.json");
            let json_str = serde_json::to_string_pretty(prof)
                .unwrap_or_else(|_| "{}".to_string());
            fs::write(config_path, json_str)?;
        }

        // 2. Write Full Snapshot Backup (backup_latest.json)
        let backup_path = self.base_path.join("backup_latest.json");
        let full_json = serde_json::to_string_pretty(payload)
            .unwrap_or_else(|_| "{}".to_string());
        fs::write(&backup_path, &full_json)?;

        // 3. Write Dated Export in exports/
        let timestamp_str = chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string();
        let dated_export_path = exports_dir.join(format!("backup_{}.json", timestamp_str));
        let _ = fs::write(dated_export_path, &full_json);

        // 4. Write Human-Readable Plain Text Overview (data_overview.txt)
        let overview_path = self.base_path.join("data_overview.txt");
        let prof_name = payload.profile.as_ref().map(|p| p.name.as_str()).unwrap_or("Pengguna");
        let target_cals = payload.profile.as_ref().map(|p| p.target_calories).unwrap_or(2000.0);
        let target_prot = payload.profile.as_ref().map(|p| p.target_protein_g).unwrap_or(130.0);
        let target_water = payload.profile.as_ref().map(|p| p.target_water_ml).unwrap_or(2500.0);
        let goal = payload.profile.as_ref().map(|p| p.goal.as_str()).unwrap_or("fat_loss");

        let now_str = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC").to_string();

        let overview_text = format!(
"================================================================================
🏋️ BUGAR - EXTERNAL STORAGE BACKUP & DATA OVERVIEW
Direktori     : {}
Waktu Simpan  : {}
================================================================================

[PROFIL & PENGATURAN PRIBADI]
Nama Pengguna : {}
Target Kalori : {} kcal / hari
Target Protein: {} gram / hari
Target Air    : {} ml / hari
Target Tujuan : {}

[RINGKASAN REKAM DATA TERSIMPAN]
Total Log Makanan      : {} entri
Total Sesi Workout Gym : {} sesi
Total Log Kardio       : {} aktivitas
Total Sesi Fat Burner  : {} sesi
Total Catatan Metrik   : {} catatan
Total Rekam Kebiasaan  : {} hari

[BERKAS DALAM DIREKTORI INI]
1. 'config.json'        -> Pengaturan profil dan target kebugaran (bisa diedit)
2. 'backup_latest.json' -> Snapshot lengkap seluruh database (JSON terstruktur)
3. 'data_overview.txt'  -> Berkas ringkasan ini (bisa dibaca langsung oleh manusia)
4. 'exports/'           -> Direktori arsip backup bertanggal

[PANDUAN PEMULIHAN (DISASTER RECOVERY)]
Jika sistem ODROID-C2 mengalami kerusakan, instal ulang service BUGAR,
dan sistem akan secara otomatis memulihkan seluruh data dari 'backup_latest.json'.
Anda juga dapat mengimpor file ini secara manual dari Web UI (Pengaturan -> Impor File).
================================================================================
",
            self.base_path.display(),
            now_str,
            prof_name,
            target_cals as i64,
            target_prot as i64,
            target_water as i64,
            goal,
            payload.food_logs.len(),
            payload.workout_logs.len(),
            payload.cardio_logs.len(),
            payload.fat_burner_logs.len(),
            payload.body_metric_logs.len(),
            payload.daily_habit_logs.len()
        );

        let _ = fs::write(overview_path, overview_text);
        Ok(())
    }

    /// Try to auto-recover data into SQLite if the SQLite database is empty
    pub fn try_recover_empty_db(&self, db: &mut Database) -> bool {
        // Check if database has any profile
        if let Ok(snapshot) = db.get_full_snapshot() {
            if snapshot.profile.is_some() || !snapshot.food_logs.is_empty() {
                return false; // Database already has data, no recovery needed
            }
        }

        let latest_backup = self.base_path.join("backup_latest.json");
        if latest_backup.exists() {
            if let Ok(content) = fs::read_to_string(&latest_backup) {
                if let Ok(payload) = serde_json::from_str::<SyncPayload>(&content) {
                    println!("🔄 Memulihkan data dari backup eksternal: {}", latest_backup.display());
                    if let Ok(count) = db.apply_sync_payload(&payload) {
                        println!("✅ Sukses memulihkan {} entitas dari {}", count, latest_backup.display());
                        return true;
                    }
                }
            }
        }

        // Fallback: try config.json
        let config_file = self.base_path.join("config.json");
        if config_file.exists() {
            if let Ok(content) = fs::read_to_string(&config_file) {
                if let Ok(prof) = serde_json::from_str::<UserProfile>(&content) {
                    println!("🔄 Memulihkan profil dari {}", config_file.display());
                    let payload = SyncPayload {
                        profile: Some(prof),
                        client_timestamp: chrono::Utc::now().timestamp_millis(),
                        ..Default::default()
                    };
                    let _ = db.apply_sync_payload(&payload);
                    return true;
                }
            }
        }

        false
    }
}
