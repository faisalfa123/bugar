use rusqlite::{params, Connection, Result};
use std::path::Path;
use crate::models::*;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn open<P: AsRef<Path>>(path: P) -> Result<Self> {
        let conn = Connection::open(path)?;

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
            CREATE INDEX IF NOT EXISTS idx_daily_habit_logs_date ON daily_habit_logs(date);"
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
}
