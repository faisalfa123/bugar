export interface ExerciseGuide {
  id: string;
  name: string;
  category: 'Dada' | 'Kaki' | 'Punggung' | 'Core' | 'Bahu' | 'Lengan';
  difficulty: 'Pemula' | 'Menengah' | 'Lanjutan';
  primaryMuscles: string[];
  secondaryMuscles: string[];
  tempo: string; // e.g. "2-1-2" (2s eccentric, 1s isometric, 2s concentric)
  description: string;
  setupSteps: string[];
  executionSteps: string[];
  commonMistakes: string[];
  proTips: string[];
  // Animation configuration for Canvas 2D rendering
  animationType: 'pushup' | 'squat' | 'plank' | 'pullup' | 'lunge' | 'bicep_curl';
}

export const EXERCISE_GUIDES: ExerciseGuide[] = [
  {
    id: 'push-up',
    name: 'Push-Up Standar',
    category: 'Dada',
    difficulty: 'Pemula',
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['front_delts', 'abs', 'serratus'],
    tempo: '2-1-1',
    description: 'Gerakan pendorong horizontal fundamental tubuh bagian atas untuk membangun dada, bahu depan, dan trisep dengan stabilisasi inti tubuh.',
    setupSteps: [
      'Posisikan telapak tangan sedikit lebih lebar dari bahu, jari menghadap ke depan atau sedikit keluar.',
      'Luruskan kaki ke belakang dengan jari kaki menopang di lantai. Rapatkan tumit.',
      'Kencangkan bokong dan perut (brace core) sehingga tubuh membentuk garis lurus sempurna dari kepala hingga tumit.',
      'Pertahankan pandangan mata sedikit ke depan lantai (sekitar 30 cm) untuk menjaga leher tetap netral.'
    ],
    executionSteps: [
      'Tarik napas dan turunkan tubuh secara terkontrol selama 2 detik dengan menekuk siku ke arah belakang (membentuk sudut 45 derajat terhadap tubuh, bukan melebar 90 derajat).',
      'Turunkan dada hingga berada sekitar 3-5 cm di atas lantai, tahan 1 detik di posisi terbawah.',
      'Hembuskan napas kuat dan dorong lantai menjauh selama 1 detik hingga lengan lurus kembali tanpa mengunci sendi siku secara berlebihan.'
    ],
    commonMistakes: [
      'Siku melebar 90 derajat menyerupai huruf T (meningkatkan risiko cedera sendi bahu / impingement).',
      'Punggung melengkung ke bawah (anterior pelvic tilt) karena core tidak diaktifkan.',
      'Pinggul terangkat terlalu tinggi menyerupai segitiga (mengurangi beban pada otot dada).',
      'Hanya menggerakkan kepala naik turun tanpa menurunkan torso dada (range of motion palsu).'
    ],
    proTips: [
      'Bayangkan Anda sedang memutar lantai ke luar menggunakan telapak tangan untuk mengunci rotasi eksternal bahu.',
      'Jika belum kuat melakukan full push-up, gunakan incline push-up (tangan di bangku) daripada push-up lutut agar mekanika core tetap sama.'
    ],
    animationType: 'pushup'
  },
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight Squat',
    category: 'Kaki',
    difficulty: 'Pemula',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves', 'abs'],
    tempo: '3-1-1',
    description: 'Pola gerakan dasar panggul dan lutut untuk melatih kekuatan fungsional paha depan, bokong, dan paha belakang dengan mobilitas pergelangan kaki.',
    setupSteps: [
      'Berdiri tegak dengan kaki dibuka selebar bahu, jari kaki sedikit mengarah ke luar (15-30 derajat).',
      'Buka dada dan pandangan lurus ke depan, rentangkan tangan ke depan untuk menjaga keseimbangan.',
      'Kunci otot perut dan pastikan tumpuan berat badan merata di tiga titik kaki (tumit, jempol, dan kelingking).'
    ],
    executionSteps: [
      'Mulai gerakan dengan mendorong pinggul ke belakang sambil menekuk lutut seolah hendak duduk di kursi (hinge and squat).',
      'Turun selama 3 detik hingga lipatan paha minimal sejajar dengan bagian atas tempurung lutut (parallel depth).',
      'Jaga agar kedua lutut tetap sejajar dengan arah jari kaki (tidak goyang ke dalam).',
      'Tahan 1 detik di dasar, lalu dorong lantai melalui tumit dan tengah telapak kaki untuk kembali berdiri tegak dalam 1 detik.'
    ],
    commonMistakes: [
      'Lutut roboh ke dalam (knee valgus) saat naik atau turun.',
      'Tumit terangkat dari lantai karena kurangnya kelenturan pergelangan kaki (dorsiflexion).',
      'Punggung bawah membulat (butt wink) saat mencapai titik terendah.',
      'Kedalaman squat tidak sampai 90 derajat (quarter rep squat).'
    ],
    proTips: [
      'Dorong lutut ke luar secara aktif saat menurunkan tubuh untuk memberi ruang bagi panggul.',
      'Bernapaslah di puncak gerakan, tahan saat turun, dan buang napas kuat saat mendorong naik.'
    ],
    animationType: 'squat'
  },
  {
    id: 'plank',
    name: 'Forearm Plank',
    category: 'Core',
    difficulty: 'Pemula',
    primaryMuscles: ['abs', 'obliques'],
    secondaryMuscles: ['shoulders', 'glutes', 'quads'],
    tempo: 'Isometric',
    description: 'Latihan isometrik inti tubuh yang melatih ketahanan otot perut melintang (transverse abdominis), punggung bawah, dan stabilitas korset panggul.',
    setupSteps: [
      'Posisikan lengan bawah di lantai dengan siku tepat di bawah bahu, lengan sejajar satu sama lain.',
      'Luruskan kedua kaki ke belakang dan bertumpu pada ujung jari kaki.',
      'Bentuk garis lurus kaku dari mahkota kepala, punggung, panggul, hingga pergelangan kaki.'
    ],
    executionSteps: [
      'Kencangkan dinding perut seolah-olah Anda siap menahan pukulan ringan di perut.',
      'Kencangkan otot bokong (glutes) untuk memutar panggul ke posisi netral (posterior pelvic tilt).',
      'Dorong lantai dengan siku secara aktif sehingga tulang belikat terpisah dan punggung atas tidak amblas (scapular protraction).',
      'Bernapas secara ritmis dan stabil tanpa menahan napas selama durasi waktu yang ditargetkan.'
    ],
    commonMistakes: [
      'Pinggang melorot ke bawah sehingga memberi tekanan berlebih pada sendi lumbal punggung bawah.',
      'Bokong terangkat terlalu tinggi menyerupai huruf V terbalik.',
      'Menundukkan kepala atau mendongak ke atas secara berlebihan.',
      'Menahan napas (dapat meningkatkan tekanan darah secara tiba-tiba).'
    ],
    proTips: [
      'Tarik siku ke arah jari kaki secara isometrik (tanpa benar-benar bergerak) untuk melipatgandakan aktivasi otot perut.',
      'Kualitas form 30 detik jauh lebih efektif daripada 2 menit dengan form yang melorot.'
    ],
    animationType: 'plank'
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    category: 'Punggung',
    difficulty: 'Lanjutan',
    primaryMuscles: ['lats', 'upper_back'],
    secondaryMuscles: ['biceps', 'forearms', 'abs'],
    tempo: '2-1-2',
    description: 'Raja gerakan penarik vertikal untuk memperlebar sayap punggung (latissimus dorsi), bisep, dan kekuatan cengkeraman tangan.',
    setupSteps: [
      'Genggam pull-up bar dengan telapak tangan menghadap ke depan (pronasi), sedikit lebih lebar dari bahu.',
      'Gantungkan tubuh secara penuh (dead hang) dengan lengan lurus dan bahu rileks ke atas.',
      'Rapatkan kaki dan sedikit condongkan kaki ke depan (posisi hollow body) untuk mengaktifkan core.'
    ],
    executionSteps: [
      'Tarik bahu ke bawah dan ke belakang terlebih dahulu (depresi skapula) untuk mengaktifkan otot sayap punggung.',
      'Tarik siku ke arah pinggang sambil mengarahkan dada ke arah bar selama 2 detik.',
      'Tarik terus hingga dagu melewati palang bar, tahan selama 1 detik di puncak kontraksi.',
      'Turunkan tubuh kembali ke posisi dead hang secara terkontrol selama 2 detik penuh.'
    ],
    commonMistakes: [
      'Mengayunkan kaki atau pinggul (kipping) untuk mendapatkan momentum bantuan.',
      'Tidak menurunkan tubuh hingga lengan lurus penuh (half rep / cut range).',
      'Bahu membungkuk ke depan di puncak gerakan yang menandakan kelemahan skapula.'
    ],
    proTips: [
      'Fokuslah pada menarik siku ke lantai di samping pinggang, bukan sekadar memikirkan menarik tangan Anda.',
      'Gunakan resistance band jika belum sanggup melakukan repetisi pull-up penuh secara mandiri.'
    ],
    animationType: 'pullup'
  },
  {
    id: 'walking-lunge',
    name: 'Forward Lunge',
    category: 'Kaki',
    difficulty: 'Pemula',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves', 'abs'],
    tempo: '2-1-1',
    description: 'Latihan unilateral kaki yang memperbaiki ketidakseimbangan kekuatan antara paha kiri dan kanan serta meningkatkan keseimbangan atletik.',
    setupSteps: [
      'Berdiri tegak dengan kaki rapat dan tangan di pinggang atau di depan dada.',
      'Buka dada dan tegakkan tubuh bagian atas.'
    ],
    executionSteps: [
      'Melangkahlah ke depan sekitar 60-90 cm dengan kaki kanan.',
      'Turunkan panggul hingga lutut kanan di depan membentuk sudut 90 derajat dan lutut kiri di belakang hampir menyentuh lantai (sekitar 2 cm di atas tanah).',
      'Pastikan lutut kanan tetap berada di atas pergelangan kaki dan tidak meleset jauh melewati jari kaki.',
      'Dorong kuat melalui tumit kaki depan untuk kembali ke posisi berdiri awal.'
    ],
    commonMistakes: [
      'Langkah terlalu pendek sehingga lutut depan tertekan tajam ke depan.',
      'Badan terlalu condong ke depan sehingga beban berpindah dari otot paha ke sendi lutut.',
      'Lutut kaki depan miring ke dalam saat menahan beban.'
    ],
    proTips: [
      'Pertahankan torso tetap tegak lurus lantai untuk memaksimalkan aktivasi glutes dan quads secara seimbang.',
      'Lakukan secara bergantian kaki kiri dan kanan secara konsisten.'
    ],
    animationType: 'lunge'
  },
  {
    id: 'dumbbell-curl',
    name: 'Bicep Curl Terkontrol',
    category: 'Lengan',
    difficulty: 'Pemula',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    tempo: '2-1-2',
    description: 'Gerakan isolasi lengan depan untuk membangun ketebalan dan kekuatan bisep dengan isolasi sendi siku murni.',
    setupSteps: [
      'Berdiri tegak memegang dumbbell atau botol beban di kedua tangan di samping paha, telapak menghadap ke depan.',
      'Kunci kedua siku tepat di samping pinggang dan jangan biarkan siku maju saat mengangkat.'
    ],
    executionSteps: [
      'Tekuk siku dan angkat beban ke arah bahu selama 2 detik tanpa mengayunkan punggung.',
      'Peras bisep di titik puncak selama 1 detik penuh.',
      'Turunkan beban kembali ke posisi awal secara perlahan dan terkontrol selama 2 detik.'
    ],
    commonMistakes: [
      'Mengayunkan punggung bawah ke belakang untuk melempar beban (momentum cheating).',
      'Siku maju ke depan menjauhi tubuh (mengurangi tegangan pada bisep dan memindahkan beban ke bahu depan).'
    ],
    proTips: [
      'Jika beban terlalu berat hingga Anda harus mengayunkan tubuh, segera turunkan beban demi menjaga form dan mencegah cedera siku.'
    ],
    animationType: 'bicep_curl'
  }
];
