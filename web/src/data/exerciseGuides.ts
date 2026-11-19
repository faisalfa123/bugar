export interface ExerciseGuide {
  id: string;
  name: string;
  nameEn: string;
  category: 'Dada' | 'Kaki' | 'Punggung' | 'Core' | 'Bahu' | 'Lengan';
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
  animationType: 'pushup' | 'squat' | 'plank' | 'pullup' | 'lunge' | 'bicep_curl';
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
    description: 'Gerakan pendorong horizontal fundamental untuk melatih dada, trisep, dan bahu depan dengan stabilitas inti tubuh.',
    descriptionEn: 'Fundamental horizontal pressing movement building chest, triceps, and anterior deltoids with core stability.',
    setupSteps: [
      'Posisikan telapak tangan sedikit lebih lebar dari bahu di lantai sejajar dada.',
      'Luruskan kaki ke belakang, rapatkan tumit dan kencangkan otot perut (brace core).',
      'Bentuk garis lurus sempurna dari kepala hingga pergelangan kaki.',
      'Arahkan pandangan sedikit ke depan lantai untuk menjaga leher tetap netral.'
    ],
    executionSteps: [
      'Tarik napas dan turunkan tubuh secara terkontrol selama 2 detik.',
      'Arahkan siku ke belakang membentuk sudut 45 derajat (bukan melebar 90 derajat menyerupai T).',
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
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-push-ups-in-a-gym-42686-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
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
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-in-a-crossfit-gym-42691-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80',
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
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-exercising-doing-squats-42681-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
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
      'Menahan napas.'
    ],
    proTips: [
      'Tarik siku ke arah jari kaki secara isometrik tanpa benar-benar bergerak untuk melipatgandakan aktivasi perut.',
      'Kualitas form 30 detik jauh lebih efektif daripada 2 menit dengan form yang melorot.'
    ],
    animationType: 'plank',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-plank-exercise-in-gym-42689-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=600&q=80',
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
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-doing-lunges-in-gym-42683-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
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
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-biceps-with-dumbbells-42684-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
  }
];
