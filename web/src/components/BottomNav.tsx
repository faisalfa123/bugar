import React from 'react';
import { LayoutDashboard, Utensils, Plus, Dumbbell, Zap, HeartPulse, Play } from 'lucide-react';

export type NavTab = 'dashboard' | 'nutrition' | 'workout' | 'fatburner' | 'health' | 'guide';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onQuickActionClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onQuickActionClick,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-4 pointer-events-none safe-bottom">
      <div className="max-w-xl mx-auto pointer-events-auto rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-2xl px-2 py-1.5 flex items-center justify-between">
        {/* Tab 0: Dashboard */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'dashboard'
              ? 'text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Beranda"
        >
          <div className={`p-1 rounded-lg transition-all ${currentTab === 'dashboard' ? 'bg-slate-800 text-emerald-400' : ''}`}>
            <LayoutDashboard size={18} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Beranda</span>
        </button>

        {/* Tab 1: Nutrisi */}
        <button
          onClick={() => onTabChange('nutrition')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'nutrition'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Nutrisi"
        >
          <div className={`p-1 rounded-lg transition-all ${currentTab === 'nutrition' ? 'bg-emerald-500/20 text-emerald-400' : ''}`}>
            <Utensils size={18} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Nutrisi</span>
        </button>

        {/* Tab 2: Workout */}
        <button
          onClick={() => onTabChange('workout')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'workout'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Workout"
        >
          <div className={`p-1 rounded-lg transition-all ${currentTab === 'workout' ? 'bg-blue-500/20 text-blue-400' : ''}`}>
            <Dumbbell size={18} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Workout</span>
        </button>

        {/* Center Floating Plus Action */}
        <button
          onClick={onQuickActionClick}
          className="relative -top-3 w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
          title="Aksi Cepat Catat Data"
          aria-label="Aksi Cepat"
        >
          <Plus size={22} strokeWidth={2.8} />
        </button>

        {/* Tab 3: Panduan Form Gerakan */}
        <button
          onClick={() => onTabChange('guide')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'guide'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Panduan Form Gerakan"
        >
          <div className={`p-1 rounded-lg transition-all ${currentTab === 'guide' ? 'bg-emerald-500/20 text-emerald-400' : ''}`}>
            <Play size={18} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Form</span>
        </button>

        {/* Tab 4: Fat Burner */}
        <button
          onClick={() => onTabChange('fatburner')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'fatburner'
              ? 'text-orange-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Fat Burner HIIT"
        >
          <div className={`p-1 rounded-lg transition-all ${currentTab === 'fatburner' ? 'bg-orange-500/20 text-orange-400' : ''}`}>
            <Zap size={18} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">HIIT</span>
        </button>

        {/* Tab 5: Health */}
        <button
          onClick={() => onTabChange('health')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'health'
              ? 'text-purple-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Kesehatan"
        >
          <div className={`p-1 rounded-lg transition-all ${currentTab === 'health' ? 'bg-purple-500/20 text-purple-400' : ''}`}>
            <HeartPulse size={18} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Kesehatan</span>
        </button>
      </div>
    </nav>
  );
};
