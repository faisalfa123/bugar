import React, { useState } from 'react';
import { UserProfile, BodyMetricLog, DailyHabitLog } from '../types';
import { calculateBodyFatPct } from '../engine/mastermindEngine';
import { healthBridge } from '../services/healthBridge';
import {
  HeartPulse,
  Scale,
  Droplets,
  Moon,
  Footprints,
  Plus,
  TrendingDown,
  Sparkles,
  Info,
  Check
} from 'lucide-react';

interface HealthPageProps {
  profile: UserProfile;
  bodyMetrics: BodyMetricLog[];
  todayHabit: DailyHabitLog;
  onSaveBodyMetric: (metric: BodyMetricLog) => void;
  onUpdateHabit: (habit: DailyHabitLog) => void;
}

export const HealthPage: React.FC<HealthPageProps> = ({
  profile,
  bodyMetrics,
  todayHabit,
  onSaveBodyMetric,
  onUpdateHabit,
}) => {
  // Metric Form State
  const [weightInput, setWeightInput] = useState<string>(profile.weight_kg.toString());
  const [neckInput, setNeckInput] = useState<string>('38');
  const [waistInput, setWaistInput] = useState<string>('84');
  const [hipInput, setHipInput] = useState<string>('95');
  const [justSavedMetric, setJustSavedMetric] = useState(false);

  // Sleep Form State
  const [sleepHours, setSleepHours] = useState<string>('7.5');
  const [sleepStars, setSleepStars] = useState<number>(4);

  // Native sync status
  const [nativeSyncMsg, setNativeSyncMsg] = useState<string | null>(null);

  // BMI Calculation
  const currentWeight = parseFloat(weightInput) || profile.weight_kg;
  const heightM = profile.height_cm / 100;
  const currentBmi = heightM > 0 ? currentWeight / (heightM * heightM) : 22;

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Kurus (Underweight)', color: 'text-amber-400 bg-amber-500/10' };
    if (bmi < 25) return { label: 'Ideal (Normal)', color: 'text-emerald-400 bg-emerald-500/10' };
    if (bmi < 30) return { label: 'Kelebihan Berat (Overweight)', color: 'text-orange-400 bg-orange-500/10' };
    return { label: 'Obesitas (Obese)', color: 'text-rose-400 bg-rose-500/10' };
  };

  const bmiCat = getBmiCategory(currentBmi);

  // US Navy Body Fat % Estimation
  const calculatedBf = calculateBodyFatPct(
    profile.gender,
    profile.height_cm,
    parseFloat(neckInput) || 38,
    parseFloat(waistInput) || 84,
    parseFloat(hipInput) || 95
  );

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightInput) || profile.weight_kg;
    const neck = parseFloat(neckInput) || undefined;
    const waist = parseFloat(waistInput) || undefined;
    const hip = parseFloat(hipInput) || undefined;

    const metric: BodyMetricLog = {
      id: `metric-${Date.now()}`,
      user_id: profile.id,
      date: new Date().toISOString().split('T')[0],
      weight_kg: w,
      neck_cm: neck,
      waist_cm: waist,
      hip_cm: hip,
      bmi: Math.round(currentBmi * 10) / 10,
      body_fat_pct: calculatedBf,
      updated_at: Date.now(),
    };

    onSaveBodyMetric(metric);
    setJustSavedMetric(true);
    setTimeout(() => setJustSavedMetric(false), 2500);
  };

  const handleAddWater = (amount: number) => {
    const updated: DailyHabitLog = {
      ...todayHabit,
      water_ml: Math.max(0, todayHabit.water_ml + amount),
      updated_at: Date.now(),
    };
    onUpdateHabit(updated);
  };

  const handleSaveSleep = () => {
    const mins = Math.round((parseFloat(sleepHours) || 7) * 60);
    const updated: DailyHabitLog = {
      ...todayHabit,
      sleep_minutes: mins,
      sleep_quality: sleepStars,
      updated_at: Date.now(),
    };
    onUpdateHabit(updated);
  };

  const handleNativeBridgeSync = async () => {
    setNativeSyncMsg('Menghubungkan ke Apple HealthKit / Google Health Connect...');
    const data = await healthBridge.queryTodayStats();
    setTimeout(() => {
      const updated: DailyHabitLog = {
        ...todayHabit,
        steps: data.steps,
        updated_at: Date.now(),
      };
      onUpdateHabit(updated);
      setNativeSyncMsg(`Sinkronisasi Berhasil: ${data.steps.toLocaleString()} Langkah terdeteksi!`);
      setTimeout(() => setNativeSyncMsg(null), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl glass-panel relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <HeartPulse size={18} />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">Pusat Kesehatan & Biometrik</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Gaya Apple Health & Google Fit: Komposisi tubuh, hidrasi, tidur, dan langkah kaki
            </p>
          </div>
        </div>
      </div>

      {/* 1. Body Composition & Metrics (BMI & Body Fat %) */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Scale size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Metrik Komposisi Tubuh</h2>
              <p className="text-xs text-slate-400">Kalkulator BMI & Estimasi Body Fat % (Metode US Navy)</p>
            </div>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${bmiCat.color} border-current/20`}>
            {bmiCat.label}
          </span>
        </div>

        {/* BMI & Body Fat Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Indeks Massa Tubuh (BMI)</p>
            <p className="text-2xl font-black text-white font-mono mt-1">
              {currentBmi.toFixed(1)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Rentang ideal: 18.5 - 24.9</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Estimasi Body Fat %</p>
            <p className="text-2xl font-black text-purple-400 font-mono mt-1">
              {calculatedBf.toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Rumus US Navy</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center col-span-2 sm:col-span-1">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Berat Badan Terakhir</p>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {currentWeight.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Tinggi: {profile.height_cm} cm</p>
          </div>
        </div>

        {/* Inputs for measurements */}
        <form onSubmit={handleSaveMetrics} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Berat Badan (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Lingkar Leher (cm)</label>
              <input
                type="number"
                step="0.5"
                value={neckInput}
                onChange={(e) => setNeckInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Lingkar Pinggang (cm)</label>
              <input
                type="number"
                step="0.5"
                value={waistInput}
                onChange={(e) => setWaistInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Lingkar Pinggul (cm)</label>
              <input
                type="number"
                step="0.5"
                value={hipInput}
                onChange={(e) => setHipInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
          >
            {justSavedMetric ? <Check size={14} /> : <Plus size={14} />}
            {justSavedMetric ? 'Metrik Berhasil Disimpan!' : 'Simpan Data Pengukuran Hari Ini'}
          </button>
        </form>
      </div>

      {/* 2. Hydration Tracker */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Droplets size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Pelacak Hidrasi Air</h2>
              <p className="text-xs text-slate-400">Target disesuaikan dengan berat badan ({profile.target_water_ml} ml)</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-emerald-400">
            {Math.round(todayHabit.water_ml)} / {profile.target_water_ml} ml
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 mb-4">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, (todayHabit.water_ml / (profile.target_water_ml || 2500)) * 100)}%` }}
          />
        </div>

        {/* Quick add water buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => handleAddWater(250)}
            className="py-2.5 px-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <Droplets size={14} className="text-emerald-400" /> +250 ml (Gelas)
          </button>
          <button
            onClick={() => handleAddWater(500)}
            className="py-2.5 px-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <Droplets size={14} className="text-emerald-400" /> +500 ml (Botol)
          </button>
          <button
            onClick={() => handleAddWater(-250)}
            className="py-2.5 px-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 flex items-center justify-center transition-all"
          >
            -250 ml
          </button>
        </div>
      </div>

      {/* 3. Sleep & Step Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sleep Log */}
        <div className="p-5 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Moon size={16} />
                </div>
                <h3 className="text-sm font-bold text-white">Pencatat Tidur Semalam</h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400">
                {(todayHabit.sleep_minutes / 60).toFixed(1)} Jam
              </span>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="text-slate-400 block mb-1">Durasi Tidur (Jam)</label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Kualitas Tidur (Rating 1-5 Bintang)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSleepStars(star)}
                      className={`flex-1 py-1.5 rounded-lg border text-sm transition-all ${
                        sleepStars >= star
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold'
                          : 'bg-slate-900 text-slate-600 border-slate-800'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveSleep}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all"
          >
            Simpan Catatan Tidur
          </button>
        </div>

        {/* Step Tracker with HealthKit / Health Connect Bridge */}
        <div className="p-5 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Footprints size={16} />
                </div>
                <h3 className="text-sm font-bold text-white">Penghitung Langkah Kaki</h3>
              </div>
              <span className="text-xs font-mono font-bold text-teal-400">
                {todayHabit.steps.toLocaleString()} / 10.000
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Mendukung sinkronisasi otomatis dari <strong>Apple HealthKit (iOS)</strong> dan <strong>Google Health Connect (Android)</strong> saat aplikasi dibungkus Capacitor.
            </p>

            {nativeSyncMsg && (
              <div className="p-2.5 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs mb-3">
                {nativeSyncMsg}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleNativeBridgeSync}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles size={14} /> Sinkronisasi dari HealthKit / Health Connect
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const updated: DailyHabitLog = {
                    ...todayHabit,
                    steps: todayHabit.steps + 1000,
                    updated_at: Date.now(),
                  };
                  onUpdateHabit(updated);
                }}
                className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs"
              >
                +1.000 Langkah Manual
              </button>
              <button
                onClick={() => {
                  const updated: DailyHabitLog = {
                    ...todayHabit,
                    steps: 0,
                    updated_at: Date.now(),
                  };
                  onUpdateHabit(updated);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-500 text-xs"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
