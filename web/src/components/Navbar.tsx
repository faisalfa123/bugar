import React from 'react';
import { RefreshCw, Wifi, WifiOff, Settings as SettingsIcon, Play, Dumbbell, Utensils, Zap, HeartPulse, LayoutDashboard } from 'lucide-react';
import { SyncState } from '../services/syncService';
import { NavTab } from './BottomNav';

interface NavbarProps {
  syncState: SyncState;
  onSyncClick: () => void;
  onSettingsClick: () => void;
  currentTab: string;
  onTabChange?: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  syncState,
  onSyncClick,
  onSettingsClick,
  currentTab,
  onTabChange,
}) => {
  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  const navLinks: { tab: NavTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'dashboard', label: 'Beranda', icon: <LayoutDashboard size={15} /> },
    { tab: 'nutrition', label: 'Nutrisi', icon: <Utensils size={15} /> },
    { tab: 'workout', label: 'Workout', icon: <Dumbbell size={15} /> },
    { tab: 'fatburner', label: 'Fat Burn', icon: <Zap size={15} /> },
    { tab: 'health', label: 'Kesehatan', icon: <HeartPulse size={15} /> },
    { tab: 'guide', label: 'Panduan Form', icon: <Play size={15} /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange?.('dashboard')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-500 p-0.5 shadow-md shadow-emerald-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-lg font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  BG
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  BUGAR
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                  ARM64
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">Edge Fitness & Nutrition</p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links (Symmetrical Center Bar) */}
        {onTabChange && (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            {navLinks.map(({ tab, label, icon }) => {
              const isActive = currentTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Date Indicator */}
          <span className="hidden md:inline-flex text-xs font-medium text-slate-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            📅 {todayStr}
          </span>

          {/* Sync Status Badge */}
          <button
            onClick={onSyncClick}
            disabled={syncState.isSyncing}
            title={syncState.isOnline ? 'Terhubung ke server ODROID-C2' : 'Bekerja dalam mode offline lokal'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
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
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
            title="Pengaturan"
            aria-label="Buka Pengaturan"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
