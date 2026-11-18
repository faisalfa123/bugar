import React from 'react';
import { RefreshCw, Wifi, WifiOff, Settings as SettingsIcon } from 'lucide-react';
import { SyncState } from '../services/syncService';

interface NavbarProps {
  syncState: SyncState;
  onSyncClick: () => void;
  onSettingsClick: () => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  syncState,
  onSyncClick,
  onSettingsClick,
}) => {
  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-500 p-0.5 shadow-md shadow-emerald-500/10">
            <div className="w-full h-full bg-obsidian rounded-[10px] flex items-center justify-center">
              <span className="text-lg font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                BG
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">BUGAR</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                ARM64
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">Edge Fitness & Nutrition</p>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Date Indicator */}
          <span className="hidden md:inline-flex text-xs font-medium text-slate-400 px-3 py-1 rounded-full bg-slate-800/40 border border-slate-800">
            📅 {todayStr}
          </span>

          {/* Sync Status Badge */}
          <button
            onClick={onSyncClick}
            disabled={syncState.isSyncing}
            title={syncState.isOnline ? 'Terhubung ke server ODROID-C2' : 'Bekerja dalam mode offline lokal'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              syncState.isSyncing
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : syncState.isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {syncState.isSyncing ? (
              <RefreshCw size={13} className="animate-spin text-blue-400" />
            ) : syncState.isOnline ? (
              <Wifi size={13} className="text-emerald-400" />
            ) : (
              <WifiOff size={13} className="text-amber-400" />
            )}
            <span className="hidden xs:inline">
              {syncState.isSyncing
                ? 'Sync...'
                : syncState.isOnline
                ? 'ODROID-C2'
                : 'Offline'}
            </span>
          </button>

          {/* Settings button */}
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
            title="Pengaturan"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
