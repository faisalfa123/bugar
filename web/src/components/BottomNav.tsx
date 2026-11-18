import React from 'react';
import { LayoutDashboard, Utensils, Plus, Dumbbell, Zap, HeartPulse } from 'lucide-react';

export type NavTab = 'dashboard' | 'nutrition' | 'workout' | 'fatburner' | 'health';

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
      <div className="max-w-lg mx-auto pointer-events-auto rounded-3xl glass-panel border border-slate-700/60 shadow-2xl px-2 py-1.5 flex items-center justify-around">
        {/* Tab 0: Dashboard */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
            currentTab === 'dashboard'
              ? 'text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${currentTab === 'dashboard' ? 'bg-slate-800 text-emerald-400' : ''}`}>
            <LayoutDashboard size={20} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Beranda</span>
        </button>

        {/* Tab 1: Nutrisi */}
        <button
          onClick={() => onTabChange('nutrition')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
            currentTab === 'nutrition'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${currentTab === 'nutrition' ? 'bg-emerald-500/20 text-emerald-400' : ''}`}>
            <Utensils size={20} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Nutrisi</span>
        </button>

        {/* Center Floating Plus Action */}
        <button
          onClick={onQuickActionClick}
          className="relative -top-3 w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
          title="Aksi Cepat"
        >
          <Plus size={24} strokeWidth={2.8} />
        </button>

        {/* Tab 2: Workout */}
        <button
          onClick={() => onTabChange('workout')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
            currentTab === 'workout'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${currentTab === 'workout' ? 'bg-blue-500/20 text-blue-400' : ''}`}>
            <Dumbbell size={20} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Workout</span>
        </button>

        {/* Tab 3: Fat Burner */}
        <button
          onClick={() => onTabChange('fatburner')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
            currentTab === 'fatburner'
              ? 'text-orange-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${currentTab === 'fatburner' ? 'bg-orange-500/20 text-orange-400' : ''}`}>
            <Zap size={20} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Fat Burn</span>
        </button>

        {/* Tab 4: Health */}
        <button
          onClick={() => onTabChange('health')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
            currentTab === 'health'
              ? 'text-purple-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${currentTab === 'health' ? 'bg-purple-500/20 text-purple-400' : ''}`}>
            <HeartPulse size={20} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Kesehatan</span>
        </button>
      </div>
    </nav>
  );
};
