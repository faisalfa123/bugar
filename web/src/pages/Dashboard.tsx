import React from 'react';
import { ActivityRings } from '../components/ActivityRings';
import { MastermindCard } from '../components/MastermindCard';
import { UserProfile, FoodLog, WorkoutLog, FatBurnerLog, DailyHabitLog } from '../types';
import { Flame, Utensils, Zap, Droplets, Footprints, Moon, ArrowUpRight, Play, Dumbbell, ShieldCheck } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  foodLogs: FoodLog[];
  workoutLogs: WorkoutLog[];
  fatBurnerLogs: FatBurnerLog[];
  todayHabit: DailyHabitLog;
  onNavigateTab: (tab: 'nutrition' | 'workout' | 'fatburner' | 'health' | 'guide') => void;
  onApplyFoodToJournal: (foodItems: { name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; portion: string }[]) => void;
  onStartWorkout: (programId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  foodLogs,
  workoutLogs,
  fatBurnerLogs,
  todayHabit,
  onNavigateTab,
  onApplyFoodToJournal,
  onStartWorkout,
}) => {
  // Aggregate today's metrics
  const totalCaloriesConsumed = foodLogs.reduce((sum, item) => sum + item.calories, 0);
  const totalProteinConsumed = foodLogs.reduce((sum, item) => sum + item.protein_g, 0);
  const totalCarbsConsumed = foodLogs.reduce((sum, item) => sum + item.carbs_g, 0);
  const totalFatConsumed = foodLogs.reduce((sum, item) => sum + item.fat_g, 0);

  const workoutCalories = workoutLogs.reduce((sum, w) => sum + (w.duration_minutes * 6.5), 0);
  const fatBurnerCalories = fatBurnerLogs.reduce((sum, fb) => sum + fb.calories_burned, 0);
  const totalCaloriesBurned = workoutCalories + fatBurnerCalories;

  const totalWorkoutMinutes = workoutLogs.reduce((sum, w) => sum + w.duration_minutes, 0) +
    fatBurnerLogs.reduce((sum, fb) => sum + Math.round(fb.duration_seconds / 60), 0);

  // Remaining budget
  const remainingCalories = Math.max(0, profile.target_calories - totalCaloriesConsumed);
  const remainingProtein = Math.max(0, profile.target_protein_g - totalProteinConsumed);
  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

  return (
    <div className="space-y-6 pb-24">
      {/* Symmetrical Hero Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Halo, {profile.name}
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              {profile.goal === 'fat_loss' ? '🎯 Target Fat Loss' : profile.goal === 'muscle_gain' ? '💪 Target Massa Otot' : '⚖️ Target Pemeliharaan'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Target Harian: <span className="text-slate-200 font-semibold">{profile.target_calories} kcal</span> | Air: <span className="text-slate-200 font-semibold">{profile.target_water_ml} ml</span>
          </p>
        </div>

        {/* Symmetrical Quick Summary Badges */}
        <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center">
          <div className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Flame size={16} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Kalori Netto</p>
              <p className="text-xs font-bold text-white">{Math.round(netCalories)} kcal</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Droplets size={16} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Air Masuk</p>
              <p className="text-xs font-bold text-white">{todayHabit.water_ml} ml</p>
            </div>
          </div>
        </div>
      </div>

      {/* Symmetrical Dual-Column Layout (Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Span 6): Telemetry, Rings & Nutrition Breakdown */}
        <div className="lg:col-span-6 space-y-6">
          {/* Triple Activity Rings */}
          <ActivityRings
            caloriesBurned={totalCaloriesBurned}
            caloriesTarget={400}
            activeMinutes={totalWorkoutMinutes}
            activeMinutesTarget={45}
            waterMl={todayHabit.water_ml}
            waterTarget={profile.target_water_ml || 2500}
          />

          {/* Symmetrical Nutrition & Macro Split */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Utensils size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">Keseimbangan Makronutrisi</h2>
                  <p className="text-[11px] text-slate-400">Konsumsi terhadap target harian</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('nutrition')}
                className="text-xs font-semibold text-emerald-400 flex items-center gap-1 hover:text-emerald-300 transition-colors"
              >
                Jurnal <ArrowUpRight size={13} />
              </button>
            </div>

            {/* 4 Balanced Macro Bars */}
            <div className="grid grid-cols-2 gap-3">
              {/* Kalori */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Kalori</span>
                  <span className="text-white font-bold">{Math.round(totalCaloriesConsumed)} kcal</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalCaloriesConsumed / (profile.target_calories || 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Sisa kuota: {Math.round(remainingCalories)} kcal</p>
              </div>

              {/* Protein */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-blue-400 font-medium">Protein</span>
                  <span className="text-white font-bold">{totalProteinConsumed.toFixed(0)}g</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalProteinConsumed / (profile.target_protein_g || 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Sisa target: {remainingProtein.toFixed(0)}g</p>
              </div>

              {/* Karbohidrat */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-amber-400 font-medium">Karbo</span>
                  <span className="text-white font-bold">{totalCarbsConsumed.toFixed(0)}g</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalCarbsConsumed / (profile.target_carbs_g || 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Batas: {profile.target_carbs_g}g</p>
              </div>

              {/* Lemak */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-rose-400 font-medium">Lemak</span>
                  <span className="text-white font-bold">{totalFatConsumed.toFixed(0)}g</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalFatConsumed / (profile.target_fat_g || 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Batas: {profile.target_fat_g}g</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Span 6): Mastermind AI Solver & Symmetrical Feature Tiles */}
        <div className="lg:col-span-6 space-y-6">
          {/* Mastermind AI Engine Recommendation */}
          <MastermindCard
            remainingCalories={remainingCalories}
            remainingProtein={remainingProtein}
            onApplyFood={onApplyFoodToJournal}
            onStartWorkout={onStartWorkout}
          />

          {/* Symmetrical Feature Grid (2x2 Balanced Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Exercise Form Guide Tile (Highlight) */}
            <button
              onClick={() => onNavigateTab('guide')}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play size={18} />
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                  Buka <ArrowUpRight size={13} />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-400">Tutorial Form Gerakan</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  Push-up, Squat, Plank 60fps
                </p>
              </div>
            </button>

            {/* 2. Workout & Gym Tile */}
            <button
              onClick={() => onNavigateTab('workout')}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Dumbbell size={18} />
                </div>
                <span className="text-xs font-semibold text-blue-400 flex items-center gap-0.5">
                  Latihan <ArrowUpRight size={13} />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-400">Gym & Angkat Beban</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {workoutLogs.length > 0 ? `${workoutLogs.length} Sesi Terบันทึก` : 'Log Latihan Beban'}
                </p>
              </div>
            </button>

            {/* 3. Fat Burner HIIT Tile */}
            <button
              onClick={() => onNavigateTab('fatburner')}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Flame size={18} />
                </div>
                <span className="text-xs font-semibold text-orange-400 flex items-center gap-0.5">
                  Bakar Lemak <ArrowUpRight size={13} />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-400">HIIT & Interval Audio</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {fatBurnerLogs.length > 0 ? `${Math.round(fatBurnerCalories)} kcal Terbakar` : '12 Program Siap'}
                </p>
              </div>
            </button>

            {/* 4. Daily Habits Tile */}
            <button
              onClick={() => onNavigateTab('health')}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Footprints size={18} />
                </div>
                <span className="text-xs font-semibold text-purple-400 flex items-center gap-0.5">
                  Kebiasaan <ArrowUpRight size={13} />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-400">Langkah & Waktu Tidur</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {todayHabit.steps.toLocaleString()} Langkah • {Math.round(todayHabit.sleep_minutes / 60)}j Tidur
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
