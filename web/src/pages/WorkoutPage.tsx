import React, { useState, useEffect } from 'react';
import { WorkoutLog, CardioLog, UserProfile } from '../types';
import { audioSynth } from '../services/audioSynth';
import { EXERCISE_GUIDES, ExerciseGuide } from '../data/exerciseGuides';
import { ExerciseFormPlayer } from '../components/ExerciseFormPlayer';
import { ActiveRecoveryGuide } from '../components/ActiveRecoveryGuide';
import {
  Dumbbell,
  Play,
  Check,
  Plus,
  Trophy,
  Timer,
  Flame,
  Footprints,
  Compass,
  ArrowRight,
  ChevronDown,
  RotateCcw,
  Zap,
  MousePointerClick
} from 'lucide-react';

interface WorkoutPageProps {
  profile: UserProfile;
  workoutLogs: WorkoutLog[];
  cardioLogs: CardioLog[];
  onSaveWorkoutLog: (log: WorkoutLog) => void;
  onSaveCardioLog: (log: CardioLog) => void;
}

interface RoutineTemplate {
  name: string;
  focus: string;
  exercises: string[];
}

const TEMPLATES: RoutineTemplate[] = [
  {
    name: 'Push Day (Dada, Bahu, Trisep)',
    focus: 'Hypertrophy & Kekuatan Dorong',
    exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Dumbbell Lateral Raise', 'Triceps Rope Pushdown']
  },
  {
    name: 'Pull Day (Punggung, Bisep)',
    focus: 'Lebar Punggung & Ketebalan',
    exercises: ['Lat Pulldown / Pull-up', 'Barbell Bent Over Row', 'Face Pulls', 'Barbell Biceps Curl']
  },
  {
    name: 'Leg Day (Paha & Bokong)',
    focus: 'Kekuatan Kaki Menyeluruh',
    exercises: ['Barbell Back Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raises']
  },
  {
    name: 'Full Body Compound',
    focus: 'Efisien 3x Seminggu',
    exercises: ['Deadlift Konvensional', 'Overhead Shoulder Press', 'Dumbbell Lunges', 'Dips']
  },
  {
    name: 'Upper Body Power',
    focus: 'Tubuh Bagian Atas',
    exercises: ['Incline Barbell Press', 'Chest Supported Row', 'Dumbbell Shoulder Press', 'Hammer Curls']
  }
];

export const WorkoutPage: React.FC<WorkoutPageProps> = ({
  profile,
  workoutLogs,
  cardioLogs,
  onSaveWorkoutLog,
  onSaveCardioLog,
}) => {
  const [activeTab, setActiveTab] = useState<'gym' | 'cardio' | 'history'>('gym');

  // Gym Active Session State
  const [activeRoutine, setActiveRoutine] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [activeExercises, setActiveExercises] = useState<{
    name: string;
    sets: { set_number: number; weight_kg: number; reps: number; completed: boolean; is_pr?: boolean }[];
  }[]>([]);

  // Rest Timer & Progression Mode State ('manual' = Langsung Next, 'timer' = Detik Otomatis, 'clicker' = Ketuk Repetisi)
  const [progressionMode, setProgressionMode] = useState<'manual' | 'timer' | 'clicker'>('timer');
  const [currentRepClickCount, setCurrentRepClickCount] = useState<number>(0);
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [initialRestDuration, setInitialRestDuration] = useState<number>(90);

  // Form Guide Modal State
  const [selectedFormGuide, setSelectedFormGuide] = useState<ExerciseGuide | null>(null);

  const openFormGuideForExercise = (exerciseName: string) => {
    const nameLower = exerciseName.toLowerCase();
    let guide = EXERCISE_GUIDES.find(g => nameLower.includes(g.id) || nameLower.includes(g.name.toLowerCase()));
    if (!guide) {
      if (nameLower.includes('press') || nameLower.includes('push') || nameLower.includes('dada')) guide = EXERCISE_GUIDES[0];
      else if (nameLower.includes('squat') || nameLower.includes('leg') || nameLower.includes('paha')) guide = EXERCISE_GUIDES[1];
      else if (nameLower.includes('pull') || nameLower.includes('row') || nameLower.includes('lat')) guide = EXERCISE_GUIDES[3];
      else if (nameLower.includes('curl') || nameLower.includes('biceps')) guide = EXERCISE_GUIDES[5];
      else if (nameLower.includes('lunge')) guide = EXERCISE_GUIDES[4];
      else guide = EXERCISE_GUIDES[0];
    }
    setSelectedFormGuide(guide);
  };

  // Cardio Form State
  const [cardioType, setCardioType] = useState<'running' | 'walking' | 'cycling' | 'swimming'>('running');
  const [cardioDistance, setCardioDistance] = useState<string>('5.0');
  const [cardioDuration, setCardioDuration] = useState<string>('30');

  // Countdown effect for Rest Timer
  useEffect(() => {
    if (restSeconds === null || restSeconds <= 0) return;
    const interval = setInterval(() => {
      setRestSeconds(prev => {
        if (prev === null || prev <= 1) {
          audioSynth.playRestFinished();
          return null;
        }
        if (prev <= 4) {
          audioSynth.playCountdownTick();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restSeconds]);

  const startRoutine = (tpl: RoutineTemplate) => {
    setActiveRoutine(tpl.name);
    setSessionStartTime(Date.now());
    setActiveExercises(
      tpl.exercises.map(name => ({
        name,
        sets: [
          { set_number: 1, weight_kg: 50, reps: 10, completed: false },
          { set_number: 2, weight_kg: 50, reps: 10, completed: false },
          { set_number: 3, weight_kg: 50, reps: 10, completed: false },
        ]
      }))
    );
  };

  const handleToggleSetComplete = (exIdx: number, setIdx: number) => {
    setActiveExercises(prev => {
      const copy = [...prev];
      const targetSet = copy[exIdx].sets[setIdx];
      const newStatus = !targetSet.completed;
      targetSet.completed = newStatus;

      // Detect PR (Personal Record check against historical weight * reps)
      if (newStatus) {
        let maxPast = 0;
        for (const log of workoutLogs) {
          for (const ex of log.exercises) {
            if (ex.name.toLowerCase() === copy[exIdx].name.toLowerCase()) {
              for (const s of ex.sets) {
                const vol = s.weight_kg * s.reps;
                if (vol > maxPast) maxPast = vol;
              }
            }
          }
        }
        if (targetSet.weight_kg * targetSet.reps > maxPast && maxPast > 0) {
          targetSet.is_pr = true;
        }

        // Progression mode handling
        setCurrentRepClickCount(0);
        if (progressionMode === 'manual') {
          setRestSeconds(null);
        } else {
          setRestSeconds(initialRestDuration);
        }
      }
      return copy;
    });
  };

  // Find currently active (first uncompleted) set for the clicker interface
  const getActiveUncompletedSet = () => {
    for (let exIdx = 0; exIdx < activeExercises.length; exIdx++) {
      for (let setIdx = 0; setIdx < activeExercises[exIdx].sets.length; setIdx++) {
        if (!activeExercises[exIdx].sets[setIdx].completed) {
          return {
            exIdx,
            setIdx,
            exerciseName: activeExercises[exIdx].name,
            set: activeExercises[exIdx].sets[setIdx],
          };
        }
      }
    }
    return null;
  };

  const handleClickerAddRep = () => {
    const activeInfo = getActiveUncompletedSet();
    if (!activeInfo) return;

    const nextCount = currentRepClickCount + 1;
    setCurrentRepClickCount(nextCount);
    audioSynth.playCountdownTick();

    if (nextCount >= activeInfo.set.reps) {
      handleToggleSetComplete(activeInfo.exIdx, activeInfo.setIdx);
    }
  };

  const handleFinishWorkout = () => {
    if (!activeRoutine || !sessionStartTime) return;

    const durationMins = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
    let totalVol = 0;
    let hasPr = false;

    for (const ex of activeExercises) {
      for (const s of ex.sets) {
        if (s.completed) {
          totalVol += s.weight_kg * s.reps;
          if (s.is_pr) hasPr = true;
        }
      }
    }

    const log: WorkoutLog = {
      id: `wo-${Date.now()}`,
      user_id: profile.id,
      date: new Date().toISOString().split('T')[0],
      routine_name: activeRoutine,
      exercises: activeExercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.map(s => ({
          set_number: s.set_number,
          weight_kg: s.weight_kg,
          reps: s.reps,
          completed: s.completed,
        }))
      })),
      duration_minutes: durationMins,
      total_volume_kg: totalVol,
      is_pr: hasPr,
      updated_at: Date.now(),
    };

    onSaveWorkoutLog(log);
    audioSynth.playVictoryFanfare();
    setActiveRoutine(null);
    setSessionStartTime(null);
    setRestSeconds(null);
  };

  const handleSaveCardio = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = parseFloat(cardioDistance) || 0;
    const dur = parseFloat(cardioDuration) || 1;

    // Pace: min per km
    const pace = dist > 0 ? dur / dist : 0;
    // Speed: km per hour
    const speed = dur > 0 ? (dist / (dur / 60)) : 0;
    // Estimated calories burned
    const met = cardioType === 'running' ? 9.8 : cardioType === 'cycling' ? 7.5 : cardioType === 'swimming' ? 8.0 : 4.0;
    const calories = Math.round((met * 3.5 * profile.weight_kg / 200) * dur);

    const log: CardioLog = {
      id: `cardio-${Date.now()}`,
      user_id: profile.id,
      date: new Date().toISOString().split('T')[0],
      activity_type: cardioType,
      distance_km: dist,
      duration_minutes: dur,
      pace_min_km: Math.round(pace * 10) / 10,
      avg_speed_kmh: Math.round(speed * 10) / 10,
      calories_burned: calories,
      updated_at: Date.now(),
    };

    onSaveCardioLog(log);
    audioSynth.playVictoryFanfare();
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl glass-panel relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Dumbbell size={18} />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">Pencatatan Workout & Kardio</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Gaya Hevy & Strava dengan deteksi Rekor Pribadi (PR) dan Rest Timer
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-2xl bg-slate-900/80 p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('gym')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'gym' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏋️ Gym Tracker
            </button>
            <button
              onClick={() => setActiveTab('cardio')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'cardio' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏃 Kardio & Outdoor
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'history' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              📜 Riwayat ({workoutLogs.length + cardioLogs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Floating Auto-Rest Timer Banner (When Active) */}
      {restSeconds !== null && (
        <div className="sticky top-20 z-30 p-4 rounded-2xl bg-blue-950/90 border border-blue-500/40 backdrop-blur-md flex items-center justify-between shadow-xl animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-slate-950 flex items-center justify-center font-black">
              <Timer size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-300">Auto-Rest Timer Antar Set</p>
              <p className="text-xl font-black text-white tracking-wider font-mono">
                {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestSeconds(prev => (prev || 0) + 30)}
              className="px-2.5 py-1.5 rounded-lg bg-blue-800/80 hover:bg-blue-700 text-xs font-semibold text-white"
            >
              +30s
            </button>
            <button
              onClick={() => setRestSeconds(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
            >
              Lewati
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: GYM TRACKER */}
      {activeTab === 'gym' && (
        <div className="space-y-4">
          {!activeRoutine ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-white tracking-tight">Pilih Template Latihan</h2>
                <span className="text-xs text-slate-400">{TEMPLATES.length} Template Siap Pakai</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TEMPLATES.map((tpl, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-3xl glass-card border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-white">{tpl.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold">
                          4 Gerakan
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{tpl.focus}</p>
                      <div className="space-y-1 mb-4">
                        {tpl.exercises.map((ex, i) => (
                          <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            <span>{ex}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => startRoutine(tpl)}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                    >
                      <Play size={14} fill="currentColor" /> Mulai Sesi Latihan Ini
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Live Workout Session */
            <div className="p-5 rounded-3xl glass-panel border border-blue-500/30">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 uppercase tracking-wider">
                    Sesi Berlangsung
                  </span>
                  <h2 className="text-lg font-black text-white mt-1">{activeRoutine}</h2>
                </div>

                <button
                  onClick={handleFinishWorkout}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <Check size={16} /> Selesaikan Workout
                </button>
              </div>

              {/* Progression Mode Switcher */}
              <div className="py-3 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold px-2">Mode Set:</span>
                  {[
                    { id: 'manual', label: 'Langsung Next', icon: Zap },
                    { id: 'timer', label: 'Detik Otomatis', icon: Timer },
                    { id: 'clicker', label: 'Ketuk Repetisi', icon: MousePointerClick },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setProgressionMode(mode.id as any);
                          setCurrentRepClickCount(0);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          progressionMode === mode.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <Icon size={12} />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>

                {/* Rest timer preset selector (when in timer mode) */}
                {progressionMode === 'timer' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px] font-medium">Jeda:</span>
                    {[45, 60, 90, 120].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setInitialRestDuration(s)}
                        className={`px-2 py-0.5 rounded-md border text-[11px] font-mono ${
                          initialRestDuration === s
                            ? 'bg-blue-600 text-white border-blue-500 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        {s}s
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Recovery Floating Card during Rest */}
              {restSeconds !== null && restSeconds > 0 && (
                <div className="my-4">
                  <ActiveRecoveryGuide
                    remainingSeconds={restSeconds}
                    totalSeconds={initialRestDuration}
                    nextExerciseName={getActiveUncompletedSet()?.exerciseName}
                    nextSetInfo={getActiveUncompletedSet() ? `Set ${getActiveUncompletedSet()!.set.set_number} • ${getActiveUncompletedSet()!.set.weight_kg}kg` : undefined}
                    onSkipRest={() => setRestSeconds(null)}
                    onAdjustSeconds={(delta) => setRestSeconds(prev => Math.max(5, (prev || 0) + delta))}
                  />
                </div>
              )}

              {/* Rep Clicker Banner when in Clicker Mode & not resting */}
              {progressionMode === 'clicker' && (restSeconds === null || restSeconds <= 0) && getActiveUncompletedSet() && (
                <div className="my-4 p-4 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 uppercase tracking-wider">
                      Penghitung Repetisi Aktif
                    </span>
                    <h3 className="text-base font-black text-white mt-1">
                      {getActiveUncompletedSet()!.exerciseName} (Set {getActiveUncompletedSet()!.set.set_number})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Beban: <strong className="text-white font-mono">{getActiveUncompletedSet()!.set.weight_kg} kg</strong> • Target: <strong className="text-emerald-400 font-mono">{getActiveUncompletedSet()!.set.reps} Reps</strong>
                    </p>
                  </div>

                  {/* Big Tap Clicker Button */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleClickerAddRep}
                      className="px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-base shadow-xl shadow-blue-600/30 flex items-center gap-3 transition-all"
                      style={{ cursor: 'pointer' }}
                    >
                      <MousePointerClick size={22} className="animate-bounce" />
                      <span>Ketuk Tiap Rep ({currentRepClickCount} / {getActiveUncompletedSet()!.set.reps})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleSetComplete(getActiveUncompletedSet()!.exIdx, getActiveUncompletedSet()!.setIdx)}
                      className="px-3 py-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold border border-emerald-500/30"
                      title="Selesaikan Langsung Set Ini"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}

              {/* Exercises Sets Logger */}
              <div className="space-y-5 mt-4">
                {activeExercises.map((exercise, exIdx) => (
                  <div key={exIdx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        {exercise.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => openFormGuideForExercise(exercise.name)}
                        className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition-colors"
                      >
                        <Play size={11} />
                        Panduan Form
                      </button>
                    </div>

                    {/* Sets Table Header */}
                    <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 pb-1 border-b border-slate-800 text-center">
                      <span className="col-span-2">SET</span>
                      <span className="col-span-4">BEBAN (KG)</span>
                      <span className="col-span-4">REPS</span>
                      <span className="col-span-2">STATUS</span>
                    </div>

                    {/* Sets Rows */}
                    <div className="divide-y divide-slate-800/40">
                      {exercise.sets.map((set, setIdx) => (
                        <div
                          key={setIdx}
                          className={`grid grid-cols-12 gap-2 py-2 items-center text-xs text-center transition-colors ${
                            set.completed ? 'bg-emerald-500/5' : ''
                          }`}
                        >
                          <span className="col-span-2 font-mono font-bold text-slate-400">
                            {set.set_number}
                          </span>

                          {/* Weight input */}
                          <div className="col-span-4">
                            <input
                              type="number"
                              value={set.weight_kg}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setActiveExercises(prev => {
                                  const copy = [...prev];
                                  copy[exIdx].sets[setIdx].weight_kg = val;
                                  return copy;
                                });
                              }}
                              className="w-full text-center py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* Reps input */}
                          <div className="col-span-4">
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setActiveExercises(prev => {
                                  const copy = [...prev];
                                  copy[exIdx].sets[setIdx].reps = val;
                                  return copy;
                                });
                              }}
                              className="w-full text-center py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* Checkbox button */}
                          <div className="col-span-2 flex items-center justify-center">
                            <button
                              onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                set.completed
                                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <Check size={16} strokeWidth={2.8} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add set button */}
                    <button
                      onClick={() => {
                        setActiveExercises(prev => {
                          const copy = [...prev];
                          const lastSet = copy[exIdx].sets[copy[exIdx].sets.length - 1];
                          copy[exIdx].sets.push({
                            set_number: copy[exIdx].sets.length + 1,
                            weight_kg: lastSet ? lastSet.weight_kg : 50,
                            reps: lastSet ? lastSet.reps : 10,
                            completed: false,
                          });
                          return copy;
                        });
                      }}
                      className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Plus size={13} /> Tambah Set
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KARDIO & OUTDOOR */}
      {activeTab === 'cardio' && (
        <div className="p-5 rounded-3xl glass-panel">
          <h2 className="text-base font-bold text-white mb-1">Catat Aktivitas Kardio & Outdoor</h2>
          <p className="text-xs text-slate-400 mb-5">
            Otomatis menghitung pace (menit/km), kecepatan rata-rata, dan kalori terbakar.
          </p>

          <form onSubmit={handleSaveCardio} className="space-y-4 text-xs">
            {/* Activity Type Selector */}
            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Jenis Aktivitas</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'running', label: '🏃 Lari', desc: 'Running' },
                  { id: 'walking', label: '🚶 Jalan Cepat', desc: 'Brisk Walk' },
                  { id: 'cycling', label: '🚴 Bersepeda', desc: 'Cycling' },
                  { id: 'swimming', label: '🏊 Berenang', desc: 'Swimming' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCardioType(item.id as typeof cardioType)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      cardioType === item.id
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Distance & Duration Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Jarak Tempuh (km)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="5.0"
                  value={cardioDistance}
                  onChange={(e) => setCardioDistance(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Durasi (Menit)</label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="30"
                  value={cardioDuration}
                  onChange={(e) => setCardioDuration(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Live Pace & Metric Preview */}
            {parseFloat(cardioDistance) > 0 && parseFloat(cardioDuration) > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Pace Rata-rata</p>
                  <p className="text-sm font-mono font-bold text-blue-400 mt-0.5">
                    {(parseFloat(cardioDuration) / parseFloat(cardioDistance)).toFixed(2)} min/km
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Kecepatan</p>
                  <p className="text-sm font-mono font-bold text-white mt-0.5">
                    {(parseFloat(cardioDistance) / (parseFloat(cardioDuration) / 60)).toFixed(1)} km/j
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Estimasi Kalori</p>
                  <p className="text-sm font-mono font-bold text-orange-400 mt-0.5">
                    ~{Math.round(parseFloat(cardioDuration) * 11)} kcal
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Check size={16} /> Simpan Aktivitas Kardio Ini
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: RIWAYAT SESI */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {workoutLogs.length === 0 && cardioLogs.length === 0 ? (
            <div className="p-8 rounded-3xl glass-panel text-center">
              <p className="text-xs text-slate-400">Belum ada catatan latihan tersimpan.</p>
            </div>
          ) : (
            <>
              {workoutLogs.map(log => (
                <div key={log.id} className="p-4 rounded-3xl glass-card border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{log.routine_name}</span>
                        {log.is_pr && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center gap-1">
                            <Trophy size={11} /> PR
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">📅 {log.date} • ⏱️ {log.duration_minutes} Menit</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      Total {Math.round(log.total_volume_kg)} kg Volume
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {log.exercises.map((ex, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {ex.name} ({ex.sets.filter(s => s.completed).length} set)
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {cardioLogs.map(c => (
                <div key={c.id} className="p-4 rounded-3xl glass-card border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                      🏃
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white capitalize">{c.activity_type} Outdoor</p>
                      <p className="text-[11px] text-slate-400">
                        {c.date} • {c.distance_km} km ({c.duration_minutes} mnt) • Pace {c.pace_min_km} m/km
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-orange-400">
                    +{c.calories_burned} kcal
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Exercise Form Tutorial Modal */}
      {selectedFormGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-3 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-lg my-auto">
            <ExerciseFormPlayer
              guide={selectedFormGuide}
              onClose={() => setSelectedFormGuide(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
