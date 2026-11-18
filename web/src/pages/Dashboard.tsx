import React from 'react';
import { ActivityRings } from '../components/ActivityRings';
import { MastermindCard } from '../components/MastermindCard';
import { UserProfile, FoodLog, WorkoutLog, FatBurnerLog, DailyHabitLog } from '../types';
import { Flame, Utensils, Zap, Droplets, Footprints, Moon, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  foodLogs: FoodLog[];
  workoutLogs: WorkoutLog[];
  fatBurnerLogs: FatBurnerLog[];
  todayHabit: DailyHabitLog;
  onNavigateTab: (tab: 'nutrition' | 'workout' | 'fatburner' | 'health') => void;
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
  // Aggregate today's stats
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
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl glass-panel relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Halo, {profile.name} 👋
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
              {profile.goal === 'fat_loss' ? '🎯 Fat Loss Defisit' : profile.goal === 'muscle_gain' ? '💪 Muscle Gain' : '⚖️ Maintenance'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Target Harian: <strong className="text-slate-200">{profile.target_calories} kcal</strong> • Air: <strong className="text-slate-200">{profile.target_water_ml} ml</strong>
          </p>
        </div>

        {/* Net Calorie Metric Pill */}
        <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Flame size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Kalori Netto Hari Ini</p>
            <p className="text-sm font-extrabold text-white">
              {Math.round(netCalories)} <span className="text-[11px] font-normal text-slate-400">kcal</span>
            </p>
          </div>
        </div>
      </div>

      {/* 0. Triple Concentric Activity Rings */}
      <ActivityRings
        caloriesBurned={totalCaloriesBurned}
        caloriesTarget={400}
        activeMinutes={totalWorkoutMinutes}
        activeMinutesTarget={45}
        waterMl={todayHabit.water_ml}
        waterTarget={profile.target_water_ml || 2500}
      />

      {/* BUGAR Mastermind AI Recommendation Card */}
      <MastermindCard
        remainingCalories={remainingCalories}
        remainingProtein={remainingProtein}
        onApplyFood={onApplyFoodToJournal}
        onStartWorkout={onStartWorkout}
      />

      {/* Today's Nutrition & Macro Overview */}
      <div className="p-5 rounded-3xl glass-panel">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Utensils size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Keseimbangan Nutrisi</h2>
              <p className="text-xs text-slate-400">Konsumsi vs Batas Kuota Hari Ini</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('nutrition')}
            className="text-xs font-semibold text-emerald-400 flex items-center gap-1 hover:underline"
          >
            Buka Jurnal <ArrowUpRight size={14} />
          </button>
        </div>

        {/* 4 Macro Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Kalori */}
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Kalori Masuk</span>
              <span className="text-white font-bold">{Math.round(totalCaloriesConsumed)} kcal</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalCaloriesConsumed / profile.target_calories) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">Sisa: {Math.round(remainingCalories)} kcal</p>
          </div>

          {/* Protein */}
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-400 font-medium">Protein</span>
              <span className="text-white font-bold">{totalProteinConsumed.toFixed(0)} / {profile.target_protein_g}g</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalProteinConsumed / (profile.target_protein_g || 1)) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">Sisa: {remainingProtein.toFixed(0)}g</p>
          </div>

          {/* Karbohidrat */}
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-amber-400 font-medium">Karbo</span>
              <span className="text-white font-bold">{totalCarbsConsumed.toFixed(0)} / {profile.target_carbs_g}g</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalCarbsConsumed / (profile.target_carbs_g || 1)) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">Target: {profile.target_carbs_g}g</p>
          </div>

          {/* Lemak */}
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-rose-400 font-medium">Lemak</span>
              <span className="text-white font-bold">{totalFatConsumed.toFixed(0)} / {profile.target_fat_g}g</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalFatConsumed / (profile.target_fat_g || 1)) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">Target: {profile.target_fat_g}g</p>
          </div>
        </div>
      </div>

      {/* Today's Quick Segment Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Workout Tile */}
        <button
          onClick={() => onNavigateTab('workout')}
          className="p-4 rounded-3xl glass-card text-left hover:border-blue-500/40 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap size={20} />
            </div>
            <span className="text-xs font-semibold text-blue-400 flex items-center">
              Latihan <ArrowUpRight size={14} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400">Gym & Angkat Beban</p>
            <p className="text-base font-extrabold text-white mt-0.5">
              {workoutLogs.length > 0 ? `${workoutLogs.length} Sesi Selesai` : 'Belum Ada Latihan'}
            </p>
          </div>
        </button>

        {/* Fat Burner Tile */}
        <button
          onClick={() => onNavigateTab('fatburner')}
          className="p-4 rounded-3xl glass-card text-left hover:border-orange-500/40 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Flame size={20} />
            </div>
            <span className="text-xs font-semibold text-orange-400 flex items-center">
              Fat Burner <ArrowUpRight size={14} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400">HIIT & Bakar Lemak</p>
            <p className="text-base font-extrabold text-white mt-0.5">
              {fatBurnerLogs.length > 0 ? `${Math.round(fatBurnerCalories)} kcal Terbakar` : '12 Program Siap'}
            </p>
          </div>
        </button>

        {/* Health Habit Tile */}
        <button
          onClick={() => onNavigateTab('health')}
          className="p-4 rounded-3xl glass-card text-left hover:border-purple-500/40 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Footprints size={20} />
            </div>
            <span className="text-xs font-semibold text-purple-400 flex items-center">
              Kebiasaan <ArrowUpRight size={14} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400">Langkah & Tidur</p>
            <p className="text-base font-extrabold text-white mt-0.5">
              {todayHabit.steps.toLocaleString()} Langkah • {Math.round(todayHabit.sleep_minutes / 60)}j Tidur
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
