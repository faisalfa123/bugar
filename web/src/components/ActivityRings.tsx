import React from 'react';
import { Flame, Dumbbell, Droplets } from 'lucide-react';

interface ActivityRingsProps {
  caloriesBurned: number;
  caloriesTarget: number;
  activeMinutes: number;
  activeMinutesTarget: number;
  waterMl: number;
  waterTarget: number;
}

export const ActivityRings: React.FC<ActivityRingsProps> = ({
  caloriesBurned,
  caloriesTarget,
  activeMinutes,
  activeMinutesTarget,
  waterMl,
  waterTarget,
}) => {
  const size = 220;
  const strokeWidth = 14;
  const center = size / 2;

  // Ring 1: Calories (Outer, Coral/Orange)
  const r1 = center - strokeWidth / 2 - 2;
  const circ1 = 2 * Math.PI * r1;
  const p1 = Math.min(1.2, Math.max(0, caloriesBurned / (caloriesTarget || 1)));
  const offset1 = circ1 - p1 * circ1;

  // Ring 2: Active / Workout Minutes (Middle, Electric Blue)
  const r2 = r1 - strokeWidth - 4;
  const circ2 = 2 * Math.PI * r2;
  const p2 = Math.min(1.2, Math.max(0, activeMinutes / (activeMinutesTarget || 1)));
  const offset2 = circ2 - p2 * circ2;

  // Ring 3: Hydration / Steps (Inner, Emerald Green)
  const r3 = r2 - strokeWidth - 4;
  const circ3 = 2 * Math.PI * r3;
  const p3 = Math.min(1.2, Math.max(0, waterMl / (waterTarget || 1)));
  const offset3 = circ3 - p3 * circ3;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 rounded-2xl glass-panel relative overflow-hidden">
      {/* SVG Rings */}
      <div className="relative w-[220px] h-[220px] shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background tracks */}
          <circle cx={center} cy={center} r={r1} fill="transparent" stroke="#F97316" strokeWidth={strokeWidth} opacity={0.15} />
          <circle cx={center} cy={center} r={r2} fill="transparent" stroke="#3B82F6" strokeWidth={strokeWidth} opacity={0.15} />
          <circle cx={center} cy={center} r={r3} fill="transparent" stroke="#10B981" strokeWidth={strokeWidth} opacity={0.15} />

          {/* Active Progress Rings */}
          <circle
            cx={center}
            cy={center}
            r={r1}
            fill="transparent"
            stroke="#F97316"
            strokeWidth={strokeWidth}
            strokeDasharray={circ1}
            strokeDashoffset={offset1}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <circle
            cx={center}
            cy={center}
            r={r2}
            fill="transparent"
            stroke="#3B82F6"
            strokeWidth={strokeWidth}
            strokeDasharray={circ2}
            strokeDashoffset={offset2}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <circle
            cx={center}
            cy={center}
            r={r3}
            fill="transparent"
            stroke="#10B981"
            strokeWidth={strokeWidth}
            strokeDasharray={circ3}
            strokeDashoffset={offset3}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center icon / percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black tracking-tight text-white">
            {Math.round(((p1 + p2 + p3) / 3) * 100)}%
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Aktivitas
          </span>
        </div>
      </div>

      {/* Legend & Stat Readouts */}
      <div className="flex flex-col gap-3.5 w-full max-w-xs">
        {/* Ring 1 - Kalori */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Flame size={17} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Kalori Terbakar</p>
              <p className="text-sm font-bold text-white tracking-tight">
                {Math.round(caloriesBurned)} <span className="text-xs text-slate-500 font-normal">/ {caloriesTarget} kcal</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">
            {Math.round(p1 * 100)}%
          </span>
        </div>

        {/* Ring 2 - Menit Aktif */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Dumbbell size={17} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Menit Olahraga</p>
              <p className="text-sm font-bold text-white tracking-tight">
                {activeMinutes} <span className="text-xs text-slate-500 font-normal">/ {activeMinutesTarget} mnt</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
            {Math.round(p2 * 100)}%
          </span>
        </div>

        {/* Ring 3 - Hidrasi Air */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Droplets size={17} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Hidrasi Air</p>
              <p className="text-sm font-bold text-white tracking-tight">
                {Math.round(waterMl)} <span className="text-xs text-slate-500 font-normal">/ {waterTarget} ml</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
            {Math.round(p3 * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
