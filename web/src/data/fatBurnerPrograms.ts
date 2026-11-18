import { FatBurnerProgram } from '../types';

export const FAT_BURNER_PROGRAMS: FatBurnerProgram[] = [
  {
    id: 'prog-01',
    title: '7-Menit Tabata Express Fat Torch',
    subtitle: 'Latihan intensitas tinggi kilat pembakar lemak perut',
    durationMinutes: 7,
    caloriesBurnedEst: 95,
    intensity: 'Intens',
    location: 'Rumah',
    targetMuscle: 'Full Body & Core',
    intervals: [
      { name: 'Jumping Jacks', durationSeconds: 20, isRest: false, instruction: 'Buka tutup kaki dan tangan dengan tempo cepat dan stabil.' },
      { name: 'Istirahat Singkat', durationSeconds: 10, isRest: true, instruction: 'Tarik napas dalam dari hidung, embuskan lewat mulut.' },
      { name: 'Bodyweight Squats', durationSeconds: 20, isRest: false, instruction: 'Turunkan pinggul sejajar lutut, jaga dada tetap tegak.' },
      { name: 'Istirahat Singkat', durationSeconds: 10, isRest: true, instruction: 'Relakskan otot kaki sejenak.' },
      { name: 'High Knees Run', durationSeconds: 20, isRest: false, instruction: 'Angkat lutut setinggi pinggang sambil mengayunkan lengan.' },
      { name: 'Istirahat Singkat', durationSeconds: 10, isRest: true, instruction: 'Atur ritme napas.' },
      { name: 'Push-up / Knee Push-up', durationSeconds: 20, isRest: false, instruction: 'Turunkan dada hingga dekat lantai, kunci otot perut.' },
      { name: 'Istirahat Singkat', durationSeconds: 10, isRest: true, instruction: 'Regangkan pergelangan tangan.' },
      { name: 'Mountain Climbers', durationSeconds: 20, isRest: false, instruction: 'Posisi plank, kayuh lutut bergantian ke arah dada.' },
      { name: 'Istirahat Singkat', durationSeconds: 10, isRest: true, instruction: 'Tarik napas panjang.' },
      { name: 'Glute Bridges', durationSeconds: 20, isRest: false, instruction: 'Dorong pinggul ke atas menggunakan tumit, remas bokong.' },
      { name: 'Istirahat Singkat', durationSeconds: 10, isRest: true, instruction: 'Tarik napas sejenak.' },
      { name: 'Plank Hold', durationSeconds: 20, isRest: false, instruction: 'Tahan tubuh lurus sejajar dari kepala hingga tumit.' },
      { name: 'Selesai & Cool Down', durationSeconds: 10, isRest: true, instruction: 'Latihan selesai! Pendinginan dan minum air.' }
    ]
  },
  {
    id: 'prog-02',
    title: '15-Menit Core & Abs Burner',
    subtitle: 'Membakar lemak visceral dan memperkuat dinding perut',
    durationMinutes: 15,
    caloriesBurnedEst: 140,
    intensity: 'Menengah',
    location: 'Rumah',
    targetMuscle: 'Abs, Obliques & Lower Back',
    intervals: [
      { name: 'Bicycle Crunches', durationSeconds: 30, isRest: false, instruction: 'Siku kanan sentuh lutut kiri bergantian secara ritmis.' },
      { name: 'Istirahat', durationSeconds: 15, isRest: true, instruction: 'Tarik napas dalam.' },
      { name: 'Russian Twists', durationSeconds: 30, isRest: false, instruction: 'Pilin tubuh kiri dan kanan, jaga kaki melayang jika mampu.' },
      { name: 'Istirahat', durationSeconds: 15, isRest: true, instruction: 'Rilekskan otot perut sejenak.' },
      { name: 'Leg Raises', durationSeconds: 30, isRest: false, instruction: 'Angkat kaki lurus ke atas, turunkan perlahan tanpa menyentuh lantai.' },
      { name: 'Istirahat', durationSeconds: 15, isRest: true, instruction: 'Tarik napas.' },
      { name: 'Forearm Plank', durationSeconds: 45, isRest: false, instruction: 'Kunci otot perut dan bokong, pandangan ke arah lantai.' },
      { name: 'Istirahat', durationSeconds: 15, isRest: true, instruction: 'Pendinginan ringan.' },
      { name: 'Flutter Kicks', durationSeconds: 30, isRest: false, instruction: 'Tendangkan kaki kecil bergantian dengan perut terkunci.' },
      { name: 'Istirahat', durationSeconds: 15, isRest: true, instruction: 'Ambil napas dalam.' },
      { name: 'Side Plank Kanan', durationSeconds: 30, isRest: false, instruction: 'Tahan tubuh menyamping dengan siku kanan.' },
      { name: 'Side Plank Kiri', durationSeconds: 30, isRest: false, instruction: 'Tahan tubuh menyamping dengan siku kiri.' },
      { name: 'Istirahat Akhir', durationSeconds: 20, isRest: true, instruction: 'Istirahat sejenak.' }
    ]
  },
  {
    id: 'prog-03',
    title: '15-Menit Calisthenics Fat Destroyer',
    subtitle: 'Gerakan fungsional beban tubuh untuk membakar lemak aktif',
    durationMinutes: 15,
    caloriesBurnedEst: 165,
    intensity: 'Intens',
    location: 'Rumah',
    targetMuscle: 'Full Body',
    intervals: [
      { name: 'Burpees Tanpa Push-up', durationSeconds: 30, isRest: false, instruction: 'Jongkok, lempar kaki ke belakang, lompat kembali ke atas.' },
      { name: 'Istirahat', durationSeconds: 20, isRest: true, instruction: 'Atur ritme napas teratur.' },
      { name: 'Walking Lunges', durationSeconds: 30, isRest: false, instruction: 'Langkah maju lebar, tekuk kedua lutut 90 derajat.' },
      { name: 'Istirahat', durationSeconds: 15, isRest: true, instruction: 'Tarik napas.' },
      { name: 'Pike Push-ups', durationSeconds: 30, isRest: false, instruction: 'Posisi pinggul tinggi segitiga, dorong bahu dan trisep.' },
      { name: 'Istirahat', durationSeconds: 20, isRest: true, instruction: 'Rilekskan bahu.' },
      { name: 'Squat Pulses', durationSeconds: 30, isRest: false, instruction: 'Tahan posisi jongkok rendah sambil memantul kecil.' },
      { name: 'Istirahat Akhir', durationSeconds: 20, isRest: true, instruction: 'Regangkan otot paha.' }
    ]
  },
  {
    id: 'prog-04',
    title: '30-Menit Dumbbell Complex Torch',
    subtitle: 'Kombinasi angkat beban & HIIT pembakar metabolisme tinggi',
    durationMinutes: 30,
    caloriesBurnedEst: 320,
    intensity: 'Intens',
    location: 'Gym',
    targetMuscle: 'Bahu, Paha, Punggung',
    intervals: [
      { name: 'Dumbbell Thrusters', durationSeconds: 40, isRest: false, instruction: 'Front squat langsung dorong beban ke atas kepala.' },
      { name: 'Istirahat', durationSeconds: 20, isRest: true, instruction: 'Tarik napas dalam.' },
      { name: 'Dumbbell Romanian Deadlift', durationSeconds: 40, isRest: false, instruction: 'Dorong pinggul ke belakang, rasakan tarikan hamstring.' },
      { name: 'Istirahat', durationSeconds: 20, isRest: true, instruction: 'Relakskan pinggang.' },
      { name: 'Dumbbell Renegade Rows', durationSeconds: 40, isRest: false, instruction: 'Plank sambil menarik barbel ke pinggang bergantian.' },
      { name: 'Istirahat Panjang', durationSeconds: 40, isRest: true, instruction: 'Minum seteguk air.' }
    ]
  },
  {
    id: 'prog-05',
    title: '7-Menit Morning Energy Wake-Up',
    subtitle: 'Membangunkan metabolisme pagi hari tanpa kelelahan ekstrem',
    durationMinutes: 7,
    caloriesBurnedEst: 65,
    intensity: 'Pemula',
    location: 'Rumah',
    targetMuscle: 'Mobilitas & Kardio Ringan',
    intervals: [
      { name: 'Arm Circles & Torso Twist', durationSeconds: 30, isRest: false, instruction: 'Putar lengan dan pelintir tubuh perlahan.' },
      { name: 'Jalan di Tempat Cepat', durationSeconds: 30, isRest: false, instruction: 'Ayunkan lengan dengan rileks dan mantap.' },
      { name: 'Side Step Jack', durationSeconds: 30, isRest: false, instruction: 'Langkah kaki ke samping bergantian sambil angkat tangan.' },
      { name: 'Standing Knee to Elbow', durationSeconds: 30, isRest: false, instruction: 'Silangkan lutut dan siku di depan dada secara santai.' },
      { name: 'Deep Breathing Cool', durationSeconds: 30, isRest: true, instruction: 'Tarik napas penuh, isi paru-paru dengan oksigen segar.' }
    ]
  },
  {
    id: 'prog-06',
    title: '30-Menit Treadmill Incline Fat Burn Zone',
    subtitle: 'Zona 2 kardio tanjakan untuk pembakaran lemak maksimal',
    durationMinutes: 30,
    caloriesBurnedEst: 280,
    intensity: 'Menengah',
    location: 'Gym',
    targetMuscle: 'Kaki & Kardiovaskular',
    intervals: [
      { name: 'Pemanasan Flat Walk (Speed 4.5)', durationSeconds: 180, isRest: false, instruction: 'Jalan santai ritmis di permukaan datar.' },
      { name: 'Incline Climb (Kemiringan 8%, Speed 5.0)', durationSeconds: 300, isRest: false, instruction: 'Jaga postur tegak, jangan berpegangan erat pada grip.' },
      { name: 'Pemulihan Flat (Kemiringan 1%)', durationSeconds: 120, isRest: true, instruction: 'Kurangi kecepatan sejenak, atur napas teratur.' },
      { name: 'Incline Power Walk (Kemiringan 10%, Speed 5.2)', durationSeconds: 300, isRest: false, instruction: 'Dorong tumit dengan kuat pada tanjakan.' },
      { name: 'Cool Down Walk', durationSeconds: 180, isRest: true, instruction: 'Turunkan kecepatan perlahan hingga detak jantung normal.' }
    ]
  },
  {
    id: 'prog-07',
    title: '15-Menit Glutes & Lower Body Blast',
    subtitle: 'Fokus pembentukan dan pembakaran paha serta bokong',
    durationMinutes: 15,
    caloriesBurnedEst: 150,
    intensity: 'Menengah',
    location: 'Rumah',
    targetMuscle: 'Glutes, Quads & Hamstrings',
    intervals: [
      { name: 'Sumo Squats', durationSeconds: 35, isRest: false, instruction: 'Buka kaki selebar bahu ke luar, turunkan pinggul dalam.' },
      { name: 'Istirahat', durationSeconds: 15, isRest: true, instruction: 'Relakskan paha.' },
      { name: 'Curtsy Lunges', durationSeconds: 35, isRest: false, instruction: 'Langkah menyilang ke belakang kiri dan kanan bergantian.' },
      { name: 'Istirahat', durationSeconds: 15, isRest: true, instruction: 'Ambil napas.' },
      { name: 'Donkey Kicks Kanan', durationSeconds: 30, isRest: false, instruction: 'Tendang tumit kanan ke langit-langit, tahan di puncak.' },
      { name: 'Donkey Kicks Kiri', durationSeconds: 30, isRest: false, instruction: 'Tendang tumit kiri ke langit-langit, tahan di puncak.' },
      { name: 'Istirahat', durationSeconds: 20, isRest: true, instruction: 'Regangkan bokong sejenak.' }
    ]
  },
  {
    id: 'prog-08',
    title: '45-Menit Ultimate Warrior Gym Fat Melt',
    subtitle: 'Sesi latihan beban komplit gabungan superset kardio',
    durationMinutes: 45,
    caloriesBurnedEst: 480,
    intensity: 'Intens',
    location: 'Gym',
    targetMuscle: 'Seluruh Tubuh',
    intervals: [
      { name: 'Kettlebell Swings', durationSeconds: 45, isRest: false, instruction: 'Engsel pinggul kuat dorong bola besi setinggi dada.' },
      { name: 'Istirahat', durationSeconds: 20, isRest: true, instruction: 'Tarik napas hidung, buang mulut.' },
      { name: 'Battle Rope Slams', durationSeconds: 30, isRest: false, instruction: 'Hantamkan kedua tali tambang secara sinkron ke lantai.' },
      { name: 'Istirahat', durationSeconds: 25, isRest: true, instruction: 'Atur ritme napas.' },
      { name: 'Rowing Machine Sprint', durationSeconds: 60, isRest: false, instruction: 'Dayung kuat dengan dorongan kaki dan tarikan punggung.' },
      { name: 'Istirahat Panjang', durationSeconds: 45, isRest: true, instruction: 'Minum air dan siapkan set berikutnya.' }
    ]
  },
  {
    id: 'prog-09',
    title: '7-Menit Silent Workout (Apartemen / Malam)',
    subtitle: 'Bakar kalori tanpa loncatan agar tidak berisik ke tetangga',
    durationMinutes: 7,
    caloriesBurnedEst: 70,
    intensity: 'Pemula',
    location: 'Rumah',
    targetMuscle: 'Full Body Low Impact',
    intervals: [
      { name: 'Slow Controlled Squat', durationSeconds: 30, isRest: false, instruction: 'Turun dalam 3 detik, naik dalam 1 detik tanpa hentakan.' },
      { name: 'Istirahat', durationSeconds: 10, isRest: true, instruction: 'Tarik napas lembut.' },
      { name: 'Reverse Lunges Tanpa Lompat', durationSeconds: 30, isRest: false, instruction: 'Mundur satu langkah perlahan, mendarat dengan ujung jari.' },
      { name: 'Istirahat', durationSeconds: 10, isRest: true, instruction: 'Atur napas.' },
      { name: 'Incline Push-up (Meja / Dinding)', durationSeconds: 30, isRest: false, instruction: 'Dorong dada kuat dan tenang.' },
      { name: 'Istirahat', durationSeconds: 10, isRest: true, instruction: 'Relakskan dada.' },
      { name: 'Bird Dog', durationSeconds: 30, isRest: false, instruction: 'Rentangkan tangan kanan dan kaki kiri lurus sejajar.' }
    ]
  },
  {
    id: 'prog-10',
    title: '15-Menit Upper Body & Arms Shred',
    subtitle: 'Membakar lemak lengan dan mengencangkan otot pundak & dada',
    durationMinutes: 15,
    caloriesBurnedEst: 145,
    intensity: 'Menengah',
    location: 'Rumah',
    targetMuscle: 'Bahu, Dada, Trisep',
    intervals: [
      { name: 'Diamond Push-ups (Trisep)', durationSeconds: 30, isRest: false, instruction: 'Satukan ibu jari dan telunjuk membentuk segitiga.' },
      { name: 'Istirahat', durationSeconds: 15, isRest: true, instruction: 'Goyangkan lengan.' },
      { name: 'Chair / Bench Triceps Dips', durationSeconds: 35, isRest: false, instruction: 'Turunkan siku 90 derajat di pinggir kursi stabil.' },
      { name: 'Istirahat', durationSeconds: 15, isRest: true, instruction: 'Tarik napas.' },
      { name: 'Shoulder Tap Plank', durationSeconds: 35, isRest: false, instruction: 'Tepuk bahu berlawanan tanpa menggoyangkan panggul.' },
      { name: 'Istirahat Akhir', durationSeconds: 20, isRest: true, instruction: 'Regangkan otot trisep.' }
    ]
  },
  {
    id: 'prog-11',
    title: '30-Menit Fat Burn Kickboxing Aerobik',
    subtitle: 'Kombinasi pukulan dan tendangan dinamis yang menyenangkan',
    durationMinutes: 30,
    caloriesBurnedEst: 310,
    intensity: 'Intens',
    location: 'Rumah',
    targetMuscle: 'Kardio, Pinggang & Refleks',
    intervals: [
      { name: 'Jab - Cross - Hook Combo', durationSeconds: 40, isRest: false, instruction: 'Pukulan lurus kiri, kanan, disusul kaitan hook tajam.' },
      { name: 'Istirahat Boxer Bounce', durationSeconds: 15, isRest: true, instruction: 'Lompat kecil di tempat seperti petinju.' },
      { name: 'Front Kick & Knee Strikes', durationSeconds: 40, isRest: false, instruction: 'Dorong tendangan depan disusul hentakan lutut tajam.' },
      { name: 'Istirahat Boxer Bounce', durationSeconds: 15, isRest: true, instruction: 'Atur ritme napas.' },
      { name: 'Bob and Weave + Uppercut', durationSeconds: 40, isRest: false, instruction: 'Menunduk hindari pukulan lalu sodok uppercut ke atas.' },
      { name: 'Pendinginan Rileks', durationSeconds: 30, isRest: true, instruction: 'Regangkan seluruh tubuh.' }
    ]
  },
  {
    id: 'prog-12',
    title: '45-Menit Stairmaster / Step Cardio Burn',
    subtitle: 'Simulasi mendaki tangga untuk membakar kalori terpadat',
    durationMinutes: 45,
    caloriesBurnedEst: 490,
    intensity: 'Intens',
    location: 'Gym',
    targetMuscle: 'Paha Depan, Betis, Jantung',
    intervals: [
      { name: 'Steady Climb (Level 5)', durationSeconds: 300, isRest: false, instruction: 'Langkah teratur satu demi satu, aktifkan otot paha.' },
      { name: 'Sprint Interval (Level 9)', durationSeconds: 90, isRest: false, instruction: 'Percepat ayunan langkah tangga, tetap fokus.' },
      { name: 'Recovery Climb (Level 4)', durationSeconds: 120, isRest: true, instruction: 'Jalan santai menormalkan detak jantung.' },
      { name: 'Skip-a-Step Climb (Level 6)', durationSeconds: 180, isRest: false, instruction: 'Langkahi dua anak tangga sekaligus untuk target bokong.' },
      { name: 'Final Power Climb (Level 8)', durationSeconds: 180, isRest: false, instruction: 'Hempaskan sisa tenaga sebelum pendinginan.' }
    ]
  }
];
