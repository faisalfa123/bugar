//! BUGAR Mastermind Engine (Adapted from faisalfa123/mastermind constraint & limit model)
//! Implements a multi-variate knapsack constraint solver balancing calorie limits,
//! protein targets, and workout time budget.

use crate::models::{
    MastermindRecommendation, MastermindRequest, RecommendedFatBurner, RecommendedFoodItem,
};

#[derive(Clone, Debug)]
pub struct CandidateFood {
    pub name: &'static str,
    pub portion: &'static str,
    pub calories: f64,
    pub protein_g: f64,
    pub carbs_g: f64,
    pub fat_g: f64,
    pub meal_category: &'static str, // "breakfast", "lunch_dinner", "snack"
}

#[derive(Clone, Debug)]
pub struct CandidateWorkout {
    pub id: &'static str,
    pub title: &'static str,
    pub duration_minutes: u32,
    pub est_calories_burned: f64,
    pub intensity: &'static str,
    pub location: &'static str, // "home", "gym", "both"
}

pub const MASTER_FOODS: &[CandidateFood] = &[
    CandidateFood {
        name: "Dada Ayam Bakar / Panggang",
        portion: "150 gram",
        calories: 247.0,
        protein_g: 46.0,
        carbs_g: 0.0,
        fat_g: 5.4,
        meal_category: "lunch_dinner",
    },
    CandidateFood {
        name: "Nasi Putih Matang",
        portion: "100 gram (1 centong)",
        calories: 130.0,
        protein_g: 2.7,
        carbs_g: 28.2,
        fat_g: 0.3,
        meal_category: "lunch_dinner",
    },
    CandidateFood {
        name: "Nasi Merah",
        portion: "100 gram",
        calories: 111.0,
        protein_g: 2.6,
        carbs_g: 23.0,
        fat_g: 0.9,
        meal_category: "lunch_dinner",
    },
    CandidateFood {
        name: "Telur Rebus (2 butir)",
        portion: "2 butir (100g)",
        calories: 155.0,
        protein_g: 13.0,
        carbs_g: 1.1,
        fat_g: 10.6,
        meal_category: "breakfast",
    },
    CandidateFood {
        name: "Tempe Bacem Panggang",
        portion: "100 gram (2 potong)",
        calories: 160.0,
        protein_g: 14.0,
        carbs_g: 12.0,
        fat_g: 6.0,
        meal_category: "lunch_dinner",
    },
    CandidateFood {
        name: "Tahu Kukus Putih",
        portion: "150 gram (2 potong)",
        calories: 114.0,
        protein_g: 12.0,
        carbs_g: 2.8,
        fat_g: 6.5,
        meal_category: "lunch_dinner",
    },
    CandidateFood {
        name: "Sayur Bening Bayam & Jagung",
        portion: "1 mangkuk (150g)",
        calories: 65.0,
        protein_g: 2.5,
        carbs_g: 13.0,
        fat_g: 0.5,
        meal_category: "lunch_dinner",
    },
    CandidateFood {
        name: "Ikan Nila Bakar Tanpa Minyak",
        portion: "1 ekor sedang (150g)",
        calories: 192.0,
        protein_g: 39.0,
        carbs_g: 0.0,
        fat_g: 4.0,
        meal_category: "lunch_dinner",
    },
    CandidateFood {
        name: "Oatmeal Instan + Chia Seeds",
        portion: "1 mangkuk (40g oat)",
        calories: 175.0,
        protein_g: 6.5,
        carbs_g: 29.0,
        fat_g: 4.0,
        meal_category: "breakfast",
    },
    CandidateFood {
        name: "Pisang Cavendish",
        portion: "1 buah sedang (118g)",
        calories: 105.0,
        protein_g: 1.3,
        carbs_g: 27.0,
        fat_g: 0.3,
        meal_category: "snack",
    },
    CandidateFood {
        name: "Greek Yogurt Plain",
        portion: "150 gram",
        calories: 100.0,
        protein_g: 15.0,
        carbs_g: 6.0,
        fat_g: 1.0,
        meal_category: "snack",
    },
    CandidateFood {
        name: "Gado-gado (Bumbu Kacang Pisah/Sedikit)",
        portion: "1 porsi sedang (250g)",
        calories: 280.0,
        protein_g: 12.0,
        carbs_g: 30.0,
        fat_g: 12.0,
        meal_category: "lunch_dinner",
    },
];

pub const MASTER_WORKOUTS: &[CandidateWorkout] = &[
    CandidateWorkout {
        id: "fb-tabata-7",
        title: "7-Menit Tabata Fat Burner Kilat",
        duration_minutes: 7,
        est_calories_burned: 95.0,
        intensity: "Tinggi",
        location: "home",
    },
    CandidateWorkout {
        id: "fb-core-15",
        title: "15-Menit Core & Abs Shred",
        duration_minutes: 15,
        est_calories_burned: 140.0,
        intensity: "Sedang",
        location: "home",
    },
    CandidateWorkout {
        id: "fb-hiit-home-20",
        title: "20-Menit Full Body HIIT No-Equipment",
        duration_minutes: 20,
        est_calories_burned: 220.0,
        intensity: "Tinggi",
        location: "home",
    },
    CandidateWorkout {
        id: "fb-gym-circuit-30",
        title: "30-Menit Dumbbell Complex Fat Torch",
        duration_minutes: 30,
        est_calories_burned: 310.0,
        intensity: "Tinggi",
        location: "gym",
    },
    CandidateWorkout {
        id: "fb-kettlebell-25",
        title: "25-Menit Kettlebell Cardio Conditioning",
        duration_minutes: 25,
        est_calories_burned: 270.0,
        intensity: "Tinggi",
        location: "both",
    },
    CandidateWorkout {
        id: "fb-walking-hiit-40",
        title: "40-Menit Incline Treadmill Fat Burn Zone",
        duration_minutes: 40,
        est_calories_burned: 360.0,
        intensity: "Sedang",
        location: "gym",
    },
];

pub struct MastermindSolver;

impl MastermindSolver {
    /// Solve optimal food combination and fat burner workout based on limits and targets
    pub fn solve(req: &MastermindRequest) -> MastermindRecommendation {
        let max_cal = if req.remaining_calories > 50.0 {
            req.remaining_calories
        } else {
            350.0 // Default minimum allocation if user already reached quota
        };

        let target_protein = req.remaining_protein_g.max(10.0);
        let filter_category = req.meal_type.as_deref().unwrap_or("lunch_dinner");

        // Filter food candidates by requested meal type or flexible
        let mut candidates: Vec<&CandidateFood> = MASTER_FOODS
            .iter()
            .filter(|f| {
                if filter_category == "snack" {
                    f.meal_category == "snack" || f.meal_category == "breakfast"
                } else if filter_category == "breakfast" {
                    f.meal_category == "breakfast" || f.meal_category == "snack"
                } else {
                    f.meal_category == "lunch_dinner" || f.meal_category == "breakfast"
                }
            })
            .collect();

        if candidates.is_empty() {
            candidates = MASTER_FOODS.iter().collect();
        }

        // Knapsack Solver: Search single, pair, or triple items that maximize protein within max_cal
        let mut best_combo: Vec<&CandidateFood> = Vec::new();
        let mut best_score: f64 = -1000.0;
        let mut best_cals = 0.0;
        let mut best_prot = 0.0;

        // 1-item check
        for &item in &candidates {
            if item.calories <= max_cal * 1.15 {
                let score = Self::calculate_food_score(item.calories, item.protein_g, max_cal, target_protein);
                if score > best_score {
                    best_score = score;
                    best_combo = vec![item];
                    best_cals = item.calories;
                    best_prot = item.protein_g;
                }
            }
        }

        // 2-items check
        for i in 0..candidates.len() {
            for j in (i + 1)..candidates.len() {
                let cals = candidates[i].calories + candidates[j].calories;
                let prot = candidates[i].protein_g + candidates[j].protein_g;
                if cals <= max_cal * 1.15 {
                    let score = Self::calculate_food_score(cals, prot, max_cal, target_protein);
                    if score > best_score {
                        best_score = score;
                        best_combo = vec![candidates[i], candidates[j]];
                        best_cals = cals;
                        best_prot = prot;
                    }
                }
            }
        }

        // 3-items check (if max_cal >= 350)
        if max_cal >= 350.0 {
            for i in 0..candidates.len() {
                for j in (i + 1)..candidates.len() {
                    for k in (j + 1)..candidates.len() {
                        let cals = candidates[i].calories + candidates[j].calories + candidates[k].calories;
                        let prot = candidates[i].protein_g + candidates[j].protein_g + candidates[k].protein_g;
                        if cals <= max_cal * 1.1 {
                            let score = Self::calculate_food_score(cals, prot, max_cal, target_protein);
                            if score > best_score {
                                best_score = score;
                                best_combo = vec![candidates[i], candidates[j], candidates[k]];
                                best_cals = cals;
                                best_prot = prot;
                            }
                        }
                    }
                }
            }
        }

        // Fallback if no combo matched
        if best_combo.is_empty() {
            let default_item = &MASTER_FOODS[0]; // Dada ayam
            best_combo.push(default_item);
            best_cals = default_item.calories;
            best_prot = default_item.protein_g;
            best_score = 50.0;
        }

        let recommended_foods: Vec<RecommendedFoodItem> = best_combo
            .into_iter()
            .map(|f| RecommendedFoodItem {
                name: f.name.to_string(),
                portion: f.portion.to_string(),
                calories: f.calories,
                protein_g: f.protein_g,
                carbs_g: f.carbs_g,
                fat_g: f.fat_g,
            })
            .collect();

        // Match Workout based on time budget and location
        let max_time = req.time_available_minutes.max(7);
        let mut matched_workout: Option<RecommendedFatBurner> = None;
        let mut best_workout_diff = 999;

        for w in MASTER_WORKOUTS {
            let loc_ok = w.location == "both" || w.location == req.preferred_location;
            if loc_ok && w.duration_minutes <= max_time {
                let diff = (max_time as i32 - w.duration_minutes as i32).abs();
                if diff < best_workout_diff {
                    best_workout_diff = diff;
                    matched_workout = Some(RecommendedFatBurner {
                        id: w.id.to_string(),
                        title: w.title.to_string(),
                        duration_minutes: w.duration_minutes,
                        est_calories_burned: w.est_calories_burned,
                        intensity: w.intensity.to_string(),
                        location: w.location.to_string(),
                    });
                }
            }
        }

        if matched_workout.is_none() {
            let default_w = &MASTER_WORKOUTS[0];
            matched_workout = Some(RecommendedFatBurner {
                id: default_w.id.to_string(),
                title: default_w.title.to_string(),
                duration_minutes: default_w.duration_minutes,
                est_calories_burned: default_w.est_calories_burned,
                intensity: default_w.intensity.to_string(),
                location: default_w.location.to_string(),
            });
        }

        let reasoning = format!(
            "Mastermind menganalisis sisa kuota {} kcal dan target protein {}g. Kombinasi menu ini memberikan {} kcal dan {:.1}g protein tinggi untuk menjaga massa otot, dipadukan dengan sesi latihan '{}' ({:?} menit) yang membakar ~{:.0} kcal.",
            max_cal as i64,
            target_protein as i64,
            best_cals as i64,
            best_prot,
            matched_workout.as_ref().map(|w| w.title.as_str()).unwrap_or(""),
            matched_workout.as_ref().map(|w| w.duration_minutes).unwrap_or(0),
            matched_workout.as_ref().map(|w| w.est_calories_burned).unwrap_or(0.0)
        );

        MastermindRecommendation {
            recommended_foods,
            total_calories: best_cals,
            total_protein_g: best_prot,
            recommended_fat_burner: matched_workout,
            score: best_score,
            reasoning,
        }
    }

    fn calculate_food_score(calories: f64, protein: f64, max_cal: f64, target_prot: f64) -> f64 {
        // High protein reward + Calorie penalty if exceeds target + Utilization ratio bonus
        let protein_ratio = (protein / target_prot).min(1.5);
        let cal_utilization = calories / max_cal;
        let cal_penalty = if calories > max_cal {
            (calories - max_cal) * 2.0
        } else {
            0.0
        };

        (protein_ratio * 100.0) + (cal_utilization * 40.0) - cal_penalty
    }
}
