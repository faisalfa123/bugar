export type GoalType = 'fat_loss' | 'maintenance' | 'muscle_gain';
export type GenderType = 'male' | 'female';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: GenderType;
  height_cm: number;
  weight_kg: number;
  activity_level: number;
  goal: GoalType;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  target_water_ml: number;
  updated_at: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  is_custom?: boolean;
  image_url?: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  meal_type: MealType;
  food_name: string;
  serving_count: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  updated_at: number;
}

export interface WorkoutSet {
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe?: number;
  completed: boolean;
}

export interface ExerciseItem {
  name: string;
  sets: WorkoutSet[];
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  date: string;
  routine_name: string;
  exercises: ExerciseItem[];
  duration_minutes: number;
  total_volume_kg: number;
  notes?: string;
  is_pr: boolean;
  updated_at: number;
}

export interface CardioLog {
  id: string;
  user_id: string;
  date: string;
  activity_type: 'running' | 'walking' | 'cycling' | 'swimming';
  distance_km: number;
  duration_minutes: number;
  pace_min_km: number;
  avg_speed_kmh: number;
  calories_burned: number;
  updated_at: number;
}

export interface WorkoutInterval {
  name: string;
  durationSeconds: number;
  isRest: boolean;
  instruction: string;
}

export interface FatBurnerProgram {
  id: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  caloriesBurnedEst: number;
  intensity: 'Pemula' | 'Menengah' | 'Intens';
  location: 'Rumah' | 'Gym';
  targetMuscle: string;
  intervals: WorkoutInterval[];
}

export interface FatBurnerLog {
  id: string;
  user_id: string;
  date: string;
  program_id: string;
  program_name: string;
  duration_seconds: number;
  calories_burned: number;
  completed: boolean;
  updated_at: number;
}

export interface BodyMetricLog {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
  neck_cm?: number;
  waist_cm?: number;
  hip_cm?: number;
  bmi: number;
  body_fat_pct?: number;
  updated_at: number;
}

export interface DailyHabitLog {
  id: string;
  user_id: string;
  date: string;
  water_ml: number;
  sleep_minutes: number;
  sleep_quality: number; // 1 to 5
  steps: number;
  updated_at: number;
}

export interface SyncPayload {
  profile?: UserProfile;
  food_logs: FoodLog[];
  workout_logs: WorkoutLog[];
  cardio_logs: CardioLog[];
  fat_burner_logs: FatBurnerLog[];
  body_metric_logs: BodyMetricLog[];
  daily_habit_logs: DailyHabitLog[];
  client_timestamp: number;
}

export interface ServerHealth {
  status: string;
  version: string;
  arch: string;
  uptime_secs: number;
  memory_rss_kb: number;
  memory_vms_kb: number;
  pin_protected: boolean;
}

export interface HddStatus {
  path: string;
  available: boolean;
  writable: boolean;
  last_backup_time: number | null;
  files: string[];
  backup_size_bytes: number;
  message: string;
}

export interface ImportBackupRequest {
  replace_all: boolean;
  payload: SyncPayload;
}

export interface MastermindRecommendation {
  recommended_foods: {
    name: string;
    portion: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }[];
  total_calories: number;
  total_protein_g: number;
  recommended_fat_burner?: {
    id: string;
    title: string;
    duration_minutes: number;
    est_calories_burned: number;
    intensity: string;
    location: string;
  };
  score: number;
  reasoning: string;
}
