import React, { useState } from 'react';
import { UserProfile, ServerHealth } from '../types';
import { calculateProfileTargets } from '../engine/mastermindEngine';
import { syncService, SyncState } from '../services/syncService';
import {
  Settings,
  Server,
  Cpu,
  HardDrive,
  Clock,
  User,
  Shield,
  Download,
  Upload,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface SettingsPageProps {
  profile: UserProfile;
  syncState: SyncState;
  onUpdateProfile: (profile: UserProfile) => void;
  onManualSync: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  profile,
  syncState,
  onUpdateProfile,
  onManualSync,
}) => {
  // Form state
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age.toString());
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender);
  const [height, setHeight] = useState(profile.height_cm.toString());
  const [weight, setWeight] = useState(profile.weight_kg.toString());
  const [activity, setActivity] = useState(profile.activity_level.toString());
  const [goal, setGoal] = useState<'fat_loss' | 'maintenance' | 'muscle_gain'>(profile.goal);

  // Server URL state
  const [serverUrl, setServerUrl] = useState(syncService.getServerUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);

  // PIN state
  const [pinInput, setPinInput] = useState('');
  const [pinMsg, setPinMsg] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight) || 70;
    const h = parseFloat(height) || 170;
    const a = parseInt(age) || 28;
    const act = parseFloat(activity) || 1.375;

    const targets = calculateProfileTargets({
      weight_kg: w,
      height_cm: h,
      age: a,
      gender,
      activity_level: act,
      goal,
    });

    const updated: UserProfile = {
      ...profile,
      name,
      age: a,
      gender,
      height_cm: h,
      weight_kg: w,
      activity_level: act,
      goal,
      target_calories: targets.targetCalories,
      target_protein_g: targets.targetProteinG,
      target_carbs_g: targets.targetCarbsG,
      target_fat_g: targets.targetFatG,
      target_water_ml: targets.targetWaterMl,
      updated_at: Date.now(),
    };

    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await syncService.verifyPin(pinInput);
    setPinMsg(res.message);
    setPinInput('');
    setTimeout(() => setPinMsg(null), 3000);
  };

  const handleDownloadBackup = () => {
    window.open(`${syncService.getServerUrl()}/api/backup/export`, '_blank');
  };

  const health = syncState.serverHealth;

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="p-5 rounded-3xl glass-panel relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
            <Settings size={18} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Pengaturan & ODROID-C2 Server</h1>
            <p className="text-xs text-slate-400">Profil kebugaran, status edge server, dan backup data</p>
          </div>
        </div>
      </div>

      {/* 1. ODROID-C2 Edge Server Telemetry */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Server size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Status Server ODROID-C2</h2>
              <p className="text-xs text-slate-400">Rust Axum + SQLite Bundled Single-Binary</p>
            </div>
          </div>

          <button
            onClick={onManualSync}
            disabled={syncState.isSyncing}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={13} className={syncState.isSyncing ? 'animate-spin' : ''} />
            <span>Sync Sekarang</span>
          </button>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {/* Status */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Status Layanan</p>
            <p className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {health ? health.status.toUpperCase() : (syncState.isOnline ? 'ONLINE' : 'OFFLINE')}
            </p>
          </div>

          {/* Arsitektur */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Arsitektur CPU</p>
            <p className="text-sm font-mono font-bold text-white mt-0.5">
              {health ? health.arch : 'aarch64 / arm64'}
            </p>
          </div>

          {/* Memori RAM */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Penggunaan RAM</p>
            <p className="text-sm font-mono font-bold text-blue-400 mt-0.5">
              {health && health.memory_rss_kb > 0
                ? `${(health.memory_rss_kb / 1024).toFixed(1)} MB`
                : '< 8.5 MB'}
            </p>
          </div>

          {/* Uptime */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Server Uptime</p>
            <p className="text-sm font-mono font-bold text-white mt-0.5">
              {health
                ? `${Math.floor(health.uptime_secs / 3600)}j ${Math.floor((health.uptime_secs % 3600) / 60)}m`
                : 'Aktif'}
            </p>
          </div>
        </div>

        {/* Server Endpoint URL input */}
        <div className="flex flex-col sm:flex-row gap-2 text-xs">
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://192.168.1.100:8080"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => {
              syncService.setServerUrl(serverUrl);
              onManualSync();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all"
          >
            Terapkan URL Server
          </button>
        </div>
      </div>

      {/* 2. Profil Kebugaran & Kalkulator Target */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <User size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Profil Pribadi & Target BMR/TDEE</h2>
            <p className="text-xs text-slate-400">Parameter untuk menghitung kebutuhan kalori dan makronutrisi harian</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Nama Panggilan</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Usia (Tahun)</label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Tinggi (cm)</label>
              <input
                type="number"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Berat (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Tingkat Aktivitas Harian</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="1.2">Jarang Olahraga (Sedentary - 1.2x)</option>
                <option value="1.375">Olahraga Ringan 1-3x/minggu (1.375x)</option>
                <option value="1.55">Olahraga Sedang 3-5x/minggu (1.55x)</option>
                <option value="1.725">Olahraga Berat 6-7x/minggu (1.725x)</option>
                <option value="1.9">Sangat Berat / Atlet Pekerja Fisik (1.9x)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Tujuan Kebugaran</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as typeof goal)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="fat_loss">Fat Loss (Defisit 500 kcal)</option>
                <option value="maintenance">Maintenance (Jaga Berat Badan)</option>
                <option value="muscle_gain">Muscle Gain (Surplus 350 kcal)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            {savedSuccess ? <Check size={14} /> : null}
            {savedSuccess ? 'Profil & Target Baru Berhasil Disimpan!' : 'Simpan & Hitung Ulang Target Kalori'}
          </button>
        </form>
      </div>

      {/* 3. Keamanan PIN Server */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Shield size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Keamanan & Akses PIN</h2>
            <p className="text-xs text-slate-400">Jika server disetel dengan environment variable BUGAR_PIN</p>
          </div>
        </div>

        <form onSubmit={handleVerifyPin} className="flex gap-2 text-xs">
          <input
            type="password"
            maxLength={6}
            placeholder="Masukkan PIN 4-6 digit"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all"
          >
            Verifikasi PIN
          </button>
        </form>

        {pinMsg && (
          <p className="text-xs text-emerald-400 mt-2 font-medium">{pinMsg}</p>
        )}
      </div>

      {/* 4. Backup & Export */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Download size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Backup & Ekspor Data</h2>
            <p className="text-xs text-slate-400">Unduh seluruh snapshot SQLite sebagai file JSON mandiri</p>
          </div>
        </div>

        <button
          onClick={handleDownloadBackup}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
        >
          <Download size={14} /> Unduh File Backup JSON (bugar-backup.json)
        </button>
      </div>
    </div>
  );
};
