// Bilingual internationalization dictionaries (Indonesian & English)
export type Language = 'id' | 'en';

export const translations = {
  id: {
    // Navigation
    navDashboard: 'Beranda',
    navNutrition: 'Nutrisi',
    navWorkout: 'Latihan',
    navFatBurner: 'Fat Burn',
    navHealth: 'Kesehatan',
    navGuide: 'Panduan Form',
    navSettings: 'Pengaturan',

    // Header & Brand
    brandSubtitle: 'Edge Fitness & Body Engine',
    serverHealthy: 'Aktif & Sehat',
    languageToggle: 'Bahasa',
    multiConnect: 'Multi-Connect',

    // Dashboard
    greetingMorning: 'Selamat Pagi',
    greetingAfternoon: 'Selamat Siang',
    greetingEvening: 'Selamat Malam',
    welcomeBack: 'Selamat Datang',
    todaySummary: 'Ringkasan Aktivitas Hari Ini',
    calories: 'Kalori',
    protein: 'Protein',
    carbs: 'Karbohidrat',
    fat: 'Lemak',
    fiber: 'Serat',
    water: 'Air Mineral',
    workout: 'Latihan Fisik',
    burned: 'Terbakar',
    remaining: 'Tersisa',
    target: 'Target',

    // Quick Actions
    logFood: 'Catat Makanan',
    logWorkout: 'Catat Latihan',
    startFatBurn: 'Fat Burner',
    viewFormGuide: 'Panduan Gerakan',
    quickActions: 'Aksi Cepat',

    // Form Guide / Tutorial
    exerciseTutorial: 'Tutorial Gerakan Latihan',
    mode3dMannequin: '3D Mannequin 360°',
    modeRealVideo: 'Video Manusia Asli',
    modeRealistic2d: 'Animasi 2D Anatomi Detail',
    jointAngles: 'Sudut Sendi Real-Time',
    phaseTempo: 'Fase Tempo',
    phaseLower: 'Turun (Eccentric)',
    phaseHold: 'Tahan (Isometric)',
    phasePush: 'Dorong (Concentric)',
    metronome: 'Metronom Audio',
    speed: 'Kecepatan',
    setupSteps: 'Langkah Persiapan',
    executionSteps: 'Instruksi Eksekusi',
    commonMistakes: 'Kesalahan Umum yang Harus Dihindari',
    proTip: 'Tips Pelatih',
    primaryMuscles: 'Otot Utama',
    secondaryMuscles: 'Otot Penstabil',

    // Multi-Connect & Devices
    smartbandConnect: 'Hubungkan Smartband (BLE)',
    smartbandConnected: 'Smartband Terhubung',
    smartbandDisconnected: 'Smartband Terputus',
    liveHeartRate: 'Detak Jantung Live',
    bpm: 'BPM',
    zoneWarmup: 'Pemanasan',
    zoneFatBurn: 'Pembakaran Lemak',
    zoneCardio: 'Kardio Aerobik',
    zonePeak: 'Beban Maksimal',
    appleHealthSync: 'Sinkronisasi Apple Health',
    googleFitSync: 'Sinkronisasi Google Fit',
    gymCast: 'Multi-Screen Gym Cast',
    gymCastDesc: 'Tayangkan sesi latihan langsung ke TV atau layar komputer.',
    castActive: 'Siaran Layar Aktif',

    // Nutrition
    foodLibrary: 'Katalog Makanan & Masakan',
    searchFood: 'Cari makanan atau minuman...',
    portion: 'Porsi',
    addFood: 'Tambah ke Buku Harian',
    customFood: 'Tambah Makanan Kustom',

    // Accounts & Auth
    account: 'Akun Pengguna',
    login: 'Masuk',
    register: 'Daftar Akun Baru',
    logout: 'Keluar dari Akun',
    username: 'Nama Pengguna',
    password: 'Kata Sandi',
    displayName: 'Nama Lengkap / Panggilan',
    autoLoginNotice: 'Perangkat ini otomatis masuk menggunakan token aman lokal.',
    noAccountPrompt: 'Belum punya akun? Daftar sekarang untuk memantau data tubuh Anda.',
    haveAccountPrompt: 'Sudah punya akun? Masuk di sini.',
    logoutConfirm: 'Apakah Anda yakin ingin keluar dari akun ini di perangkat ini?',

    // Settings & Theme
    themeSettings: 'Personalisasi & Tema',
    backgroundStyle: 'Gaya Latar Belakang',
    accentColor: 'Warna Aksen Utama',
    bgMesh: 'Subtle Mesh Modern',
    bgMidnight: 'Deep Space Midnight',
    bgCharcoal: 'Warm Studio Charcoal',
    bgEmerald: 'Hutan Zamrud (Emerald)',
    bgSlate: 'Minimalist Slate',
    accentEmerald: 'Emerald Zamrud',
    accentBlue: 'Electric Blue',
    accentCyan: 'Cyan Segar',
    accentAmber: 'Sunset Amber',
    accentRose: 'Rose Quartz',
    accentPurple: 'Royal Violet',

    // Common Buttons
    save: 'Simpan',
    cancel: 'Batal',
    close: 'Tutup',
    refresh: 'Perbarui',
    delete: 'Hapus',
    confirm: 'Konfirmasi',
    back: 'Kembali',
  },
  en: {
    // Navigation
    navDashboard: 'Dashboard',
    navNutrition: 'Nutrition',
    navWorkout: 'Workout',
    navFatBurner: 'Fat Burn',
    navHealth: 'Health',
    navGuide: 'Form Guide',
    navSettings: 'Settings',

    // Header & Brand
    brandSubtitle: 'Edge Fitness & Body Engine',
    serverHealthy: 'Active & Healthy',
    languageToggle: 'Language',
    multiConnect: 'Multi-Connect',

    // Dashboard
    greetingMorning: 'Good Morning',
    greetingAfternoon: 'Good Afternoon',
    greetingEvening: 'Good Evening',
    welcomeBack: 'Welcome Back',
    todaySummary: "Today's Activity Overview",
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    fiber: 'Fiber',
    water: 'Water Intake',
    workout: 'Workout',
    burned: 'Burned',
    remaining: 'Remaining',
    target: 'Target',

    // Quick Actions
    logFood: 'Log Food',
    logWorkout: 'Log Workout',
    startFatBurn: 'Fat Burner',
    viewFormGuide: 'Form Guide',
    quickActions: 'Quick Actions',

    // Form Guide / Tutorial
    exerciseTutorial: 'Exercise Form Tutorial',
    mode3dMannequin: '3D Mannequin 360°',
    modeRealVideo: 'Real Human Video',
    modeRealistic2d: 'Detailed 2D Anatomy Motion',
    jointAngles: 'Live Joint Angles',
    phaseTempo: 'Cadence Phase',
    phaseLower: 'Lower (Eccentric)',
    phaseHold: 'Hold (Isometric)',
    phasePush: 'Push (Concentric)',
    metronome: 'Audio Metronome',
    speed: 'Playback Speed',
    setupSteps: 'Setup Cues',
    executionSteps: 'Execution Guide',
    commonMistakes: 'Common Form Mistakes to Avoid',
    proTip: 'Pro Coaching Tip',
    primaryMuscles: 'Primary Movers',
    secondaryMuscles: 'Stabilizers',

    // Multi-Connect & Devices
    smartbandConnect: 'Connect Smartband (BLE)',
    smartbandConnected: 'Smartband Connected',
    smartbandDisconnected: 'Smartband Disconnected',
    liveHeartRate: 'Live Heart Rate',
    bpm: 'BPM',
    zoneWarmup: 'Warm Up',
    zoneFatBurn: 'Fat Burn Zone',
    zoneCardio: 'Aerobic Cardio',
    zonePeak: 'Peak Effort',
    appleHealthSync: 'Apple Health Sync',
    googleFitSync: 'Google Fit Sync',
    gymCast: 'Multi-Screen Gym Cast',
    gymCastDesc: 'Broadcast your live workout session to a TV or laptop screen.',
    castActive: 'Gym Cast Active',

    // Nutrition
    foodLibrary: 'Food & Meals Catalog',
    searchFood: 'Search food or beverage...',
    portion: 'Portion',
    addFood: 'Add to Daily Diary',
    customFood: 'Add Custom Food',

    // Accounts & Auth
    account: 'User Account',
    login: 'Log In',
    register: 'Create New Account',
    logout: 'Log Out',
    username: 'Username',
    password: 'Password',
    displayName: 'Display Name',
    autoLoginNotice: 'This device automatically signs in with a secure local token.',
    noAccountPrompt: "Don't have an account? Sign up now to track your personal body metrics.",
    haveAccountPrompt: 'Already have an account? Log in here.',
    logoutConfirm: 'Are you sure you want to log out on this device?',

    // Settings & Theme
    themeSettings: 'Personalization & Theme',
    backgroundStyle: 'Background Style',
    accentColor: 'Primary Accent Color',
    bgMesh: 'Modern Subtle Mesh',
    bgMidnight: 'Deep Space Midnight',
    bgCharcoal: 'Warm Studio Charcoal',
    bgEmerald: 'Deep Emerald Forest',
    bgSlate: 'Minimalist Slate',
    accentEmerald: 'Emerald Green',
    accentBlue: 'Electric Blue',
    accentCyan: 'Fresh Cyan',
    accentAmber: 'Sunset Amber',
    accentRose: 'Rose Quartz',
    accentPurple: 'Royal Violet',

    // Common Buttons
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    refresh: 'Refresh',
    delete: 'Delete',
    confirm: 'Confirm',
    back: 'Back',
  },
} as const;

export type TranslationKey = keyof typeof translations['id'];

let currentLanguage: Language = (localStorage.getItem('bugar_lang') as Language) || 'id';

export function getLanguage(): Language {
  return currentLanguage;
}

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
  localStorage.setItem('bugar_lang', lang);
  window.dispatchEvent(new Event('bugar_lang_change'));
}

export function t(key: TranslationKey): string {
  return translations[currentLanguage]?.[key] || translations['id']?.[key] || key;
}
