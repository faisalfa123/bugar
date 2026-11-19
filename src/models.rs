use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserProfile {
    pub id: String,
    pub name: String,
    pub age: u32,
    pub gender: String, // "male" | "female"
    pub height_cm: f64,
    pub weight_kg: f64,
    pub activity_level: f64, // 1.2 (sedentary) to 1.9 (extremely active)
    pub goal: String, // "fat_loss" | "maintenance" | "muscle_gain"
    pub target_calories: f64,
    pub target_protein_g: f64,
    pub target_carbs_g: f64,
    pub target_fat_g: f64,
    pub target_water_ml: f64,
    pub updated_at: i64,
}

impl Default for UserProfile {
    fn default() -> Self {
        Self {
            id: "default-user".to_string(),
            name: "Pengguna Bugar".to_string(),
            age: 28,
            gender: "male".to_string(),
            height_cm: 172.0,
            weight_kg: 72.0,
            activity_level: 1.375,
            goal: "fat_loss".to_string(),
            target_calories: 2000.0,
            target_protein_g: 130.0,
            target_carbs_g: 220.0,
            target_fat_g: 55.0,
            target_water_ml: 2500.0,
            updated_at: chrono::Utc::now().timestamp_millis(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FoodLog {
    pub id: String,
    pub user_id: String,
    pub date: String, // YYYY-MM-DD
    pub meal_type: String, // "breakfast" | "lunch" | "dinner" | "snack"
    pub food_name: String,
    pub serving_count: f64,
    pub serving_unit: String,
    pub calories: f64,
    pub protein_g: f64,
    pub carbs_g: f64,
    pub fat_g: f64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkoutSet {
    pub set_number: u32,
    pub weight_kg: f64,
    pub reps: u32,
    pub rpe: Option<f64>,
    pub completed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExerciseItem {
    pub name: String,
    pub sets: Vec<WorkoutSet>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkoutLog {
    pub id: String,
    pub user_id: String,
    pub date: String,
    pub routine_name: String,
    pub exercises: Vec<ExerciseItem>,
    pub duration_minutes: u32,
    pub total_volume_kg: f64,
    pub notes: Option<String>,
    pub is_pr: bool,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardioLog {
    pub id: String,
    pub user_id: String,
    pub date: String,
    pub activity_type: String, // "running" | "walking" | "cycling" | "swimming"
    pub distance_km: f64,
    pub duration_minutes: f64,
    pub pace_min_km: f64,
    pub avg_speed_kmh: f64,
    pub calories_burned: f64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FatBurnerLog {
    pub id: String,
    pub user_id: String,
    pub date: String,
    pub program_id: String,
    pub program_name: String,
    pub duration_seconds: u32,
    pub calories_burned: f64,
    pub completed: bool,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BodyMetricLog {
    pub id: String,
    pub user_id: String,
    pub date: String,
    pub weight_kg: f64,
    pub neck_cm: Option<f64>,
    pub waist_cm: Option<f64>,
    pub hip_cm: Option<f64>,
    pub bmi: f64,
    pub body_fat_pct: Option<f64>,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyHabitLog {
    pub id: String,
    pub user_id: String,
    pub date: String,
    pub water_ml: f64,
    pub sleep_minutes: u32,
    pub sleep_quality: u8, // 1 to 5
    pub steps: u32,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SyncPayload {
    pub profile: Option<UserProfile>,
    pub food_logs: Vec<FoodLog>,
    pub workout_logs: Vec<WorkoutLog>,
    pub cardio_logs: Vec<CardioLog>,
    pub fat_burner_logs: Vec<FatBurnerLog>,
    pub body_metric_logs: Vec<BodyMetricLog>,
    pub daily_habit_logs: Vec<DailyHabitLog>,
    pub client_timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncResponse {
    pub success: bool,
    pub server_timestamp: i64,
    pub applied_count: usize,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerHealth {
    pub status: String,
    pub version: String,
    pub arch: String,
    pub uptime_secs: u64,
    pub memory_rss_kb: u64,
    pub memory_vms_kb: u64,
    pub pin_protected: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MastermindRequest {
    pub remaining_calories: f64,
    pub remaining_protein_g: f64,
    pub time_available_minutes: u32,
    pub preferred_location: String, // "home" | "gym"
    pub meal_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecommendedFoodItem {
    pub name: String,
    pub portion: String,
    pub calories: f64,
    pub protein_g: f64,
    pub carbs_g: f64,
    pub fat_g: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecommendedFatBurner {
    pub id: String,
    pub title: String,
    pub duration_minutes: u32,
    pub est_calories_burned: f64,
    pub intensity: String,
    pub location: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MastermindRecommendation {
    pub recommended_foods: Vec<RecommendedFoodItem>,
    pub total_calories: f64,
    pub total_protein_g: f64,
    pub recommended_fat_burner: Option<RecommendedFatBurner>,
    pub score: f64,
    pub reasoning: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthVerifyRequest {
    pub pin: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthVerifyResponse {
    pub success: bool,
    pub token: Option<String>,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportBackupRequest {
    #[serde(default)]
    pub replace_all: bool,
    pub payload: SyncPayload,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserAccount {
    pub id: String,
    pub username: String,
    pub password_hash: String,
    pub display_name: String,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegisterRequest {
    pub username: String,
    pub password: String,
    pub display_name: String,
    pub age: Option<u32>,
    pub gender: Option<String>,
    pub height_cm: Option<f64>,
    pub weight_kg: Option<f64>,
    pub goal: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthAccountResponse {
    pub success: bool,
    pub token: Option<String>,
    pub user_id: Option<String>,
    pub username: Option<String>,
    pub display_name: Option<String>,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkoutCastEvent {
    pub user_id: String,
    pub session_id: String,
    pub exercise_name: String,
    pub current_set: u32,
    pub current_reps: u32,
    pub heart_rate_bpm: Option<u32>,
    pub cadence_bpm: Option<u32>,
    pub elapsed_seconds: u32,
    pub is_active: bool,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthConnectPayload {
    pub user_id: String,
    pub source: String, // "apple_health" | "google_fit" | "smartband"
    pub date: String,
    pub steps: Option<u32>,
    pub active_calories: Option<f64>,
    pub heart_rate_avg: Option<u32>,
    pub sleep_minutes: Option<u32>,
    pub distance_km: Option<f64>,
}

