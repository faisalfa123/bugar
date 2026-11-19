// Dynamic Theme & Customizable Background Manager
export type BgStyle = 'mesh' | 'midnight' | 'charcoal' | 'emerald' | 'slate';
export type AccentColor = 'emerald' | 'blue' | 'cyan' | 'amber' | 'rose' | 'purple';

export interface ThemeConfig {
  bgStyle: BgStyle;
  accent: AccentColor;
}

const DEFAULT_THEME: ThemeConfig = {
  bgStyle: 'mesh',
  accent: 'emerald',
};

export const ACCENT_COLORS: Record<AccentColor, { name: string; hex: string; bgClass: string; textClass: string; borderClass: string }> = {
  emerald: {
    name: 'Emerald Zamrud',
    hex: '#10b981',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500',
  },
  blue: {
    name: 'Electric Blue',
    hex: '#3b82f6',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500',
  },
  cyan: {
    name: 'Fresh Cyan',
    hex: '#06b6d4',
    bgClass: 'bg-cyan-500',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500',
  },
  amber: {
    name: 'Sunset Amber',
    hex: '#f59e0b',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500',
  },
  rose: {
    name: 'Rose Quartz',
    hex: '#f43f5e',
    bgClass: 'bg-rose-500',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500',
  },
  purple: {
    name: 'Royal Violet',
    hex: '#a855f7',
    bgClass: 'bg-purple-500',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500',
  },
};

export const BG_STYLES: Record<BgStyle, { name: string; cssBackground: string; cardBg: string }> = {
  mesh: {
    name: 'Subtle Mesh Modern',
    cssBackground: 'radial-gradient(at 15% 15%, rgba(16, 185, 129, 0.07) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(59, 130, 246, 0.07) 0px, transparent 50%), #0d1117',
    cardBg: 'rgba(22, 27, 34, 0.85)',
  },
  midnight: {
    name: 'Deep Space Midnight',
    cssBackground: 'linear-gradient(180deg, #050811 0%, #0a0f1d 100%)',
    cardBg: 'rgba(15, 23, 42, 0.85)',
  },
  charcoal: {
    name: 'Warm Studio Charcoal',
    cssBackground: 'linear-gradient(180deg, #121214 0%, #18181b 100%)',
    cardBg: 'rgba(24, 24, 27, 0.85)',
  },
  emerald: {
    name: 'Deep Forest Emerald',
    cssBackground: 'radial-gradient(ellipse at top, #062419 0%, #03120c 100%)',
    cardBg: 'rgba(6, 36, 25, 0.85)',
  },
  slate: {
    name: 'Minimalist Slate',
    cssBackground: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    cardBg: 'rgba(30, 41, 59, 0.85)',
  },
};

export function getStoredTheme(): ThemeConfig {
  try {
    const raw = localStorage.getItem('bugar_theme');
    if (raw) {
      return { ...DEFAULT_THEME, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_THEME;
}

export function saveTheme(theme: ThemeConfig): void {
  localStorage.setItem('bugar_theme', JSON.stringify(theme));
  window.dispatchEvent(new Event('bugar_theme_change'));
}
