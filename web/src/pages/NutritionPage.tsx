import React, { useState, useMemo } from 'react';
import { UserProfile, FoodLog, MealType, FoodItem } from '../types';
import { INDONESIAN_FOODS } from '../data/indonesianFoods';
import {
  Utensils,
  Plus,
  Search,
  Trash2,
  PieChart,
  X,
  Flame,
  CheckCircle2,
  Sparkles,
  Coffee,
  Sun,
  Moon,
  Apple
} from 'lucide-react';

interface NutritionPageProps {
  profile: UserProfile;
  foodLogs: FoodLog[];
  customFoods: FoodItem[];
  onAddFoodLog: (log: Omit<FoodLog, 'id' | 'updated_at'>) => void;
  onDeleteFoodLog: (id: string) => void;
  onAddCustomFood: (food: FoodItem) => void;
}

export const NutritionPage: React.FC<NutritionPageProps> = ({
  profile,
  foodLogs,
  customFoods,
  onAddFoodLog,
  onDeleteFoodLog,
  onAddCustomFood,
}) => {
  const [activeMealType, setActiveMealType] = useState<MealType>('breakfast');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Custom food form state
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Protein');
  const [customServing, setCustomServing] = useState('100g');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  // Combine pre-seeded foods + custom user foods
  const allFoods = useMemo(() => {
    return [...customFoods, ...INDONESIAN_FOODS];
  }, [customFoods]);

  // Instant client-side search (< 5ms)
  const filteredFoods = useMemo(() => {
    return allFoods.filter(item => {
      const matchQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
      return matchQuery && matchCat;
    });
  }, [allFoods, searchQuery, selectedCategory]);

  // Group food logs by meal type
  const mealSections: { type: MealType; title: string; icon: React.ReactNode; color: string }[] = [
    { type: 'breakfast', title: 'Sarapan Pagi', icon: <Coffee size={18} />, color: 'text-amber-400' },
    { type: 'lunch', title: 'Makan Siang', icon: <Sun size={18} />, color: 'text-orange-400' },
    { type: 'dinner', title: 'Makan Malam', icon: <Moon size={18} />, color: 'text-indigo-400' },
    { type: 'snack', title: 'Camilan & Tambahan', icon: <Apple size={18} />, color: 'text-emerald-400' },
  ];

  const totalCalories = foodLogs.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = foodLogs.reduce((acc, curr) => acc + curr.protein_g, 0);
  const totalCarbs = foodLogs.reduce((acc, curr) => acc + curr.carbs_g, 0);
  const totalFat = foodLogs.reduce((acc, curr) => acc + curr.fat_g, 0);

  const handleSelectFood = (food: FoodItem) => {
    onAddFoodLog({
      user_id: profile.id,
      date: new Date().toISOString().split('T')[0],
      meal_type: activeMealType,
      food_name: food.name,
      serving_count: 1,
      serving_unit: food.serving_size,
      calories: food.calories,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
    });
    setShowSearchModal(false);
  };

  const handleSaveCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customCalories) return;

    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customName,
      category: customCategory,
      serving_size: customServing || '1 porsi',
      calories: parseFloat(customCalories) || 0,
      protein_g: parseFloat(customProtein) || 0,
      carbs_g: parseFloat(customCarbs) || 0,
      fat_g: parseFloat(customFat) || 0,
      is_custom: true,
    };

    onAddCustomFood(newFood);
    handleSelectFood(newFood);
    setShowCustomFoodModal(false);

    // Reset
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
  };

  const categories = ['Semua', 'Karbohidrat', 'Protein', 'Nabati', 'Sayuran', 'Hidangan', 'Buah', 'Minuman'];

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl glass-panel relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Utensils size={18} />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">Pola Makan & Kalori</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Jurnal 4 waktu dengan 50+ database makanan khas Indonesia
            </p>
          </div>

          {/* Quick Macros Summary */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold">
              {Math.round(totalCalories)} / {profile.target_calories} kcal
            </span>
            <span className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              {totalProtein.toFixed(0)}g P
            </span>
            <span className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {totalCarbs.toFixed(0)}g C
            </span>
            <span className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              {totalFat.toFixed(0)}g F
            </span>
          </div>
        </div>
      </div>

      {/* 4 Jurnal Makan Cards */}
      <div className="space-y-4">
        {mealSections.map(({ type, title, icon, color }) => {
          const sectionLogs = foodLogs.filter(item => item.meal_type === type);
          const sectionCalories = sectionLogs.reduce((sum, item) => sum + item.calories, 0);

          return (
            <div key={type} className="p-4 rounded-3xl glass-card border border-slate-800/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center ${color}`}>
                    {icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                    <p className="text-[11px] text-slate-400">
                      {sectionLogs.length} Item • <span className="font-semibold text-slate-300">{Math.round(sectionCalories)} kcal</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveMealType(type);
                    setShowSearchModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1 transition-all"
                >
                  <Plus size={14} /> Tambah
                </button>
              </div>

              {/* Meal item list */}
              {sectionLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center italic">
                  Belum ada makanan dicatat untuk {title.toLowerCase()}.
                </p>
              ) : (
                <div className="divide-y divide-slate-800/50 mt-1">
                  {sectionLogs.map(item => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-slate-200">{item.food_name}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.serving_unit} • {item.protein_g}g P • {item.carbs_g}g C • {item.fat_g}g F
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white">
                          {Math.round(item.calories)} kcal
                        </span>
                        <button
                          onClick={() => onDeleteFoodLog(item.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Pencarian Makanan Indonesia */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-obsidian/85 backdrop-blur-md">
          <div className="w-full sm:max-w-xl h-[85vh] sm:h-[80vh] flex flex-col rounded-t-3xl sm:rounded-3xl glass-panel p-5 border border-slate-700/60 shadow-2xl safe-bottom">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Tambah Makanan ke {activeMealType}</h3>
                <p className="text-xs text-slate-400">Database Lokal Indonesia (<strong className="text-emerald-400">{allFoods.length} pilihan</strong>)</p>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Instant Search Bar */}
            <div className="relative my-3">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Cari nasi, ayam bakar, telur, soto, tempe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Food List Results */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 pr-1">
              {filteredFoods.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-400 mb-3">Makanan "{searchQuery}" tidak ditemukan.</p>
                  <button
                    onClick={() => {
                      setShowSearchModal(false);
                      setShowCustomFoodModal(true);
                      setCustomName(searchQuery);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold"
                  >
                    + Buat Makanan Kustom
                  </button>
                </div>
              ) : (
                filteredFoods.map(food => (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="w-full py-2.5 px-2 flex items-center justify-between text-left hover:bg-slate-800/40 rounded-xl transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {food.name}
                        </span>
                        {food.is_custom && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400">Kustom</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {food.serving_size} • P: {food.protein_g}g | C: {food.carbs_g}g | F: {food.fat_g}g
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {food.calories} kcal
                      </span>
                      <p className="text-[10px] text-slate-500 font-semibold">{food.category}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Custom food footer button */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">Mencari lebih dari 50+ menu lokal</span>
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setShowCustomFoodModal(true);
                }}
                className="text-xs font-bold text-emerald-400 hover:underline"
              >
                + Tambah Makanan Kustom
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Custom Food */}
      {showCustomFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-slate-700/60 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Buat Makanan Kustom</h3>
              <button onClick={() => setShowCustomFoodModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomFood} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Nama Makanan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Smoothie Protein Pisang Berry"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Kategori</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories.filter(c => c !== 'Semua').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Ukuran Porsi</label>
                  <input
                    type="text"
                    placeholder="1 mangkuk / 100g"
                    value={customServing}
                    onChange={(e) => setCustomServing(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Kalori (kcal) *</label>
                  <input
                    type="number"
                    required
                    placeholder="250"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-blue-400 font-medium block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="25"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-amber-400 font-medium block mb-1">Karbohidrat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-rose-400 font-medium block mb-1">Lemak (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="5"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all"
                >
                  Simpan & Masukkan ke Jurnal
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomFoodModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
