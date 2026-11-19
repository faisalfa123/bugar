import React from 'react';

interface MuscleHeatmapProps {
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  className?: string;
  width?: number;
  height?: number;
}

export const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({
  primaryMuscles,
  secondaryMuscles = [],
  className = '',
  width = 240,
  height = 200,
}) => {
  const isPrimary = (group: string) => primaryMuscles.includes(group);
  const isSecondary = (group: string) => secondaryMuscles.includes(group);

  const getMuscleColor = (group: string) => {
    if (isPrimary(group)) return '#10B981'; // Emerald Green for Primary
    if (isSecondary(group)) return '#3B82F6'; // Electric Blue for Secondary
    return '#1E293B'; // Slate 800 inactive
  };

  const getMuscleOpacity = (group: string) => {
    if (isPrimary(group)) return 1.0;
    if (isSecondary(group)) return 0.85;
    return 0.35;
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center gap-6 justify-center">
        {/* Anterior (Front Body) */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Tampak Depan</span>
          <svg
            width={width / 2}
            height={height}
            viewBox="0 0 100 180"
            className="overflow-visible"
            aria-label="Diagram Otot Tubuh Bagian Depan"
          >
            {/* Head & Neck */}
            <circle cx="50" cy="18" r="10" fill="#334155" opacity="0.4" />
            <rect x="47" y="27" width="6" height="7" rx="2" fill="#334155" opacity="0.4" />

            {/* Chest (Pectoralis Major) */}
            <path
              d="M36 36 C42 34, 48 35, 49 48 C42 50, 36 46, 34 38 Z"
              fill={getMuscleColor('chest')}
              opacity={getMuscleOpacity('chest')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <path
              d="M64 36 C58 34, 52 35, 51 48 C58 50, 64 46, 66 38 Z"
              fill={getMuscleColor('chest')}
              opacity={getMuscleOpacity('chest')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />

            {/* Shoulders (Anterior Deltoids) */}
            <path
              d="M26 36 C30 33, 35 34, 34 42 C30 45, 25 43, 26 36 Z"
              fill={getMuscleColor('front_delts') || getMuscleColor('shoulders')}
              opacity={getMuscleOpacity('front_delts') || getMuscleOpacity('shoulders')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <path
              d="M74 36 C70 33, 65 34, 66 42 C70 45, 75 43, 74 36 Z"
              fill={getMuscleColor('front_delts') || getMuscleColor('shoulders')}
              opacity={getMuscleOpacity('front_delts') || getMuscleOpacity('shoulders')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />

            {/* Biceps */}
            <path
              d="M23 46 C27 45, 29 52, 27 58 C24 58, 22 52, 23 46 Z"
              fill={getMuscleColor('biceps')}
              opacity={getMuscleOpacity('biceps')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <path
              d="M77 46 C73 45, 71 52, 73 58 C76 58, 78 52, 77 46 Z"
              fill={getMuscleColor('biceps')}
              opacity={getMuscleOpacity('biceps')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />

            {/* Forearms */}
            <path
              d="M21 61 C25 61, 26 73, 22 79 C19 78, 19 68, 21 61 Z"
              fill={getMuscleColor('forearms')}
              opacity={getMuscleOpacity('forearms')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <path
              d="M79 61 C75 61, 74 73, 78 79 C81 78, 81 68, 79 61 Z"
              fill={getMuscleColor('forearms')}
              opacity={getMuscleOpacity('forearms')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />

            {/* Abdominals (Rectus Abdominis / Core) */}
            <rect
              x="42"
              y="51"
              width="16"
              height="28"
              rx="4"
              fill={getMuscleColor('abs')}
              opacity={getMuscleOpacity('abs')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />

            {/* Obliques */}
            <path
              d="M36 52 C40 52, 40 74, 37 77 C34 74, 34 56, 36 52 Z"
              fill={getMuscleColor('obliques')}
              opacity={getMuscleOpacity('obliques')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <path
              d="M64 52 C60 52, 60 74, 63 77 C66 74, 66 56, 64 52 Z"
              fill={getMuscleColor('obliques')}
              opacity={getMuscleOpacity('obliques')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />

            {/* Quadriceps (Thighs) */}
            <path
              d="M35 84 C46 83, 47 114, 43 124 C38 123, 34 110, 35 84 Z"
              fill={getMuscleColor('quads')}
              opacity={getMuscleOpacity('quads')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <path
              d="M65 84 C54 83, 53 114, 57 124 C62 123, 66 110, 65 84 Z"
              fill={getMuscleColor('quads')}
              opacity={getMuscleOpacity('quads')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />

            {/* Calves (Front Tibialis) */}
            <path
              d="M37 130 C43 130, 44 158, 40 168 C36 166, 35 145, 37 130 Z"
              fill={getMuscleColor('calves')}
              opacity={getMuscleOpacity('calves')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <path
              d="M63 130 C57 130, 56 158, 60 168 C64 166, 65 145, 63 130 Z"
              fill={getMuscleColor('calves')}
              opacity={getMuscleOpacity('calves')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
          </svg>
        </div>

        {/* Posterior (Back Body) */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Tampak Belakang</span>
          <svg
            width={width / 2}
            height={height}
            viewBox="0 0 100 180"
            className="overflow-visible"
            aria-label="Diagram Otot Tubuh Bagian Belakang"
          >
            {/* Head & Neck */}
            <circle cx="50" cy="18" r="10" fill="#334155" opacity="0.4" />
            <rect x="47" y="27" width="6" height="7" rx="2" fill="#334155" opacity="0.4" />

            {/* Upper Back & Trapezius */}
            <path
              d="M38 31 C46 29, 54 29, 62 31 L58 44 C53 47, 47 47, 42 44 Z"
              fill={getMuscleColor('upper_back')}
              opacity={getMuscleOpacity('upper_back')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />

            {/* Rear Deltoids */}
            <path
              d="M26 36 C30 33, 35 34, 34 42 C30 45, 25 43, 26 36 Z"
              fill={getMuscleColor('rear_delts') || getMuscleColor('shoulders')}
              opacity={getMuscleOpacity('rear_delts') || getMuscleOpacity('shoulders')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <path
              d="M74 36 C70 33, 65 34, 66 42 C70 45, 75 43, 74 36 Z"
              fill={getMuscleColor('rear_delts') || getMuscleColor('shoulders')}
              opacity={getMuscleOpacity('rear_delts') || getMuscleOpacity('shoulders')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />

            {/* Latissimus Dorsi (Wings) */}
            <path
              d="M35 44 C42 47, 47 47, 48 64 C40 68, 34 62, 33 50 Z"
              fill={getMuscleColor('lats')}
              opacity={getMuscleOpacity('lats')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <path
              d="M65 44 C58 47, 53 47, 52 64 C60 68, 66 62, 67 50 Z"
              fill={getMuscleColor('lats')}
              opacity={getMuscleOpacity('lats')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />

            {/* Triceps */}
            <path
              d="M23 45 C27 45, 28 54, 26 60 C23 59, 22 53, 23 45 Z"
              fill={getMuscleColor('triceps')}
              opacity={getMuscleOpacity('triceps')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <path
              d="M77 45 C73 45, 72 54, 74 60 C77 59, 78 53, 77 45 Z"
              fill={getMuscleColor('triceps')}
              opacity={getMuscleOpacity('triceps')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />

            {/* Glutes (Bokong) */}
            <path
              d="M35 78 C48 76, 49 96, 37 101 C33 97, 33 86, 35 78 Z"
              fill={getMuscleColor('glutes')}
              opacity={getMuscleOpacity('glutes')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <path
              d="M65 78 C52 76, 51 96, 63 101 C67 97, 67 86, 65 78 Z"
              fill={getMuscleColor('glutes')}
              opacity={getMuscleOpacity('glutes')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />

            {/* Hamstrings */}
            <path
              d="M36 103 C46 102, 45 125, 41 127 C36 125, 34 116, 36 103 Z"
              fill={getMuscleColor('hamstrings')}
              opacity={getMuscleOpacity('hamstrings')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <path
              d="M64 103 C54 102, 55 125, 59 127 C64 125, 66 116, 64 103 Z"
              fill={getMuscleColor('hamstrings')}
              opacity={getMuscleOpacity('hamstrings')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />

            {/* Gastrocnemius / Calves */}
            <path
              d="M36 130 C44 130, 44 156, 40 167 C36 165, 34 146, 36 130 Z"
              fill={getMuscleColor('calves')}
              opacity={getMuscleOpacity('calves')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <path
              d="M64 130 C56 130, 56 156, 60 167 C64 165, 66 146, 64 130 Z"
              fill={getMuscleColor('calves')}
              opacity={getMuscleOpacity('calves')}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-300 font-medium">Otot Primer (Utama)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          <span className="text-slate-400">Otot Sekunder</span>
        </div>
      </div>
    </div>
  );
};
