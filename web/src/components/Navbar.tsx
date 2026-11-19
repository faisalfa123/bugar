import React, { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff, Settings as SettingsIcon, Play, Dumbbell, Utensils, Zap, HeartPulse, LayoutDashboard, Globe, Smartphone, User } from 'lucide-react';
import { SyncState } from '../services/syncService';
import { NavTab } from './BottomNav';
import { getLanguage, setLanguage, t, Language } from '../data/i18n';
import { useAuth } from '../services/authContext';

interface NavbarProps {
  syncState: SyncState;
  onSyncClick: () => void;
  onSettingsClick: () => void;
  onMultiConnectClick: () => void;
  currentTab: string;
  onTabChange?: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  syncState,
  onSyncClick,
  onSettingsClick,
  onMultiConnectClick,
  currentTab,
  onTabChange,
}) => {
  const { account, setShowAuthModal } = useAuth();
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener('bugar_lang_change', handleLangChange);
    return () => window.removeEventListener('bugar_lang_change', handleLangChange);
  }, []);

  const toggleLanguage = () => {
    const nextLang: Language = lang === 'id' ? 'en' : 'id';
    setLanguage(nextLang);
  };

  const navLinks: { tab: NavTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'dashboard', label: t('navDashboard'), icon: <LayoutDashboard size={15} /> },
    { tab: 'nutrition', label: t('navNutrition'), icon: <Utensils size={15} /> },
    { tab: 'workout', label: t('navWorkout'), icon: <Dumbbell size={15} /> },
    { tab: 'fatburner', label: t('navFatBurner'), icon: <Zap size={15} /> },
    { tab: 'health', label: t('navHealth'), icon: <HeartPulse size={15} /> },
    { tab: 'guide', label: t('navGuide'), icon: <Play size={15} /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange?.('dashboard')}
            className="flex items-center gap-3 text-left group"
            style={{ cursor: 'pointer' }}
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
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                {t('brandSubtitle')}
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
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
                  style={{ cursor: 'pointer' }}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Multi-Connect Button */}
          <button
            onClick={onMultiConnectClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-emerald-400 transition-colors"
            style={{ cursor: 'pointer' }}
            title={t('multiConnect')}
          >
            <Smartphone size={14} />
            <span className="hidden xl:inline">{t('multiConnect')}</span>
          </button>

          {/* Language Toggle (ID / EN) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            style={{ cursor: 'pointer' }}
            title={t('languageToggle')}
          >
            <Globe size={14} className="text-emerald-400" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Sync Status Badge */}
          <button
            onClick={onSyncClick}
            disabled={syncState.isSyncing}
            title={syncState.isOnline ? 'Terhubung ke server' : 'Mode offline'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              syncState.isOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
            style={{ cursor: 'pointer' }}
          >
            {syncState.isOnline ? (
              <Wifi size={13} className="text-emerald-400" />
            ) : (
              <WifiOff size={13} className="text-amber-400" />
            )}
            <RefreshCw
              size={12}
              className={`${syncState.isSyncing ? 'animate-spin' : ''}`}
            />
          </button>

          {/* User Account Button */}
          {account ? (
            <button
              onClick={onSettingsClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors"
              style={{ cursor: 'pointer' }}
              title={`Akun: ${account.displayName}`}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                {account.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[80px] truncate">{account.displayName}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm shadow-emerald-500/20"
              style={{ cursor: 'pointer' }}
            >
              <User size={13} />
              <span>{t('login')}</span>
            </button>
          )}

          {/* Settings Icon */}
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition-colors"
            style={{ cursor: 'pointer' }}
            aria-label={t('navSettings')}
            title={t('navSettings')}
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
