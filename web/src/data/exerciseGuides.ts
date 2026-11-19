export interface ExerciseGuide {
  id: string;
  name: string;
  nameEn: string;
  category: 'Dada' | 'Kaki' | 'Punggung' | 'Core' | 'Bahu' | 'Lengan' | 'Kardio & Lari' | 'Senam & Fleksibilitas' | 'Sepeda & Renang';
  difficulty: 'Pemula' | 'Menengah' | 'Lanjutan';
  primaryMuscles: string[];
  secondaryMuscles: string[];
  tempo: string; // e.g. "2-1-2" (2s eccentric, 1s isometric, 2s concentric)
  description: string;
  descriptionEn: string;
  setupSteps: string[];
  executionSteps: string[];
  commonMistakes: string[];
  proTips: string[];
  animationType: 'pushup' | 'squat' | 'plank' | 'pullup' | 'lunge' | 'bicep_curl' | 'running' | 'aerobics' | 'cycling' | 'swimming';
  videoUrl: string;
  posterUrl: string;
}

export const EXERCISE_GUIDES: ExerciseGuide[] = [
  {
    id: 'push-up',
    name: 'Push-Up Standar',
    nameEn: 'Standard Push-Up',
    category: 'Dada',
    difficulty: 'Pemula',
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['front_delts', 'abs', 'serratus'],
    tempo: '2-1-1',
    description: 'Gerakan pendorong horizontal fundamental untuk melatih dada, trisep, dan bahu depan dengan stabilitas inti tubuh lurus.',
    descriptionEn: 'Fundamental horizontal pressing movement building chest, triceps, and anterior deltoids with core stability.',
    setupSteps: [
      'Posisikan telapak tangan sedikit lebih lebar dari bahu di lantai sejajar dada.',
      'Luruskan kaki ke belakang, rapatkan tumit dan kencangkan otot perut (brace core).',
      'Bentuk garis lurus sempurna dari kepala hingga pergelangan kaki.',
      'Arahkan pandangan sedikit ke depan lantai untuk menjaga leher tetap netral.'
    ],
    executionSteps: [
      'Tarik napas dan turunkan tubuh secara terkontrol selama 2 detik.',
      'Arahkan siku ke belakang membentuk sudut 45 derajat (bukan melebar 90 derajat).',
      'Turun hingga dada berjarak 3-5 cm dari lantai, tahan 1 detik di posisi terbawah.',
      'Hembuskan napas kuat dan dorong lantai menjauh hingga lengan lurus kembali.'
    ],
    commonMistakes: [
      'Siku melebar 90 derajat ke samping yang memicu cedera sendi bahu.',
      'Pinggang melorot ke bawah karena otot perut tidak dikunci kencang.',
      'Pinggul terangkat terlalu tinggi menyerupai segitiga.'
    ],
    proTips: [
      'Bayangkan Anda sedang mencengkeram dan memutar lantai ke luar dengan telapak tangan.',
      'Gunakan incline push-up (tangan di bangku) jika belum kuat melakukan full push-up.'
    ],
    animationType: 'pushup',
    videoUrl: '/media/pushup.mp4',
    posterUrl: '/media/pushup-poster.jpg',
  },
  {
    id: 'pull-up',
    name: 'Pull-Up Vertikal',
    nameEn: 'Vertical Pull-Up',
    category: 'Punggung',
    difficulty: 'Lanjutan',
    primaryMuscles: ['lats', 'upper_back'],
    secondaryMuscles: ['biceps', 'forearms', 'abs'],
    tempo: '2-1-2',
    description: 'Raja latihan penarik tubuh bagian atas untuk melebarkan sayap punggung (lats), ketebalan rhomboid, dan bisep.',
    descriptionEn: 'The king of upper body vertical pulling movements targeting the latissimus dorsi, rhomboids, and biceps.',
    setupSteps: [
      'Genggam pull-up bar dengan telapak tangan menghadap ke depan (overhand grip), sedikit lebih lebar dari bahu.',
      'Gantungkan tubuh penuh (dead hang) dengan lengan lurus dan bahu rileks ke atas.',
      'Kencangkan otot perut dan silangkan kaki sedikit ke depan (hollow body).'
    ],
    executionSteps: [
      'Mulai gerakan dengan menarik bahu ke bawah dan ke belakang (depresi dan retraksi skapula).',
      'Tarik siku ke arah pinggang dan angkat dada menuju palang bar selama 2 detik.',
      'Tarik hingga dagu melewati palang secara bersih, tahan 1 detik di puncak kontraksi.',
      'Turunkan tubuh kembali ke posisi dead hang secara terkontrol selama 2 detik.'
    ],
    commonMistakes: [
      'Mengayunkan kaki atau pinggul (kipping) untuk mencuri momentum.',
      'Tidak merentangkan lengan hingga lurus penuh di bagian bawah (half rep).',
      'Bahu membungkuk ke depan di puncak gerakan.'
    ],
    proTips: [
      'Fokuslah mendorong siku ke bawah menuju lantai daripada sekadar menarik tangan Anda.',
      'Gunakan resistance band jika belum sanggup mengangkat beban tubuh sendiri.'
    ],
    animationType: 'pullup',
    videoUrl: '/media/pullup.mp4',
    posterUrl: '/media/pullup-poster.jpg',
  },
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight Squat',
    nameEn: 'Bodyweight Squat',
    category: 'Kaki',
    difficulty: 'Pemula',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves', 'abs'],
    tempo: '3-1-1',
    description: 'Pola gerakan fungsional dasar panggul dan lutut untuk kekuatan paha depan, bokong, dan stabilitas sendi pergelangan kaki.',
    descriptionEn: 'Fundamental lower body functional pattern for quadriceps and glute development with ankle mobility.',
    setupSteps: [
      'Berdiri tegak dengan kaki dibuka selebar bahu, jari kaki sedikit mengarah ke luar (15-30 derajat).',
      'Busungkan dada dan pandangan lurus ke depan, rentangkan tangan ke depan untuk keseimbangan.',
      'Kunci otot perut dan pastikan tumpuan kaki merata pada tumit dan pangkal jari kaki.'
    ],
    executionSteps: [
      'Mulai dengan mendorong panggul ke belakang sambil menekuk lutut seolah hendak duduk di kursi (hip hinge).',
      'Turunkan panggul selama 3 detik hingga paha minimal sejajar dengan lantai (parallel depth).',
      'Pastikan lutut bergerak searah dengan jari kaki dan tidak roboh ke dalam.',
      'Dorong kuat melalui seluruh telapak kaki untuk kembali berdiri tegak dalam 1 detik.'
    ],
    commonMistakes: [
      'Lutut roboh ke dalam (knee valgus) saat naik atau turun.',
      'Tumit terangkat dari lantai karena pergelangan kaki kaku.',
      'Kedalaman squat tidak sampai 90 derajat.'
    ],
    proTips: [
      'Dorong lutut ke luar secara aktif saat menurunkan tubuh untuk membuka ruang bagi panggul.',
      'Buang napas kuat saat mendorong tubuh kembali ke atas.'
    ],
    animationType: 'squat',
    videoUrl: '/media/squat.mp4',
    posterUrl: '/media/squat-poster.jpg',
  },
  {
    id: 'plank',
    name: 'Forearm Plank',
    nameEn: 'Forearm Plank',
    category: 'Core',
    difficulty: 'Pemula',
    primaryMuscles: ['abs', 'obliques'],
    secondaryMuscles: ['shoulders', 'glutes', 'quads'],
    tempo: 'Isometric',
    description: 'Latihan isometrik inti tubuh yang melatih ketahanan otot perut melintang dan stabilitas tulang belakang.',
    descriptionEn: 'Core isometric hold developing transverse abdominis endurance and spinal stability.',
    setupSteps: [
      'Posisikan lengan bawah di lantai dengan siku tepat di bawah bahu.',
      'Luruskan kedua kaki ke belakang dan bertumpu pada ujung jari kaki.',
      'Bentuk garis lurus kaku dari mahkota kepala hingga pergelangan kaki.'
    ],
    executionSteps: [
      'Kencangkan dinding perut seolah-olah siap menahan pukulan ringan.',
      'Kencangkan otot bokong (glutes) untuk menjaga panggul tetap netral.',
      'Dorong lantai dengan siku secara aktif agar punggung atas tidak amblas.',
      'Bernapas teratur tanpa menahan napas selama durasi waktu latihan.'
    ],
    commonMistakes: [
      'Pinggang melorot ke bawah yang memberi tekanan berlebih pada sendi lumbal.',
      'Bokong terangkat terlalu tinggi menyerupai segitiga.',
      'Menahan napas saat menahan posisi.'
    ],
    proTips: [
      'Tarik siku ke arah jari kaki secara isometrik tanpa benar-benar bergerak untuk melipatgandakan aktivasi perut.',
      'Kualitas form 30 detik jauh lebih efektif daripada 2 menit dengan form yang melorot.'
    ],
    animationType: 'plank',
    videoUrl: '/media/plank.mp4',
    posterUrl: '/media/plank-poster.jpg',
  },
  {
    id: 'walking-lunge',
    name: 'Forward Lunge',
    nameEn: 'Forward Lunge',
    category: 'Kaki',
    difficulty: 'Pemula',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves', 'abs'],
    tempo: '2-1-1',
    description: 'Latihan unilateral kaki yang memperbaiki ketidakseimbangan kekuatan paha kiri dan kanan.',
    descriptionEn: 'Unilateral lower body exercise resolving strength imbalances and athletic stability.',
    setupSteps: [
      'Berdiri tegak dengan kaki rapat dan tangan di pinggang.',
      'Busungkan dada dan tegakkan torso tubuh bagian atas.'
    ],
    executionSteps: [
      'Melangkahlah ke depan sekitar 60-90 cm dengan satu kaki.',
      'Turunkan panggul hingga lutut depan membentuk sudut 90 derajat dan lutut belakang hampir menyentuh lantai.',
      'Jaga torso tetap tegak lurus lantai.',
      'Dorong kuat melalui tumit kaki depan untuk kembali ke posisi awal.'
    ],
    commonMistakes: [
      'Langkah terlalu pendek sehingga lutut depan tertekan tajam ke depan.',
      'Badan membungkuk ke depan sehingga menghilangkan beban dari panggul.'
    ],
    proTips: [
      'Pertahankan torso tetap tegak lurus lantai untuk pembagian beban glutes dan quads yang merata.'
    ],
    animationType: 'lunge',
    videoUrl: '/media/lunge.mp4',
    posterUrl: '/media/lunge-poster.jpg',
  },
  {
    id: 'dumbbell-curl',
    name: 'Bicep Curl Terkontrol',
    nameEn: 'Strict Bicep Curl',
    category: 'Lengan',
    difficulty: 'Pemula',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    tempo: '2-1-2',
    description: 'Gerakan isolasi lengan depan untuk membangun ketebalan dan kekuatan bisep murni.',
    descriptionEn: 'Isolation exercise targeting biceps brachii with strict elbow hinge mechanics.',
    setupSteps: [
      'Berdiri tegak memegang dumbbell atau beban di samping paha, telapak menghadap ke depan.',
      'Kunci kedua siku tepat di samping pinggang tubuh.'
    ],
    executionSteps: [
      'Tekuk sendi siku dan angkat beban ke arah bahu selama 2 detik tanpa mengayunkan punggung.',
      'Peras otot bisep di titik puncak selama 1 detik penuh.',
      'Turunkan beban kembali ke posisi awal secara perlahan selama 2 detik.'
    ],
    commonMistakes: [
      'Mengayunkan punggung bawah ke belakang untuk melempar beban (cheating momentum).',
      'Siku maju ke depan menjauhi tubuh.'
    ],
    proTips: [
      'Kunci siku di samping torso agar tegangan tidak berpindah ke bahu depan.'
    ],
    animationType: 'bicep_curl',
    videoUrl: '/media/bicep_curl.mp4',
    posterUrl: '/media/bicep_curl-poster.jpg',
  },
  {
    id: 'running-form',
    name: 'Teknik Lari Biomekanik',
    nameEn: 'Running Biomechanics & Form',
    category: 'Kardio & Lari',
    difficulty: 'Menengah',
    primaryMuscles: ['quads', 'calves', 'glutes'],
    secondaryMuscles: ['hamstrings', 'abs', 'hip_flexors'],
    tempo: '180 SPM Cadence',
    description: 'Panduan teknik lari efisien energi dengan tumpuan midfoot, postur tegak condong dari engsel pergelangan kaki, dan irama langkah stabil.',
    descriptionEn: 'High-efficiency running form focusing on midfoot landing, ankle lean, and 180 SPM cadence.',
    setupSteps: [
      'Berdiri tegak santai, tarik bahu ke belakang dan turunkan (hindari bahu tegang mendekati telinga).',
      'Condongkan seluruh tubuh lurus ke depan dari pergelangan kaki (bukan membungkuk di pinggang).',
      'Tekuk siku membentuk sudut 90 derajat dan biarkan telapak tangan rileks seperti menggenggam telur.'
    ],
    executionSteps: [
      'Langkahkan kaki dengan tumpuan tepat di bawah pusat gravitasi tubuh (midfoot strike).',
      'Pertahankan irama langkah (cadence) di kisaran 170-180 langkah per menit (SPM).',
      'Ayunkank lengan ke depan dan ke belakang sejajar lintasan lari (bukan menyilang dada).',
      'Angkat lutut ke depan dan dorong ke belakang dengan tarikan tumit singkat ke arah pantat.'
    ],
    commonMistakes: [
      'Overstriding: melangkah terlalu jauh ke depan sehingga tumit mendarat kaku seperti mengerem laju.',
      'Membungkuk di pinggang yang membatasi kapasitas ekspansi paru-paru.',
      'Menggenggam tangan terlalu kencang sehingga otot leher dan bahu cepat kram.'
    ],
    proTips: [
      'Fokus pada frekuensi langkah cepat dan ringan daripada melompat jauh di udara.',
      'Tarik napas berirama 3 langkah tarik dan 2 langkah buang untuk mencegah stitches (sakit perut samping).'
    ],
    animationType: 'running',
    videoUrl: '/media/running.mp4',
    posterUrl: '/media/running-poster.jpg',
  },
  {
    id: 'aerobic-gymnastics',
    name: 'Senam Aerobik & Mobilitas',
    nameEn: 'Aerobic Gymnastics & Mobility',
    category: 'Senam & Fleksibilitas',
    difficulty: 'Pemula',
    primaryMuscles: ['abs', 'glutes', 'quads'],
    secondaryMuscles: ['shoulders', 'calves', 'upper_back'],
    tempo: 'Rhythm Flow',
    description: 'Rangkaian senam fungsional dan peregangan dinamis untuk melancarkan sirkulasi darah, sendi panggul, dan fleksibilitas torso.',
    descriptionEn: 'Functional aerobic gymnastics and dynamic mobility for blood circulation and joint range of motion.',
    setupSteps: [
      'Berdiri di area lapang dengan ruang gerak 2x2 meter.',
      'Buka kaki selebar pinggul dan lemaskan seluruh persendian.',
      'Atur pernapasan dalam melalui hidung dan buang perlahan lewat mulut.'
    ],
    executionSteps: [
      'Awali dengan step touch ke kanan dan kiri sambil mengayunkan kedua lengan harmonis.',
      'Lakukan rotasi torso dinamis untuk membuka mobilitas tulang belakang bagian toraks.',
      'Lakukan arm circles lebar untuk melumasi kapsul sendi bahu.',
      'Kombinasikan dengan squat peregangan ringan dan breathing cycle teratur.'
    ],
    commonMistakes: [
      'Mengunci sendi lutut kaku saat melangkah.',
      'Menahan napas saat perpindahan gerakan.',
      'Melakukan gerakan menyentak tanpa pemanasan awal.'
    ],
    proTips: [
      'Gunakan irama musik berketukan 120-130 BPM untuk menjaga tempo senam tetap konstan.',
      'Cocok dilakukan saat transisi istirahat aktif latihan beban untuk mempercepat pemulihan laktat.'
    ],
    animationType: 'aerobics',
    videoUrl: '/media/aerobics.mp4',
    posterUrl: '/media/aerobics-poster.jpg',
  },
  {
    id: 'cycling-efficiency',
    name: 'Bersepeda Ergonomis',
    nameEn: 'Ergonomic Cycling & Cadence',
    category: 'Sepeda & Renang',
    difficulty: 'Pemula',
    primaryMuscles: ['quads', 'glutes', 'hamstrings'],
    secondaryMuscles: ['calves', 'abs', 'lower_back'],
    tempo: '85-95 RPM',
    description: 'Postur sadel dan kayuhan lingkaran 360 derajat untuk tenaga maksimal tanpa nyeri lutut atau pinggang.',
    descriptionEn: 'Optimal saddle fit and 360-degree pedal stroke circular efficiency.',
    setupSteps: [
      'Sesuaikan tinggi sadel sehingga lutut menekuk 25-35 derajat saat pedal berada di titik terendah (titik jam 6).',
      'Posisikan bola telapak kaki tepat di atas as pedal sepeda.',
      'Pegang handlebar dengan siku sedikit tertekuk lemas (jangan terkunci lurus).'
    ],
    executionSteps: [
      'Kayuh pedal dalam lingkaran penuh: dorong ke bawah (jam 1-5), kikis ke belakang (jam 5-7), dan angkat ringan (jam 8-11).',
      'Jaga putaran kayuhan (cadence) stabil pada kisaran 85-95 rotasi per menit (RPM).',
      'Gunakan gigi (gear) ringan dengan putaran cepat daripada gigi berat yang membebani sendi lutut.',
      'Rilekskan leher dan variasikan posisi pegangan tangan tiap 15 menit.'
    ],
    commonMistakes: [
      'Sadel terlalu rendah sehingga lutut tertekuk tajam dan memicu nyeri tempurung lutut (patella).',
      'Menginjak pedal dengan tumit bukan bola kaki.',
      'Mengayuh dengan lutut melebar keluar menyerupai katak.'
    ],
    proTips: [
      'Fokus pada putaran kayuhan yang mulus menyerupai menyeka lumpur dari bawah sepatu.',
      'Minum seteguk air setiap 15-20 menit bersepeda.'
    ],
    animationType: 'cycling',
    videoUrl: '/media/cycling.mp4',
    posterUrl: '/media/cycling-poster.jpg',
  },
  {
    id: 'freestyle-swimming',
    name: 'Renang Gaya Bebas',
    nameEn: 'Freestyle Swimming & Catch',
    category: 'Sepeda & Renang',
    difficulty: 'Menengah',
    primaryMuscles: ['lats', 'shoulders'],
    secondaryMuscles: ['abs', 'glutes', 'triceps'],
    tempo: 'Streamline Stroke',
    description: 'Teknik renang gaya bebas dengan tarikan high-elbow catch, streamline horizontal minim hambatan air, dan rotasi pernapasan bilateral.',
    descriptionEn: 'Efficient freestyle swimming with high-elbow catch, hydro-streamline glide, and bilateral breathing.',
    setupSteps: [
      'Posisikan tubuh horizontal sejajar permukaan air (streamline body).',
      'Arahkan pandangan ke dasar kolam agar kepala tidak mendongak ke atas.',
      'Kunci otot perut dan bokong agar kaki tidak tenggelam terseret arus.'
    ],
    executionSteps: [
      'Jangkaukan tangan ke depan lurus dan masuk ke air dengan ujung jari terlebih dahulu.',
      'Lakukan high-elbow catch: tekuk siku dan tarik air ke belakang menggunakan lengan bawah seperti dayung.',
      'Putar tubuh (body roll) 45 derajat dari panggul saat melakukan tarikan lengan.',
      'Tolehkan kepala sedikit ke samping saat tubuh berputar untuk mengambil satu napas cepat, lalu hembuskan dalam air.'
    ],
    commonMistakes: [
      'Kepala mendongak ke depan yang menyebabkan panggul dan kaki langsung tenggelam.',
      'Siku melorot (dropped elbow) saat menarik air sehingga daya dorong berkurang drastis.',
      'Menendang kaki dari lutut menyerupai bersepeda alih-alih dari sendi panggul.'
    ],
    proTips: [
      'Kekuatan tendangan renang berasal dari panggul dengan pergelangan kaki yang lemas lentur.',
      'Hembuskan napas secara kontinu dan halus di dalam air agar paru-paru siap menghirup udara baru saat menoleh.'
    ],
    animationType: 'swimming',
    videoUrl: '/media/swimming.mp4',
    posterUrl: '/media/swimming-poster.jpg',
  }
];
