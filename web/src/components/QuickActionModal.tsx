import React, { useState } from 'react';
import { X, Utensils, Droplets, Scale, Zap, Check } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWater: (amountMl: number) => void;
  onQuickLogWeight: (weightKg: number) => void;
  onNavigateToFood: () => void;
  onStartQuickFatBurner: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onAddWater,
  onQuickLogWeight,
  onNavigateToFood,
  onStartQuickFatBurner,
}) => {
  const [weightInput, setWeightInput] = useState('');
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [justLogged, setJustLogged] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWater = (amount: number) => {
    onAddWater(amount);
    setJustLogged(`+${amount}ml Air Dicatat!`);
    setTimeout(() => {
      setJustLogged(null);
      onClose();
    }, 1200);
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (val > 20 && val < 300) {
      onQuickLogWeight(val);
      setJustLogged(`Berat ${val}kg Dicatat!`);
      setTimeout(() => {
        setJustLogged(null);
        setShowWeightInput(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-obsidian/80 backdrop-blur-md">
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl glass-panel p-6 border border-slate-700/60 shadow-2xl safe-bottom">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Aksi Cepat (+)</h3>
            <p className="text-xs text-slate-400">Catat aktivitas harian dalam 1-klik</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {justLogged && (
          <div className="my-4 py-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
            <Check size={16} />
            <span>{justLogged}</span>
          </div>
        )}

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Quick Water 250ml */}
          <button
            onClick={() => handleWater(250)}
            className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Droplets size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">+250 ml Air</p>
              <p className="text-[11px] text-slate-400">1 Gelas Standar</p>
            </div>
          </button>

          {/* Quick Water 500ml */}
          <button
            onClick={() => handleWater(500)}
            className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Droplets size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">+500 ml Air</p>
              <p className="text-[11px] text-slate-400">1 Botol Sedang</p>
            </div>
          </button>

          {/* Catat Makanan */}
          <button
            onClick={() => {
              onClose();
              onNavigateToFood();
            }}
            className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Utensils size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Catat Makanan</p>
              <p className="text-[11px] text-slate-400">Cari Database Lokal</p>
            </div>
          </button>

          {/* Mulai Fat Burner */}
          <button
            onClick={() => {
              onClose();
              onStartQuickFatBurner();
            }}
            className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">7m Fat Burner</p>
              <p className="text-[11px] text-slate-400">Tabata Kilat Rumah</p>
            </div>
          </button>
        </div>

        {/* Weight Log Section */}
        <div className="mt-3">
          {!showWeightInput ? (
            <button
              onClick={() => setShowWeightInput(true)}
              className="w-full p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 text-left transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Scale size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Timbang Berat Badan</p>
                  <p className="text-[11px] text-slate-400">Catat progres berat hari ini</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-purple-400 px-2.5 py-1 rounded-lg bg-purple-500/10">
                Input
              </span>
            </button>
          ) : (
            <form onSubmit={handleWeightSubmit} className="p-3.5 rounded-2xl bg-slate-800/70 border border-purple-500/30">
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Masukkan Berat Badan Hari Ini (kg):
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  autoFocus
                  placeholder="Contoh: 70.5"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowWeightInput(false)}
                  className="px-3 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
