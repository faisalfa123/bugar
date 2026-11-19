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
import { AuthProvider, useAuth } from './services/authContext';
import { useDeviceMode } from './hooks/useDeviceMode';
import { getStoredTheme, BG_STYLES, ACCENT_COLORS } from './data/theme';
import { getLanguage, t } from './data/i18n';

import { Navbar } from './components/Navbar';
import { BottomNav, NavTab } from './components/BottomNav';
import { QuickActionModal } from './components/QuickActionModal';
import { PinLockModal } from './components/PinLockModal';
import { AuthModal } from './components/AuthModal';
import { MultiConnectModal } from './components/MultiConnectModal';

import { Dashboard } from './pages/Dashboard';
import { NutritionPage } from './pages/NutritionPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { FatBurnerPage } from './pages/FatBurnerPage';
import { HealthPage } from './pages/HealthPage';
import { SettingsPage } from './pages/SettingsPage';
import { ExerciseGuidePage } from './pages/ExerciseGuidePage';

const DEFAULT_PROFILE: UserProfile = {
  id: 'default-user',
  name: 'Pengguna Bugar',
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

const AppContent: React.FC = () => {
  const deviceMode = useDeviceMode();
  const { account, showAuthModal, setShowAuthModal } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavTab | 'settings'>('dashboard');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isMultiConnectOpen, setIsMultiConnectOpen] = useState(false);
  const [activeWorkoutToLaunch, setActiveWorkoutToLaunch] = useState<string | null>(null);

  // Dynamic Theme state
  const [theme, setTheme] = useState(getStoredTheme());

  useEffect(() => {
    const handleThemeChange = () => setTheme(getStoredTheme());
    window.addEventListener('bugar_theme_change', handleThemeChange);
    return () => window.removeEventListener('bugar_theme_change', handleThemeChange);
  }, []);

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
    user_id: account ? account.id : 'default-user',
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
  }, [account]);

  // Handlers
  const handleAddFoodLog = async (logData: Omit<FoodLog, 'id' | 'updated_at'>) => {
    const newLog: FoodLog = {
      ...logData,
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      updated_at: Date.now(),
    };
    await localDB.saveFoodLog(newLog);
    setFoodLogs((prev) => [newLog, ...prev]);
    syncService.syncNow();
  };

  const handleDeleteFoodLog = async (id: string) => {
    await localDB.deleteFoodLog(id);
    setFoodLogs((prev) => prev.filter((f) => f.id !== id));
    syncService.syncNow();
  };

  const handleApplyMastermindFood = async (
    items: { name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; portion: string }[]
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newLogs: FoodLog[] = items.map((item) => ({
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
    setFoodLogs((prev) => [...newLogs, ...prev]);
    syncService.syncNow();
  };

  const handleStartWorkoutFromWidget = (programId: string) => {
    setActiveWorkoutToLaunch(programId);
    setCurrentTab('fatburner');
  };

  const handleSaveWorkoutLog = async (log: WorkoutLog) => {
    await localDB.saveWorkoutLog(log);
    setWorkoutLogs((prev) => [log, ...prev]);
    syncService.syncNow();
  };

  const handleSaveCardioLog = async (log: CardioLog) => {
    await localDB.saveCardioLog(log);
    setCardioLogs((prev) => [log, ...prev]);
    syncService.syncNow();
  };

  const handleSaveFatBurnerLog = async (log: FatBurnerLog) => {
    await localDB.saveFatBurnerLog(log);
    setFatBurnerLogs((prev) => [log, ...prev]);
    syncService.syncNow();
  };

  const handleSaveBodyMetric = async (metric: BodyMetricLog) => {
    await localDB.saveBodyMetricLog(metric);
    setBodyMetrics((prev) => [metric, ...prev]);
    setProfile((prev) => ({ ...prev, weight_kg: metric.weight_kg }));
    syncService.syncNow();
  };

  const handleUpdateHabit = async (habit: DailyHabitLog) => {
    await localDB.saveDailyHabitLog(habit);
    setTodayHabit(habit);
    syncService.syncNow();
  };

  const handleAddCustomFood = async (food: FoodItem) => {
    await localDB.saveCustomFood(food);
    setCustomFoods((prev) => [food, ...prev]);
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await localDB.saveProfile(newProfile);
    syncService.syncNow();
  };

  const bgStyleConfig = BG_STYLES[theme.bgStyle] || BG_STYLES.mesh;

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col font-sans transition-all duration-300 antialiased"
      style={{ background: bgStyleConfig.cssBackground }}
    >
      {/* 
        Point 10: Tab Hanya Salah Satu Sesuai Deteksi Perangkat
        - Mode Desktop: Header Navbar Lengkap dengan navigasi tengah & kontrol. (Tanpa BottomNav)
        - Mode Mobile: Top bar ringkas khusus status & BottomNav ergonomis khusus jempol.
      */}
      {deviceMode === 'desktop' ? (
        <Navbar
          syncState={syncState}
          onSyncClick={() => syncService.syncNow()}
          onSettingsClick={() => setCurrentTab('settings')}
          onMultiConnectClick={() => setIsMultiConnectOpen(true)}
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
        />
      ) : (
        /* Mobile Compact Top Bar */
        <header className="sticky top-0 z-30 px-4 py-2.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between safe-top">
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight text-emerald-400">BUGAR</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
              ARM64
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMultiConnectOpen(true)}
              className="text-xs font-bold text-emerald-400 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800"
              style={{ cursor: 'pointer' }}
            >
              ⌚ Connect
            </button>
            <button
              onClick={() => setCurrentTab('settings')}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              style={{ cursor: 'pointer' }}
              aria-label={t('navSettings')}
            >
              ⚙️
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 ${deviceMode === 'mobile' ? 'pb-24' : 'pb-10'}`}>
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

        {currentTab === 'guide' && <ExerciseGuidePage />}

        {currentTab === 'settings' && (
          <SettingsPage
            profile={profile}
            syncState={syncState}
            onUpdateProfile={handleUpdateProfile}
            onManualSync={() => syncService.syncNow()}
          />
        )}
      </main>

      {/* 
        Point 10: Bottom Navigation Bar hanya dirender jika perangkat terdeteksi Mobile!
        Di Desktop, bilah navigasi ini disembunyikan sepenuhnya.
      */}
      {deviceMode === 'mobile' && (
        <BottomNav
          currentTab={currentTab === 'settings' ? 'dashboard' : currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          onQuickActionClick={() => setIsQuickActionOpen(true)}
        />
      )}

      {/* Quick Action Modal (+) */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onAddWater={(amt) =>
          handleUpdateHabit({ ...todayHabit, water_ml: todayHabit.water_ml + amt, updated_at: Date.now() })
        }
        onQuickLogWeight={(w) =>
          handleSaveBodyMetric({
            id: `metric-${Date.now()}`,
            user_id: profile.id,
            date: new Date().toISOString().split('T')[0],
            weight_kg: w,
            bmi: Math.round((w / Math.pow(profile.height_cm / 100, 2)) * 10) / 10,
            updated_at: Date.now(),
          })
        }
        onNavigateToFood={() => setCurrentTab('nutrition')}
        onStartQuickFatBurner={() => handleStartWorkoutFromWidget('prog-01')}
      />

      {/* PIN Security Modal */}
      <PinLockModal isOpen={isPinModalOpen} onSuccess={() => setIsPinModalOpen(false)} />

      {/* User Account Login / Registration Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Multi-Connect Hub Modal (Smartband BLE, Gym Cast, Apple/Google Sync) */}
      <MultiConnectModal isOpen={isMultiConnectOpen} onClose={() => setIsMultiConnectOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
