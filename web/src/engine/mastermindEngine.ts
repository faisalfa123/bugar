import { MastermindRecommendation, UserProfile } from '../types';
import { INDONESIAN_FOODS } from '../data/indonesianFoods';
import { FAT_BURNER_PROGRAMS } from '../data/fatBurnerPrograms';

export interface SolverOptions {
  remainingCalories: number;
  remainingProteinG: number;
  timeAvailableMinutes: number;
  preferredLocation: 'Rumah' | 'Gym';
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

/**
 * Client-Side BUGAR Mastermind Constraint Solver
 * Knapsack multi-variate solver balancing calorie limit and protein targets
 */
export function solveMastermindRecommendation(options: SolverOptions): MastermindRecommendation {
  const maxCal = options.remainingCalories > 60 ? options.remainingCalories : 350;
  const targetProt = Math.max(options.remainingProteinG, 10);
  const preferredType = options.mealType || 'lunch';

  // Filter candidates based on meal type
  let candidates = INDONESIAN_FOODS.filter(item => {
    if (preferredType === 'snack') {
      return item.category === 'Buah' || item.category === 'Minuman' || item.calories <= 200;
    }
    if (preferredType === 'breakfast') {
      return item.category === 'Protein' || item.category === 'Karbohidrat' || item.category === 'Nabati';
    }
    return item.category === 'Protein' || item.category === 'Karbohidrat' || item.category === 'Sayuran' || item.category === 'Nabati';
  });

  if (candidates.length === 0) candidates = INDONESIAN_FOODS;

  let bestItems: typeof INDONESIAN_FOODS = [];
  let bestScore = -9999;
  let bestCalories = 0;
  let bestProtein = 0;

  const scoreCombo = (calories: number, protein: number) => {
    const protScore = (protein / targetProt) * 120;
    const calRatio = calories / maxCal;
    const penalty = calories > maxCal ? (calories - maxCal) * 3 : 0;
    return protScore + (calRatio * 35) - penalty;
  };

  // 1-item test
  for (const item of candidates) {
    if (item.calories <= maxCal * 1.15) {
      const score = scoreCombo(item.calories, item.protein_g);
      if (score > bestScore) {
        bestScore = score;
        bestItems = [item];
        bestCalories = item.calories;
        bestProtein = item.protein_g;
      }
    }
  }

  // 2-items test (e.g. Protein + Karbo/Sayur)
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const c1 = candidates[i];
      const c2 = candidates[j];
      const cals = c1.calories + c2.calories;
      const prot = c1.protein_g + c2.protein_g;
      if (cals <= maxCal * 1.12) {
        const score = scoreCombo(cals, prot);
        if (score > bestScore) {
          bestScore = score;
          bestItems = [c1, c2];
          bestCalories = cals;
          bestProtein = prot;
        }
      }
    }
  }

  // 3-items test (if budget allows)
  if (maxCal >= 380) {
    for (let i = 0; i < Math.min(candidates.length, 25); i++) {
      for (let j = i + 1; j < Math.min(candidates.length, 25); j++) {
        for (let k = j + 1; k < Math.min(candidates.length, 25); k++) {
          const c1 = candidates[i];
          const c2 = candidates[j];
          const c3 = candidates[k];
          const cals = c1.calories + c2.calories + c3.calories;
          const prot = c1.protein_g + c2.protein_g + c3.protein_g;
          if (cals <= maxCal * 1.08) {
            const score = scoreCombo(cals, prot);
            if (score > bestScore) {
              bestScore = score;
              bestItems = [c1, c2, c3];
              bestCalories = cals;
              bestProtein = prot;
            }
          }
        }
      }
    }
  }

  if (bestItems.length === 0) {
    bestItems = [INDONESIAN_FOODS[7]]; // Dada Ayam Bakar
    bestCalories = bestItems[0].calories;
    bestProtein = bestItems[0].protein_g;
    bestScore = 60;
  }

  // Match optimal workout program
  const maxTime = Math.max(options.timeAvailableMinutes, 7);
  const eligibleWorkouts = FAT_BURNER_PROGRAMS.filter(
    p => p.location === options.preferredLocation && p.durationMinutes <= maxTime
  );

  const matchedWorkout = eligibleWorkouts.length > 0
    ? eligibleWorkouts.sort((a, b) => Math.abs(maxTime - a.durationMinutes) - Math.abs(maxTime - b.durationMinutes))[0]
    : FAT_BURNER_PROGRAMS[0];

  const reasoning = `Mastermind Solver menganalisis kuota Anda (sisa ${Math.round(maxCal)} kcal & ${Math.round(targetProt)}g protein). Rekomendasi ini memadukan ${bestItems.map(i => i.name).join(' + ')} menghasilkan ${Math.round(bestCalories)} kcal dan ${bestProtein.toFixed(1)}g protein, diselaraskan dengan sesi ${matchedWorkout.title} (${matchedWorkout.durationMinutes} mnt) yang membakar ~${matchedWorkout.caloriesBurnedEst} kcal.`;

  return {
    recommended_foods: bestItems.map(item => ({
      name: item.name,
      portion: item.serving_size,
      calories: item.calories,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
    })),
    total_calories: bestCalories,
    total_protein_g: bestProtein,
    recommended_fat_burner: {
      id: matchedWorkout.id,
      title: matchedWorkout.title,
      duration_minutes: matchedWorkout.durationMinutes,
      est_calories_burned: matchedWorkout.caloriesBurnedEst,
      intensity: matchedWorkout.intensity,
      location: matchedWorkout.location,
    },
    score: bestScore,
    reasoning,
  };
}

/**
 * Calculate BMR using Mifflin-St Jeor equation
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
}

/**
 * Calculate TDEE and target macros based on user profile
 */
export function calculateProfileTargets(profile: Partial<UserProfile>): {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetWaterMl: number;
} {
  const weight = profile.weight_kg || 70;
  const height = profile.height_cm || 170;
  const age = profile.age || 28;
  const gender = profile.gender || 'male';
  const activity = profile.activity_level || 1.375;
  const goal = profile.goal || 'fat_loss';

  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = Math.round(bmr * activity);

  let targetCalories = tdee;
  if (goal === 'fat_loss') {
    targetCalories = Math.max(1200, Math.round(tdee - 500));
  } else if (goal === 'muscle_gain') {
    targetCalories = Math.round(tdee + 350);
  }

  // Protein: 2.0g per kg for fat loss / muscle gain
  const targetProteinG = Math.round(weight * (goal === 'fat_loss' ? 2.0 : goal === 'muscle_gain' ? 2.2 : 1.6));
  // Fats: 25% of calories (9 kcal/g)
  const targetFatG = Math.round((targetCalories * 0.25) / 9);
  // Carbs: remainder of calories (4 kcal/g)
  const remainingCals = Math.max(0, targetCalories - (targetProteinG * 4 + targetFatG * 9));
  const targetCarbsG = Math.round(remainingCals / 4);

  // Water: ~35ml per kg body weight
  const targetWaterMl = Math.round(weight * 35);

  return {
    bmr,
    tdee,
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
    targetWaterMl,
  };
}

/**
 * Calculate US Navy Body Fat % estimation
 */
export function calculateBodyFatPct(
  gender: 'male' | 'female',
  heightCm: number,
  neckCm: number,
  waistCm: number,
  hipCm?: number
): number {
  if (neckCm <= 0 || waistCm <= 0 || heightCm <= 0) return 0;

  if (gender === 'male') {
    // 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    const diff = waistCm - neckCm;
    if (diff <= 0) return 10;
    const logDiff = Math.log10(diff);
    const logHeight = Math.log10(heightCm);
    const denom = 1.0324 - 0.19077 * logDiff + 0.15456 * logHeight;
    const bf = 495 / denom - 450;
    return Math.max(4, Math.min(50, Math.round(bf * 10) / 10));
  } else {
    // Female requires hip
    const hip = hipCm || waistCm * 1.1;
    const diff = waistCm + hip - neckCm;
    if (diff <= 0) return 15;
    const logDiff = Math.log10(diff);
    const logHeight = Math.log10(heightCm);
    const denom = 1.29579 - 0.35004 * logDiff + 0.22100 * logHeight;
    const bf = 495 / denom - 450;
    return Math.max(8, Math.min(55, Math.round(bf * 10) / 10));
  }
}
