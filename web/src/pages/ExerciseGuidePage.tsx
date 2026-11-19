import React, { useState } from 'react';
import { EXERCISE_GUIDES, ExerciseGuide } from '../data/exerciseGuides';
import { ExerciseFormPlayer } from '../components/ExerciseFormPlayer';
import { Search, Play, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ExerciseGuidePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeGuide, setActiveGuide] = useState<ExerciseGuide>(EXERCISE_GUIDES[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['Semua', 'Dada', 'Kaki', 'Punggung', 'Core', 'Lengan', 'Kardio & Lari', 'Senam & Fleksibilitas', 'Sepeda & Renang'];

  const filteredGuides = EXERCISE_GUIDES.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.primaryMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'Semua' || g.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSelectGuide = (guide: ExerciseGuide) => {
    setActiveGuide(guide);
    if (window.innerWidth < 1024) {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Symmetrical Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Panduan Form Latihan 100% Client-Side
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulasi biomekanika vektor 60fps, sudut sendi optimal, dan audio metronom repetisi.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari gerakan (contoh: push up)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Symmetrical Dual-Column Layout (Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Exercise Cards */}
        <div className="lg:col-span-5 space-y-3">
          {filteredGuides.map((guide) => {
            const isSelected = activeGuide.id === guide.id;
            return (
              <div
                key={guide.id}
                onClick={() => handleSelectGuide(guide)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h3 className="text-sm font-bold text-white">{guide.name}</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-medium">
                    {guide.tempo}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {guide.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="capitalize">{guide.category}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium capitalize">
                      {guide.primaryMuscles.join(', ').replace(/_/g, ' ')}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectGuide(guide);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Play size={12} />
                    Putar Tutorial
                  </button>
                </div>
              </div>
            );
          })}

          {filteredGuides.length === 0 && (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
              <ShieldAlert size={28} className="mx-auto text-slate-500 mb-2" />
              <p className="text-sm font-bold text-slate-300">Latihan tidak ditemukan</p>
              <p className="text-xs text-slate-500 mt-1">Coba kata kunci pencarian yang lain.</p>
            </div>
          )}
        </div>

        {/* Right Column: Active Interactive Player (Desktop Sticky View) */}
        <div className="hidden lg:block lg:col-span-7 sticky top-4">
          <ExerciseFormPlayer guide={activeGuide} />
        </div>
      </div>

      {/* Mobile Fullscreen Modal Player */}
      {isModalOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-3 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-lg my-auto">
            <ExerciseFormPlayer
              guide={activeGuide}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
