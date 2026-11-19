use rusqlite::{params, Connection, Result};
use std::path::Path;
use crate::models::*;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn open<P: AsRef<Path>>(path: P) -> Result<Self> {
        let p = path.as_ref();
        if let Some(parent) = p.parent() {
            if !parent.as_os_str().is_empty() {
                let _ = std::fs::create_dir_all(parent);
            }
        }
        let conn = Connection::open(p)?;

        // ODROID-C2 & Flash Storage Optimizations (RAM 2GB, eMMC/MicroSD protection)
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA synchronous = NORMAL;
             PRAGMA temp_store = MEMORY;
             PRAGMA cache_size = -2000;
             PRAGMA busy_timeout = 5000;
             PRAGMA foreign_keys = ON;"
        )?;

        let db = Database { conn };
        db.init_schema()?;
        Ok(db)
    }

    fn init_schema(&self) -> Result<()> {
        self.conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS user_profiles (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                height_cm REAL NOT NULL,
                weight_kg REAL NOT NULL,
                activity_level REAL NOT NULL,
                goal TEXT NOT NULL,
                target_calories REAL NOT NULL,
                target_protein_g REAL NOT NULL,
                target_carbs_g REAL NOT NULL,
                target_fat_g REAL NOT NULL,
                target_water_ml REAL NOT NULL,
                updated_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS food_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                date TEXT NOT NULL,
                meal_type TEXT NOT NULL,
                food_name TEXT NOT NULL,
                serving_count REAL NOT NULL,
                serving_unit TEXT NOT NULL,
                calories REAL NOT NULL,
                protein_g REAL NOT NULL,
                carbs_g REAL NOT NULL,
                fat_g REAL NOT NULL,
                updated_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_food_logs_date ON food_logs(date);
            CREATE INDEX IF NOT EXISTS idx_food_logs_user ON food_logs(user_id);

            CREATE TABLE IF NOT EXISTS workout_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                date TEXT NOT NULL,
                routine_name TEXT NOT NULL,
                exercises_json TEXT NOT NULL,
                duration_minutes INTEGER NOT NULL,
                total_volume_kg REAL NOT NULL,
                notes TEXT,
                is_pr INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON workout_logs(date);

            CREATE TABLE IF NOT EXISTS cardio_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                date TEXT NOT NULL,
                activity_type TEXT NOT NULL,
                distance_km REAL NOT NULL,
                duration_minutes REAL NOT NULL,
                pace_min_km REAL NOT NULL,
                avg_speed_kmh REAL NOT NULL,
                calories_burned REAL NOT NULL,
                updated_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_cardio_logs_date ON cardio_logs(date);

            CREATE TABLE IF NOT EXISTS fat_burner_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                date TEXT NOT NULL,
                program_id TEXT NOT NULL,
                program_name TEXT NOT NULL,
                duration_seconds INTEGER NOT NULL,
                calories_burned REAL NOT NULL,
                completed INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_fat_burner_logs_date ON fat_burner_logs(date);

            CREATE TABLE IF NOT EXISTS body_metric_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                date TEXT NOT NULL,
                weight_kg REAL NOT NULL,
                neck_cm REAL,
                waist_cm REAL,
                hip_cm REAL,
                bmi REAL NOT NULL,
                body_fat_pct REAL,
                updated_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_body_metric_logs_date ON body_metric_logs(date);

            CREATE TABLE IF NOT EXISTS daily_habit_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                date TEXT NOT NULL,
                water_ml REAL NOT NULL,
                sleep_minutes INTEGER NOT NULL,
                sleep_quality INTEGER NOT NULL,
                steps INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_daily_habit_logs_date ON daily_habit_logs(date);

            CREATE TABLE IF NOT EXISTS accounts (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                display_name TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);

            CREATE TABLE IF NOT EXISTS auth_sessions (
                token TEXT PRIMARY KEY,
                account_id TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_sessions_token ON auth_sessions(token);

            CREATE TABLE IF NOT EXISTS health_connect_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                source TEXT NOT NULL,
                date TEXT NOT NULL,
                steps INTEGER,
                active_calories REAL,
                heart_rate_avg INTEGER,
                sleep_minutes INTEGER,
                distance_km REAL,
                updated_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_health_connect_user_date ON health_connect_logs(user_id, date);"
        )?;
        Ok(())
    }

    /// Transactional batch Last-Write-Wins (LWW) sync
    pub fn apply_sync_payload(&mut self, payload: &SyncPayload) -> Result<usize> {
        let tx = self.conn.transaction()?;
        let mut count = 0;

        if let Some(ref p) = payload.profile {
            let mut stmt = tx.prepare(
                "INSERT INTO user_profiles (id, name, age, gender, height_cm, weight_kg, activity_level, goal, target_calories, target_protein_g, target_carbs_g, target_fat_g, target_water_ml, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
                 ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name, age = excluded.age, gender = excluded.gender,
                    height_cm = excluded.height_cm, weight_kg = excluded.weight_kg,
                    activity_level = excluded.activity_level, goal = excluded.goal,
                    target_calories = excluded.target_calories, target_protein_g = excluded.target_protein_g,
                    target_carbs_g = excluded.target_carbs_g, target_fat_g = excluded.target_fat_g,
                    target_water_ml = excluded.target_water_ml, updated_at = excluded.updated_at
                 WHERE excluded.updated_at > user_profiles.updated_at;"
            )?;
            stmt.execute(params![
                p.id, p.name, p.age, p.gender, p.height_cm, p.weight_kg,
                p.activity_level, p.goal, p.target_calories, p.target_protein_g,
                p.target_carbs_g, p.target_fat_g, p.target_water_ml, p.updated_at
            ])?;
            count += 1;
        }

        {
            let mut stmt = tx.prepare(
                "INSERT INTO food_logs (id, user_id, date, meal_type, food_name, serving_count, serving_unit, calories, protein_g, carbs_g, fat_g, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
                 ON CONFLICT(id) DO UPDATE SET
                    user_id = excluded.user_id, date = excluded.date, meal_type = excluded.meal_type,
                    food_name = excluded.food_name, serving_count = excluded.serving_count,
                    serving_unit = excluded.serving_unit, calories = excluded.calories,
                    protein_g = excluded.protein_g, carbs_g = excluded.carbs_g, fat_g = excluded.fat_g,
                    updated_at = excluded.updated_at
                 WHERE excluded.updated_at > food_logs.updated_at;"
            )?;
            for item in &payload.food_logs {
                stmt.execute(params![
                    item.id, item.user_id, item.date, item.meal_type, item.food_name,
                    item.serving_count, item.serving_unit, item.calories, item.protein_g,
                    item.carbs_g, item.fat_g, item.updated_at
                ])?;
                count += 1;
            }
        }

        {
            let mut stmt = tx.prepare(
                "INSERT INTO workout_logs (id, user_id, date, routine_name, exercises_json, duration_minutes, total_volume_kg, notes, is_pr, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
                 ON CONFLICT(id) DO UPDATE SET
                    user_id = excluded.user_id, date = excluded.date, routine_name = excluded.routine_name,
                    exercises_json = excluded.exercises_json, duration_minutes = excluded.duration_minutes,
                    total_volume_kg = excluded.total_volume_kg, notes = excluded.notes,
                    is_pr = excluded.is_pr, updated_at = excluded.updated_at
                 WHERE excluded.updated_at > workout_logs.updated_at;"
            )?;
            for item in &payload.workout_logs {
                let exercises_json = serde_json::to_string(&item.exercises).unwrap_or_else(|_| "[]".to_string());
                stmt.execute(params![
                    item.id, item.user_id, item.date, item.routine_name, exercises_json,
                    item.duration_minutes, item.total_volume_kg, item.notes,
                    if item.is_pr { 1 } else { 0 }, item.updated_at
                ])?;
                count += 1;
            }
        }

        {
            let mut stmt = tx.prepare(
                "INSERT INTO cardio_logs (id, user_id, date, activity_type, distance_km, duration_minutes, pace_min_km, avg_speed_kmh, calories_burned, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
                 ON CONFLICT(id) DO UPDATE SET
                    user_id = excluded.user_id, date = excluded.date, activity_type = excluded.activity_type,
                    distance_km = excluded.distance_km, duration_minutes = excluded.duration_minutes,
                    pace_min_km = excluded.pace_min_km, avg_speed_kmh = excluded.avg_speed_kmh,
                    calories_burned = excluded.calories_burned, updated_at = excluded.updated_at
                 WHERE excluded.updated_at > cardio_logs.updated_at;"
            )?;
            for item in &payload.cardio_logs {
                stmt.execute(params![
                    item.id, item.user_id, item.date, item.activity_type,
                    item.distance_km, item.duration_minutes, item.pace_min_km,
                    item.avg_speed_kmh, item.calories_burned, item.updated_at
                ])?;
                count += 1;
            }
        }

        {
            let mut stmt = tx.prepare(
                "INSERT INTO fat_burner_logs (id, user_id, date, program_id, program_name, duration_seconds, calories_burned, completed, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
                 ON CONFLICT(id) DO UPDATE SET
                    user_id = excluded.user_id, date = excluded.date, program_id = excluded.program_id,
                    program_name = excluded.program_name, duration_seconds = excluded.duration_seconds,
                    calories_burned = excluded.calories_burned, completed = excluded.completed,
                    updated_at = excluded.updated_at
                 WHERE excluded.updated_at > fat_burner_logs.updated_at;"
            )?;
            for item in &payload.fat_burner_logs {
                stmt.execute(params![
                    item.id, item.user_id, item.date, item.program_id, item.program_name,
                    item.duration_seconds, item.calories_burned,
                    if item.completed { 1 } else { 0 }, item.updated_at
                ])?;
                count += 1;
            }
        }

        {
            let mut stmt = tx.prepare(
                "INSERT INTO body_metric_logs (id, user_id, date, weight_kg, neck_cm, waist_cm, hip_cm, bmi, body_fat_pct, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
                 ON CONFLICT(id) DO UPDATE SET
                    user_id = excluded.user_id, date = excluded.date, weight_kg = excluded.weight_kg,
                    neck_cm = excluded.neck_cm, waist_cm = excluded.waist_cm, hip_cm = excluded.hip_cm,
                    bmi = excluded.bmi, body_fat_pct = excluded.body_fat_pct, updated_at = excluded.updated_at
                 WHERE excluded.updated_at > body_metric_logs.updated_at;"
            )?;
            for item in &payload.body_metric_logs {
                stmt.execute(params![
                    item.id, item.user_id, item.date, item.weight_kg, item.neck_cm,
                    item.waist_cm, item.hip_cm, item.bmi, item.body_fat_pct, item.updated_at
                ])?;
                count += 1;
            }
        }

        {
            let mut stmt = tx.prepare(
                "INSERT INTO daily_habit_logs (id, user_id, date, water_ml, sleep_minutes, sleep_quality, steps, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
                 ON CONFLICT(id) DO UPDATE SET
                    user_id = excluded.user_id, date = excluded.date, water_ml = excluded.water_ml,
                    sleep_minutes = excluded.sleep_minutes, sleep_quality = excluded.sleep_quality,
                    steps = excluded.steps, updated_at = excluded.updated_at
                 WHERE excluded.updated_at > daily_habit_logs.updated_at;"
            )?;
            for item in &payload.daily_habit_logs {
                stmt.execute(params![
                    item.id, item.user_id, item.date, item.water_ml, item.sleep_minutes,
                    item.sleep_quality, item.steps, item.updated_at
                ])?;
                count += 1;
            }
        }

        tx.commit()?;
        Ok(count)
    }

    /// Clean overwrite all tables with provided snapshot
    pub fn replace_full_snapshot(&mut self, payload: &SyncPayload) -> Result<usize> {
        let tx = self.conn.transaction()?;
        tx.execute_batch(
            "DELETE FROM user_profiles;
             DELETE FROM food_logs;
             DELETE FROM workout_logs;
             DELETE FROM cardio_logs;
             DELETE FROM fat_burner_logs;
             DELETE FROM body_metric_logs;
             DELETE FROM daily_habit_logs;"
        )?;
        tx.commit()?;

        self.apply_sync_payload(payload)
    }

    /// Retrieve complete snapshot of user data
    pub fn get_full_snapshot(&self) -> Result<SyncPayload> {
        let mut payload = SyncPayload {
            client_timestamp: chrono::Utc::now().timestamp_millis(),
            ..Default::default()
        };

        // User Profile
        {
            let mut stmt = self.conn.prepare("SELECT id, name, age, gender, height_cm, weight_kg, activity_level, goal, target_calories, target_protein_g, target_carbs_g, target_fat_g, target_water_ml, updated_at FROM user_profiles LIMIT 1")?;
            let mut rows = stmt.query([])?;
            if let Some(row) = rows.next()? {
                payload.profile = Some(UserProfile {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    age: row.get(2)?,
                    gender: row.get(3)?,
                    height_cm: row.get(4)?,
                    weight_kg: row.get(5)?,
                    activity_level: row.get(6)?,
                    goal: row.get(7)?,
                    target_calories: row.get(8)?,
                    target_protein_g: row.get(9)?,
                    target_carbs_g: row.get(10)?,
                    target_fat_g: row.get(11)?,
                    target_water_ml: row.get(12)?,
                    updated_at: row.get(13)?,
                });
            }
        }

        // Food logs
        {
            let mut stmt = self.conn.prepare("SELECT id, user_id, date, meal_type, food_name, serving_count, serving_unit, calories, protein_g, carbs_g, fat_g, updated_at FROM food_logs ORDER BY date DESC, updated_at DESC")?;
            let rows = stmt.query_map([], |row| {
                Ok(FoodLog {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    date: row.get(2)?,
                    meal_type: row.get(3)?,
                    food_name: row.get(4)?,
                    serving_count: row.get(5)?,
                    serving_unit: row.get(6)?,
                    calories: row.get(7)?,
                    protein_g: row.get(8)?,
                    carbs_g: row.get(9)?,
                    fat_g: row.get(10)?,
                    updated_at: row.get(11)?,
                })
            })?;
            for item in rows {
                payload.food_logs.push(item?);
            }
        }

        // Workout logs
        {
            let mut stmt = self.conn.prepare("SELECT id, user_id, date, routine_name, exercises_json, duration_minutes, total_volume_kg, notes, is_pr, updated_at FROM workout_logs ORDER BY date DESC")?;
            let rows = stmt.query_map([], |row| {
                let json_str: String = row.get(4)?;
                let exercises: Vec<ExerciseItem> = serde_json::from_str(&json_str).unwrap_or_default();
                let is_pr_val: i64 = row.get(8)?;
                Ok(WorkoutLog {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    date: row.get(2)?,
                    routine_name: row.get(3)?,
                    exercises,
                    duration_minutes: row.get(5)?,
                    total_volume_kg: row.get(6)?,
                    notes: row.get(7)?,
                    is_pr: is_pr_val != 0,
                    updated_at: row.get(9)?,
                })
            })?;
            for item in rows {
                payload.workout_logs.push(item?);
            }
        }

        // Cardio logs
        {
            let mut stmt = self.conn.prepare("SELECT id, user_id, date, activity_type, distance_km, duration_minutes, pace_min_km, avg_speed_kmh, calories_burned, updated_at FROM cardio_logs ORDER BY date DESC")?;
            let rows = stmt.query_map([], |row| {
                Ok(CardioLog {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    date: row.get(2)?,
                    activity_type: row.get(3)?,
                    distance_km: row.get(4)?,
                    duration_minutes: row.get(5)?,
                    pace_min_km: row.get(6)?,
                    avg_speed_kmh: row.get(7)?,
                    calories_burned: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            })?;
            for item in rows {
                payload.cardio_logs.push(item?);
            }
        }

        // Fat burner logs
        {
            let mut stmt = self.conn.prepare("SELECT id, user_id, date, program_id, program_name, duration_seconds, calories_burned, completed, updated_at FROM fat_burner_logs ORDER BY date DESC")?;
            let rows = stmt.query_map([], |row| {
                let comp_val: i64 = row.get(7)?;
                Ok(FatBurnerLog {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    date: row.get(2)?,
                    program_id: row.get(3)?,
                    program_name: row.get(4)?,
                    duration_seconds: row.get(5)?,
                    calories_burned: row.get(6)?,
                    completed: comp_val != 0,
                    updated_at: row.get(8)?,
                })
            })?;
            for item in rows {
                payload.fat_burner_logs.push(item?);
            }
        }

        // Body metric logs
        {
            let mut stmt = self.conn.prepare("SELECT id, user_id, date, weight_kg, neck_cm, waist_cm, hip_cm, bmi, body_fat_pct, updated_at FROM body_metric_logs ORDER BY date DESC")?;
            let rows = stmt.query_map([], |row| {
                Ok(BodyMetricLog {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    date: row.get(2)?,
                    weight_kg: row.get(3)?,
                    neck_cm: row.get(4)?,
                    waist_cm: row.get(5)?,
                    hip_cm: row.get(6)?,
                    bmi: row.get(7)?,
                    body_fat_pct: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            })?;
            for item in rows {
                payload.body_metric_logs.push(item?);
            }
        }

        // Daily habit logs
        {
            let mut stmt = self.conn.prepare("SELECT id, user_id, date, water_ml, sleep_minutes, sleep_quality, steps, updated_at FROM daily_habit_logs ORDER BY date DESC")?;
            let rows = stmt.query_map([], |row| {
                let qual: i64 = row.get(5)?;
                Ok(DailyHabitLog {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    date: row.get(2)?,
                    water_ml: row.get(3)?,
                    sleep_minutes: row.get(4)?,
                    sleep_quality: qual as u8,
                    steps: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })?;
            for item in rows {
                payload.daily_habit_logs.push(item?);
            }
        }

        Ok(payload)
    }

    /// Count existing accounts in the database
    pub fn count_accounts(&self) -> Result<usize> {
        let count: i64 = self.conn.query_row("SELECT COUNT(*) FROM accounts", [], |r| r.get(0))?;
        Ok(count as usize)
    }

    /// Create new user account
    pub fn create_account(&self, username: &str, password_hash: &str, display_name: &str) -> Result<UserAccount> {
        let id = format!("usr-{}", uuid::Uuid::new_v4());
        let now = chrono::Utc::now().timestamp_millis();
        self.conn.execute(
            "INSERT INTO accounts (id, username, password_hash, display_name, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![id, username, password_hash, display_name, now],
        )?;

        Ok(UserAccount {
            id,
            username: username.to_string(),
            password_hash: password_hash.to_string(),
            display_name: display_name.to_string(),
            created_at: now,
        })
    }

    /// Find account by username (case-insensitive)
    pub fn find_account_by_username(&self, username: &str) -> Result<Option<UserAccount>> {
        let mut stmt = self.conn.prepare("SELECT id, username, password_hash, display_name, created_at FROM accounts WHERE LOWER(username) = LOWER(?1) LIMIT 1")?;
        let mut rows = stmt.query(params![username])?;
        if let Some(row) = rows.next()? {
            Ok(Some(UserAccount {
                id: row.get(0)?,
                username: row.get(1)?,
                password_hash: row.get(2)?,
                display_name: row.get(3)?,
                created_at: row.get(4)?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Find account by ID
    pub fn find_account_by_id(&self, id: &str) -> Result<Option<UserAccount>> {
        let mut stmt = self.conn.prepare("SELECT id, username, password_hash, display_name, created_at FROM accounts WHERE id = ?1 LIMIT 1")?;
        let mut rows = stmt.query(params![id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(UserAccount {
                id: row.get(0)?,
                username: row.get(1)?,
                password_hash: row.get(2)?,
                display_name: row.get(3)?,
                created_at: row.get(4)?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Create persistent auth session token (valid for 365 days for seamless auto-login)
    pub fn create_session(&self, account_id: &str) -> Result<String> {
        let token = format!("tok-{}", uuid::Uuid::new_v4());
        let expires_at = chrono::Utc::now().timestamp_millis() + (365 * 24 * 3600 * 1000);
        self.conn.execute(
            "INSERT INTO auth_sessions (token, account_id, expires_at) VALUES (?1, ?2, ?3)",
            params![token, account_id, expires_at],
        )?;
        Ok(token)
    }

    /// Verify session token and retrieve account
    pub fn verify_session(&self, token: &str) -> Result<Option<UserAccount>> {
        let now = chrono::Utc::now().timestamp_millis();
        let mut stmt = self.conn.prepare(
            "SELECT a.id, a.username, a.password_hash, a.display_name, a.created_at
             FROM auth_sessions s
             JOIN accounts a ON a.id = s.account_id
             WHERE s.token = ?1 AND s.expires_at > ?2 LIMIT 1"
        )?;
        let mut rows = stmt.query(params![token, now])?;
        if let Some(row) = rows.next()? {
            Ok(Some(UserAccount {
                id: row.get(0)?,
                username: row.get(1)?,
                password_hash: row.get(2)?,
                display_name: row.get(3)?,
                created_at: row.get(4)?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Delete session on logout
    pub fn delete_session(&self, token: &str) -> Result<()> {
        self.conn.execute("DELETE FROM auth_sessions WHERE token = ?1", params![token])?;
        Ok(())
    }

    /// Save Health Connect / Apple Health / Smartband data log
    pub fn save_health_connect_log(&self, p: &HealthConnectPayload) -> Result<()> {
        let id = format!("hc-{}-{}", p.source, p.date);
        let now = chrono::Utc::now().timestamp_millis();
        self.conn.execute(
            "INSERT INTO health_connect_logs (id, user_id, source, date, steps, active_calories, heart_rate_avg, sleep_minutes, distance_km, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
             ON CONFLICT(id) DO UPDATE SET
                steps = COALESCE(excluded.steps, health_connect_logs.steps),
                active_calories = COALESCE(excluded.active_calories, health_connect_logs.active_calories),
                heart_rate_avg = COALESCE(excluded.heart_rate_avg, health_connect_logs.heart_rate_avg),
                sleep_minutes = COALESCE(excluded.sleep_minutes, health_connect_logs.sleep_minutes),
                distance_km = COALESCE(excluded.distance_km, health_connect_logs.distance_km),
                updated_at = excluded.updated_at;",
            params![id, p.user_id, p.source, p.date, p.steps, p.active_calories, p.heart_rate_avg, p.sleep_minutes, p.distance_km, now],
        )?;

        // Also update or insert daily habit log steps if steps provided
        if let Some(steps) = p.steps {
            let habit_id = format!("habit-{}-{}", p.user_id, p.date);
            self.conn.execute(
                "INSERT INTO daily_habit_logs (id, user_id, date, water_ml, sleep_minutes, sleep_quality, steps, updated_at)
                 VALUES (?1, ?2, ?3, 0, 0, 3, ?4, ?5)
                 ON CONFLICT(id) DO UPDATE SET steps = MAX(excluded.steps, daily_habit_logs.steps), updated_at = excluded.updated_at;",
                params![habit_id, p.user_id, p.date, steps, now],
            )?;
        }
        Ok(())
    }

    /// User-scoped snapshot retrieval for multi-user support
    pub fn get_user_snapshot(&self, user_id: &str) -> Result<SyncPayload> {
        let mut payload = SyncPayload {
            client_timestamp: chrono::Utc::now().timestamp_millis(),
            ..Default::default()
        };

        // User Profile
        {
            let mut stmt = self.conn.prepare("SELECT id, name, age, gender, height_cm, weight_kg, activity_level, goal, target_calories, target_protein_g, target_carbs_g, target_fat_g, target_water_ml, updated_at FROM user_profiles WHERE id = ?1 LIMIT 1")?;
            let mut rows = stmt.query(params![user_id])?;
            if let Some(row) = rows.next()? {
                payload.profile = Some(UserProfile {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    age: row.get(2)?,
                    gender: row.get(3)?,
                    height_cm: row.get(4)?,
                    weight_kg: row.get(5)?,
                    activity_level: row.get(6)?,
                    goal: row.get(7)?,
                    target_calories: row.get(8)?,
                    target_protein_g: row.get(9)?,
                    target_carbs_g: row.get(10)?,
                    target_fat_g: row.get(11)?,
                    target_water_ml: row.get(12)?,
                    updated_at: row.get(13)?,
                });
            }
        }

        // Food logs scoped to user
        {
            let mut stmt = self.conn.prepare("SELECT id, user_id, date, meal_type, food_name, serving_count, serving_unit, calories, protein_g, carbs_g, fat_g, updated_at FROM food_logs WHERE user_id = ?1 ORDER BY date DESC, updated_at DESC")?;
            let rows = stmt.query_map(params![user_id], |row| {
                Ok(FoodLog {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    date: row.get(2)?,
                    meal_type: row.get(3)?,
                    food_name: row.get(4)?,
                    serving_count: row.get(5)?,
                    serving_unit: row.get(6)?,
                    calories: row.get(7)?,
                    protein_g: row.get(8)?,
                    carbs_g: row.get(9)?,
                    fat_g: row.get(10)?,
                    updated_at: row.get(11)?,
                })
            })?;
            for item in rows {
                payload.food_logs.push(item?);
            }
        }

        // Workout logs scoped to user
        {
            let mut stmt = self.conn.prepare("SELECT id, user_id, date, routine_name, exercises_json, duration_minutes, total_volume_kg, notes, is_pr, updated_at FROM workout_logs WHERE user_id = ?1 ORDER BY date DESC")?;
            let rows = stmt.query_map(params![user_id], |row| {
                let json_str: String = row.get(4)?;
                let exercises: Vec<ExerciseItem> = serde_json::from_str(&json_str).unwrap_or_default();
                let is_pr_val: i64 = row.get(8)?;
                Ok(WorkoutLog {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    date: row.get(2)?,
                    routine_name: row.get(3)?,
                    exercises,
                    duration_minutes: row.get(5)?,
                    total_volume_kg: row.get(6)?,
                    notes: row.get(7)?,
                    is_pr: is_pr_val != 0,
                    updated_at: row.get(9)?,
                })
            })?;
            for item in rows {
                payload.workout_logs.push(item?);
            }
        }

        // Cardio logs scoped to user
        {
            let mut stmt = self.conn.prepare("SELECT id, user_id, date, activity_type, distance_km, duration_minutes, pace_min_km, avg_speed_kmh, calories_burned, updated_at FROM cardio_logs WHERE user_id = ?1 ORDER BY date DESC")?;
            let rows = stmt.query_map(params![user_id], |row| {
                Ok(CardioLog {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    date: row.get(2)?,
                    activity_type: row.get(3)?,
                    distance_km: row.get(4)?,
                    duration_minutes: row.get(5)?,
                    pace_min_km: row.get(6)?,
                    avg_speed_kmh: row.get(7)?,
                    calories_burned: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            })?;
            for item in rows {
                payload.cardio_logs.push(item?);
            }
        }

        // Fat burner logs scoped to user
        {
            let mut stmt = self.conn.prepare("SELECT id, user_id, date, program_id, program_name, duration_seconds, calories_burned, completed, updated_at FROM fat_burner_logs WHERE user_id = ?1 ORDER BY date DESC")?;
            let rows = stmt.query_map(params![user_id], |row| {
                let comp_val: i64 = row.get(7)?;
                Ok(FatBurnerLog {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    date: row.get(2)?,
                    program_id: row.get(3)?,
                    program_name: row.get(4)?,
                    duration_seconds: row.get(5)?,
                    calories_burned: row.get(6)?,
                    completed: comp_val != 0,
                    updated_at: row.get(8)?,
                })
            })?;
            for item in rows {
                payload.fat_burner_logs.push(item?);
            }
        }

        // Body metric logs scoped to user
        {
            let mut stmt = self.conn.prepare("SELECT id, user_id, date, weight_kg, neck_cm, waist_cm, hip_cm, bmi, body_fat_pct, updated_at FROM body_metric_logs WHERE user_id = ?1 ORDER BY date DESC")?;
            let rows = stmt.query_map(params![user_id], |row| {
                Ok(BodyMetricLog {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    date: row.get(2)?,
                    weight_kg: row.get(3)?,
                    neck_cm: row.get(4)?,
                    waist_cm: row.get(5)?,
                    hip_cm: row.get(6)?,
                    bmi: row.get(7)?,
                    body_fat_pct: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            })?;
            for item in rows {
                payload.body_metric_logs.push(item?);
            }
        }

        // Daily habit logs scoped to user
        {
            let mut stmt = self.conn.prepare("SELECT id, user_id, date, water_ml, sleep_minutes, sleep_quality, steps, updated_at FROM daily_habit_logs WHERE user_id = ?1 ORDER BY date DESC")?;
            let rows = stmt.query_map(params![user_id], |row| {
                let qual: i64 = row.get(5)?;
                Ok(DailyHabitLog {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    date: row.get(2)?,
                    water_ml: row.get(3)?,
                    sleep_minutes: row.get(4)?,
                    sleep_quality: qual as u8,
                    steps: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })?;
            for item in rows {
                payload.daily_habit_logs.push(item?);
            }
        }

        Ok(payload)
    }
}
