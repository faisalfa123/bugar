import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  FoodLog,
  WorkoutLog,
  CardioLog,
  FatBurnerLog,
  BodyMetricLog,
  DailyHabitLog,
  FoodItem,
} from './types';
import { localDB } from './services/db';
import { syncService, SyncState } from './services/syncService';

import { Navbar } from './components/Navbar';
import { BottomNav, NavTab } from './components/BottomNav';
import { QuickActionModal } from './components/QuickActionModal';
import { PinLockModal } from './components/PinLockModal';

import { Dashboard } from './pages/Dashboard';
import { NutritionPage } from './pages/NutritionPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { FatBurnerPage } from './pages/FatBurnerPage';
import { HealthPage } from './pages/HealthPage';
import { SettingsPage } from './pages/SettingsPage';
import { ExerciseGuidePage } from './pages/ExerciseGuidePage';

const DEFAULT_PROFILE: UserProfile = {
  id: 'user-01',
  name: 'Faisal',
  age: 28,
  gender: 'male',
  height_cm: 172,
  weight_kg: 72,
  activity_level: 1.375,
  goal: 'fat_loss',
  target_calories: 2000,
  target_protein_g: 140,
  target_carbs_g: 210,
  target_fat_g: 55,
  target_water_ml: 2500,
  updated_at: Date.now(),
};

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab | 'settings'>('dashboard');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [activeWorkoutToLaunch, setActiveWorkoutToLaunch] = useState<string | null>(null);

  // Core Data States
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [cardioLogs, setCardioLogs] = useState<CardioLog[]>([]);
  const [fatBurnerLogs, setFatBurnerLogs] = useState<FatBurnerLog[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricLog[]>([]);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [todayHabit, setTodayHabit] = useState<DailyHabitLog>({
    id: `habit-${new Date().toISOString().split('T')[0]}`,
    user_id: 'user-01',
    date: new Date().toISOString().split('T')[0],
    water_ml: 1250,
    sleep_minutes: 450,
    sleep_quality: 4,
    steps: 6420,
    updated_at: Date.now(),
  });

  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
    serverHealth: null,
    errorMessage: null,
  });

  // Load Initial Data from IndexedDB
  useEffect(() => {
    async function loadData() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const [savedProfile, savedFoods, savedWorkouts, savedCardio, savedFatBurners, savedMetrics, savedHabits, savedCustom] =
          await Promise.all([
            localDB.getProfile(),
            localDB.getFoodLogs(todayStr),
            localDB.getWorkoutLogs(),
            localDB.getCardioLogs(),
            localDB.getFatBurnerLogs(),
            localDB.getBodyMetricLogs(),
            localDB.getDailyHabitLogs(todayStr),
            localDB.getCustomFoods(),
          ]);

        if (savedProfile) {
          setProfile(savedProfile);
        } else {
          await localDB.saveProfile(DEFAULT_PROFILE);
        }

        setFoodLogs(savedFoods);
        setWorkoutLogs(savedWorkouts);
        setCardioLogs(savedCardio);
        setFatBurnerLogs(savedFatBurners);
        setBodyMetrics(savedMetrics);
        setCustomFoods(savedCustom);

        if (savedHabits.length > 0) {
          setTodayHabit(savedHabits[0]);
        }
      } catch (err) {
        console.error('Error loading IndexedDB data:', err);
      }
    }

    loadData();

    // Subscribe to sync service
    const unsubscribe = syncService.subscribe((state) => {
      setSyncState(state);
      if (state.serverHealth?.pin_protected && !syncService.getAuthToken()) {
        setIsPinModalOpen(true);
      }
    });

    // Check server health
    syncService.checkHealth();

    return () => unsubscribe();
  }, []);

  // Handlers
  const handleAddFoodLog = async (logData: Omit<FoodLog, 'id' | 'updated_at'>) => {
    const newLog: FoodLog = {
      ...logData,
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      updated_at: Date.now(),
    };
    await localDB.saveFoodLog(newLog);
    setFoodLogs(prev => [newLog, ...prev]);
    syncService.syncNow();
  };

  const handleDeleteFoodLog = async (id: string) => {
    await localDB.deleteFoodLog(id);
    setFoodLogs(prev => prev.filter(f => f.id !== id));
    syncService.syncNow();
  };

  const handleApplyMastermindFood = async (
    items: { name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; portion: string }[]
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newLogs: FoodLog[] = items.map(item => ({
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: profile.id,
      date: todayStr,
      meal_type: 'lunch',
      food_name: item.name,
      serving_count: 1,
      serving_unit: item.portion,
      calories: item.calories,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
      updated_at: Date.now(),
    }));

    for (const log of newLogs) {
      await localDB.saveFoodLog(log);
    }
    setFoodLogs(prev => [...newLogs, ...prev]);
    syncService.syncNow();
  };

  const handleStartWorkoutFromWidget = (programId: string) => {
    setActiveWorkoutToLaunch(programId);
    setCurrentTab('fatburner');
  };

  const handleSaveWorkoutLog = async (log: WorkoutLog) => {
    await localDB.saveWorkoutLog(log);
    setWorkoutLogs(prev => [log, ...prev]);
    syncService.syncNow();
  };

  const handleSaveCardioLog = async (log: CardioLog) => {
    await localDB.saveCardioLog(log);
    setCardioLogs(prev => [log, ...prev]);
    syncService.syncNow();
  };

  const handleSaveFatBurnerLog = async (log: FatBurnerLog) => {
    await localDB.saveFatBurnerLog(log);
    setFatBurnerLogs(prev => [log, ...prev]);
    syncService.syncNow();
  };

  const handleSaveBodyMetric = async (metric: BodyMetricLog) => {
    await localDB.saveBodyMetricLog(metric);
    setBodyMetrics(prev => [...prev, metric]);
    // Also update profile weight
    const updatedProfile = { ...profile, weight_kg: metric.weight_kg, updated_at: Date.now() };
    await localDB.saveProfile(updatedProfile);
    setProfile(updatedProfile);
    syncService.syncNow();
  };

  const handleUpdateHabit = async (habit: DailyHabitLog) => {
    await localDB.saveDailyHabitLog(habit);
    setTodayHabit(habit);
    syncService.syncNow();
  };

  const handleAddCustomFood = async (food: FoodItem) => {
    await localDB.saveCustomFood(food);
    setCustomFoods(prev => [food, ...prev]);
  };

  const handleUpdateProfile = async (updated: UserProfile) => {
    await localDB.saveProfile(updated);
    setProfile(updated);
    syncService.syncNow();
  };

  return (
    <div className="min-h-screen bg-obsidian text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Top Navbar */}
      <Navbar
        syncState={syncState}
        onSyncClick={() => syncService.syncNow()}
        onSettingsClick={() => setCurrentTab('settings')}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5">
        {currentTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            foodLogs={foodLogs}
            workoutLogs={workoutLogs}
            fatBurnerLogs={fatBurnerLogs}
            todayHabit={todayHabit}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onApplyFoodToJournal={handleApplyMastermindFood}
            onStartWorkout={handleStartWorkoutFromWidget}
          />
        )}

        {currentTab === 'nutrition' && (
          <NutritionPage
            profile={profile}
            foodLogs={foodLogs}
            customFoods={customFoods}
            onAddFoodLog={handleAddFoodLog}
            onDeleteFoodLog={handleDeleteFoodLog}
            onAddCustomFood={handleAddCustomFood}
          />
        )}

        {currentTab === 'workout' && (
          <WorkoutPage
            profile={profile}
            workoutLogs={workoutLogs}
            cardioLogs={cardioLogs}
            onSaveWorkoutLog={handleSaveWorkoutLog}
            onSaveCardioLog={handleSaveCardioLog}
          />
        )}

        {currentTab === 'fatburner' && (
          <FatBurnerPage
            profile={profile}
            fatBurnerLogs={fatBurnerLogs}
            onSaveFatBurnerLog={handleSaveFatBurnerLog}
            activeProgramIdToLaunch={activeWorkoutToLaunch}
            onClearActiveLaunch={() => setActiveWorkoutToLaunch(null)}
          />
        )}

        {currentTab === 'health' && (
          <HealthPage
            profile={profile}
            bodyMetrics={bodyMetrics}
            todayHabit={todayHabit}
            onSaveBodyMetric={handleSaveBodyMetric}
            onUpdateHabit={handleUpdateHabit}
          />
        )}

        {currentTab === 'guide' && (
          <ExerciseGuidePage />
        )}

        {currentTab === 'settings' && (
          <SettingsPage
            profile={profile}
            syncState={syncState}
            onUpdateProfile={handleUpdateProfile}
            onManualSync={() => syncService.syncNow()}
          />
        )}
      </main>

      {/* Floating Bottom Navigation (Mobile Native UX) */}
      <BottomNav
        currentTab={currentTab === 'settings' ? 'dashboard' : currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onQuickActionClick={() => setIsQuickActionOpen(true)}
      />

      {/* Quick Action Modal (+) */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onAddWater={(amt) => handleUpdateHabit({ ...todayHabit, water_ml: todayHabit.water_ml + amt, updated_at: Date.now() })}
        onQuickLogWeight={(w) => handleSaveBodyMetric({
          id: `metric-${Date.now()}`,
          user_id: profile.id,
          date: new Date().toISOString().split('T')[0],
          weight_kg: w,
          bmi: Math.round((w / Math.pow(profile.height_cm / 100, 2)) * 10) / 10,
          updated_at: Date.now(),
        })}
        onNavigateToFood={() => setCurrentTab('nutrition')}
        onStartQuickFatBurner={() => handleStartWorkoutFromWidget('prog-01')}
      />

      {/* PIN Security Modal */}
      <PinLockModal
        isOpen={isPinModalOpen}
        onSuccess={() => setIsPinModalOpen(false)}
      />
    </div>
  );
};

export default App;
