import React, { useState } from 'react';
import { Brain, Sparkles, Utensils, Zap, Play, CheckCircle2, ChevronRight } from 'lucide-react';
import { solveMastermindRecommendation } from '../engine/mastermindEngine';

interface MastermindCardProps {
  remainingCalories: number;
  remainingProtein: number;
  onApplyFood: (foodItems: { name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; portion: string }[]) => void;
  onStartWorkout: (programId: string) => void;
}

export const MastermindCard: React.FC<MastermindCardProps> = ({
  remainingCalories,
  remainingProtein,
  onApplyFood,
  onStartWorkout,
}) => {
  const [location, setLocation] = useState<'Rumah' | 'Gym'>('Rumah');
  const [timeAvailable, setTimeAvailable] = useState<number>(15);
  const [applied, setApplied] = useState(false);

  const recommendation = solveMastermindRecommendation({
    remainingCalories,
    remainingProteinG: remainingProtein,
    timeAvailableMinutes: timeAvailable,
    preferredLocation: location,
  });

  const handleApplyFood = () => {
    onApplyFood(recommendation.recommended_foods);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="rounded-2xl glass-panel p-5 relative overflow-hidden border border-emerald-500/20 glow-nutrition">
      {/* Background ambient gradient glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
            <Brain size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-white tracking-tight">BUGAR Mastermind</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles size={10} /> Smart AI
              </span>
            </div>
            <p className="text-xs text-slate-400">Optimasi kuota nutrisi & jadwal fat burner presisi</p>
          </div>
        </div>

        {/* Location selector toggle */}
        <div className="flex rounded-lg bg-slate-900/80 p-0.5 border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setLocation('Rumah')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              location === 'Rumah' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rumah
          </button>
          <button
            onClick={() => setLocation('Gym')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              location === 'Gym' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gym
          </button>
        </div>
      </div>

      {/* Time budget selector */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 shrink-0 font-medium">Waktu luang:</span>
        {[7, 15, 30, 45].map(t => (
          <button
            key={t}
            onClick={() => setTimeAvailable(t)}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              timeAvailable === t
                ? 'bg-slate-800 text-white border-slate-600 font-bold'
                : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            {t} Menit
          </button>
        ))}
      </div>

      {/* Rationale explanation */}
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800/70 mb-4">
        {recommendation.reasoning}
      </p>

      {/* 2-Column Content: Recommended Food Combo vs Recommended Fat Burner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Recommended Foods */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Utensils size={14} /> Kombinasi Menu Optimal
            </span>
            <span className="text-xs font-bold text-white">
              {Math.round(recommendation.total_calories)} kcal
            </span>
          </div>
          <div className="space-y-1.5">
            {recommendation.recommended_foods.map((food, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50 last:border-0">
                <span className="text-slate-200 font-medium truncate max-w-[170px]">{food.name}</span>
                <span className="text-slate-400 font-mono text-[11px] shrink-0">
                  {Math.round(food.calories)} kcal | {food.protein_g}g P
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={handleApplyFood}
            disabled={applied}
            className="w-full mt-3 py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40 flex items-center justify-center gap-1.5 transition-all"
          >
            {applied ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-400" /> Dicatat ke Jurnal Makan
              </>
            ) : (
              <>
                <CheckCircle2 size={13} /> Catat Kombo Ini ke Jurnal
              </>
            )}
          </button>
        </div>

        {/* Recommended Fat Burner */}
        {recommendation.recommended_fat_burner && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-orange-400 flex items-center gap-1.5">
                  <Zap size={14} /> Fat Burner Pelengkap
                </span>
                <span className="text-xs font-bold text-orange-400">
                  ~{recommendation.recommended_fat_burner.est_calories_burned} kcal
                </span>
              </div>
              <p className="text-sm font-bold text-white mb-1">
                {recommendation.recommended_fat_burner.title}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>⏱️ {recommendation.recommended_fat_burner.duration_minutes} Menit</span>
                <span>•</span>
                <span>🔥 Intensitas {recommendation.recommended_fat_burner.intensity}</span>
              </div>
            </div>

            <button
              onClick={() => onStartWorkout(recommendation.recommended_fat_burner!.id)}
              className="w-full mt-3 py-1.5 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all"
            >
              <Play size={13} fill="currentColor" /> Mulai Workout Sekarang
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
