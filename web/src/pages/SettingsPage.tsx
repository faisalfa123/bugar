import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ServerHealth, HddStatus, SyncPayload } from '../types';
import { calculateProfileTargets } from '../engine/mastermindEngine';
import { syncService, SyncState } from '../services/syncService';
import { localDB } from '../services/db';
import {
  Settings,
  Server,
  HardDrive,
  User,
  Shield,
  Download,
  Upload,
  Check,
  RefreshCw,
  FolderSync,
  FileText,
  AlertTriangle,
  X
} from 'lucide-react';

interface SettingsPageProps {
  profile: UserProfile;
  syncState: SyncState;
  onUpdateProfile: (profile: UserProfile) => void;
  onManualSync: () => void;
  onDataRestored?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  profile,
  syncState,
  onUpdateProfile,
  onManualSync,
  onDataRestored,
}) => {
  // Profile Form state
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

  // HDD & Backup state
  const [hddStatus, setHddStatus] = useState<HddStatus | null>(null);
  const [hddLoading, setHddLoading] = useState(false);
  const [hddMsg, setHddMsg] = useState<string | null>(null);

  // Import Modal state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importPayload, setImportPayload] = useState<SyncPayload | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importReplaceAll, setImportReplaceAll] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResultMsg, setImportResultMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchHddInfo();
  }, []);

  const fetchHddInfo = async () => {
    const status = await syncService.getHddStatus();
    if (status) setHddStatus(status);
  };

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

  const handleTriggerHddBackup = async () => {
    setHddLoading(true);
    const res = await syncService.triggerHddBackup();
    setHddMsg(res.message);
    await fetchHddInfo();
    setHddLoading(false);
    setTimeout(() => setHddMsg(null), 3500);
  };

  const handleDownloadBackup = () => {
    window.open(`${syncService.getServerUrl()}/api/backup/export`, '_blank');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.profile || parsed.food_logs || parsed.workout_logs)) {
          setImportPayload(parsed);
        } else {
          alert('Format berkas tidak valid: Berkas bukan berkas cadangan JSON BUGAR.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON: ' + err);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!importPayload) return;
    setImportLoading(true);

    try {
      // 1. Send to server
      const res = await syncService.importBackupPayload(importPayload, importReplaceAll);

      // 2. Also apply to client IndexedDB
      if (importReplaceAll) {
        // Clear local and apply
        if (importPayload.profile) await localDB.saveProfile(importPayload.profile);
        await localDB.applyServerSnapshot(importPayload);
      } else {
        await localDB.applyServerSnapshot(importPayload);
      }

      setImportResultMsg(res.message);
      if (onDataRestored) onDataRestored();

      setTimeout(() => {
        setImportPayload(null);
        setImportResultMsg(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        window.location.reload(); // Refresh to reload state cleanly
      }, 2000);
    } catch (e: unknown) {
      setImportResultMsg('Terjadi kesalahan saat memulihkan berkas: ' + e);
    } finally {
      setImportLoading(false);
    }
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
            <h1 className="text-xl font-black text-white tracking-tight">Pengaturan & Penyimpanan Edge</h1>
            <p className="text-xs text-slate-400">Status ODROID-C2, backup /mnt/hdd1/bugar/, dan pemulihan data</p>
          </div>
        </div>
      </div>

      {/* 1. Direktori Eksternal HDD (/mnt/hdd1/bugar/) */}
      <div className="p-5 rounded-3xl glass-panel border border-emerald-500/30 glow-nutrition">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <HardDrive size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Penyimpanan Hard Disk (/mnt/hdd1/bugar)</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hddStatus?.available
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {hddStatus?.available ? '● Terhubung & Aktif' : '○ Belum Terpasang'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Data cadangan & konfigurasi pribadi tersimpan dalam format yang mudah dipantau manusia
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerHddBackup}
            disabled={hddLoading}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-md shadow-emerald-500/20"
          >
            <FolderSync size={14} className={hddLoading ? 'animate-spin' : ''} />
            <span>{hddLoading ? 'Menyimpan...' : 'Simpan ke HDD Sekarang'}</span>
          </button>
        </div>

        {hddMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check size={14} />
            <span>{hddMsg}</span>
          </div>
        )}

        {/* HDD Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Direktori Aktif</p>
            <p className="font-mono text-slate-200 mt-1 truncate">
              {hddStatus ? hddStatus.path : '/mnt/hdd1/bugar'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Ukuran Berkas Cadangan</p>
            <p className="font-mono text-emerald-400 font-bold mt-1">
              {hddStatus && hddStatus.backup_size_bytes > 0
                ? `${(hddStatus.backup_size_bytes / 1024).toFixed(1)} KB`
                : 'Siap dibuat'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Waktu Pembaruan Terakhir</p>
            <p className="font-mono text-slate-300 mt-1">
              {hddStatus?.last_backup_time
                ? new Date(hddStatus.last_backup_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                : 'Otomatis saat sync'}
            </p>
          </div>
        </div>

        {/* Human Readable Files Explanation */}
        <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
          <p className="font-semibold text-white flex items-center gap-1.5">
            <FileText size={14} className="text-emerald-400" /> Berkas yang Dipantau di /mnt/hdd1/bugar/:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-1">
            <li><strong className="text-slate-200">config.json</strong> : Pengaturan profil, target BMR/TDEE, dan kebutuhan kalori (human-readable JSON).</li>
            <li><strong className="text-slate-200">backup_latest.json</strong> : Cadangan lengkap seluruh riwayat makan, workout, dan biometrik.</li>
            <li><strong className="text-slate-200">data_overview.txt</strong> : Ringkasan teks biasa yang bisa langsung dibaca dengan perintah <code>cat</code> atau <code>nano</code>.</li>
            <li><strong className="text-slate-200">exports/</strong> : Arsip bertanggal otomatis untuk pemulihan bencana jika data sistem rusak.</li>
          </ul>
        </div>
      </div>

      {/* 2. Ekspor & Impor File (Disaster Recovery) */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <FolderSync size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Ekspor & Impor Berkas Cadangan</h2>
            <p className="text-xs text-slate-400">Unduh berkas JSON ke HP/komputer atau pulihkan database dari berkas backup</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {/* Ekspor Button */}
          <button
            onClick={handleDownloadBackup}
            className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Download size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Ekspor File (.json)</p>
                <p className="text-[11px] text-slate-400">Unduh salinan cadangan lengkap</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-teal-400 border border-teal-500/20">
              Unduh
            </span>
          </button>

          {/* Impor Button */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Upload size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Impor File (.json)</p>
                  <p className="text-[11px] text-slate-400">Pulihkan data dari file cadangan</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-blue-400 border border-blue-500/20">
                Pilih File
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Dialog Konfirmasi Impor File */}
      {importPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-slate-700/60 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-blue-400" />
                <h3 className="text-base font-bold text-white">Konfirmasi Pemulihan Data</h3>
              </div>
              <button
                onClick={() => setImportPayload(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-4 text-xs space-y-3">
              <p className="text-slate-300">
                Berkas cadangan <strong className="text-white font-mono">{importFileName}</strong> siap dipulihkan ke sistem BUGAR.
              </p>

              {/* Toggle Opsi: Gabungkan vs Timpa Bersih */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <p className="font-semibold text-slate-200">Pilih Mode Pemulihan:</p>

                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <input
                    type="radio"
                    name="importMode"
                    checked={!importReplaceAll}
                    onChange={() => setImportReplaceAll(false)}
                    className="mt-0.5 accent-blue-500"
                  />
                  <div>
                    <span className="font-bold text-white block">Gabungkan (Merge LWW) - Direkomendasikan</span>
                    <span className="text-[11px] text-slate-400">
                      Menyatukan data cadangan dengan data yang ada sekarang; entitas terbaru yang dipertahankan.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importReplaceAll}
                    onChange={() => setImportReplaceAll(true)}
                    className="mt-0.5 accent-rose-500"
                  />
                  <div>
                    <span className="font-bold text-rose-400 block">Timpa Bersih (Clean Replace)</span>
                    <span className="text-[11px] text-slate-400">
                      Mengosongkan data lama di server & client, menggantikannya 100% sama dengan file cadangan ini.
                    </span>
                  </div>
                </label>
              </div>

              {importResultMsg && (
                <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold text-center">
                  {importResultMsg}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExecuteImport}
                disabled={importLoading}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                {importLoading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{importLoading ? 'Memproses...' : 'Mulai Pemulihan Sekarang'}</span>
              </button>
              <button
                onClick={() => setImportPayload(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Status Server ODROID-C2 */}
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
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Status Layanan</p>
            <p className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {health ? health.status.toUpperCase() : (syncState.isOnline ? 'ONLINE' : 'OFFLINE')}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Arsitektur CPU</p>
            <p className="text-sm font-mono font-bold text-white mt-0.5">
              {health ? health.arch : 'aarch64 / arm64'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Penggunaan RAM</p>
            <p className="text-sm font-mono font-bold text-blue-400 mt-0.5">
              {health && health.memory_rss_kb > 0
                ? `${(health.memory_rss_kb / 1024).toFixed(1)} MB`
                : '< 8.5 MB'}
            </p>
          </div>
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
            placeholder="http://192.168.1.100:1200"
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

      {/* 4. Profil Kebugaran & Kalkulator Target */}
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

      {/* 5. Keamanan PIN Server */}
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
    </div>
  );
};
