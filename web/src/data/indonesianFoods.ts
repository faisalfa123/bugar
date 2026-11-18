import { FoodItem } from '../types';

export const INDONESIAN_FOODS: FoodItem[] = [
  // Karbohidrat & Pokok
  { id: 'id-01', name: 'Nasi Putih Matang', category: 'Karbohidrat', serving_size: '100g (1 centong)', calories: 130, protein_g: 2.7, carbs_g: 28.2, fat_g: 0.3 },
  { id: 'id-02', name: 'Nasi Merah Organik', category: 'Karbohidrat', serving_size: '100g (1 centong)', calories: 111, protein_g: 2.6, carbs_g: 23.0, fat_g: 0.9 },
  { id: 'id-03', name: 'Lontong / Ketupat', category: 'Karbohidrat', serving_size: '100g (1 buah)', calories: 144, protein_g: 2.4, carbs_g: 31.8, fat_g: 0.2 },
  { id: 'id-04', name: 'Kentang Rebus', category: 'Karbohidrat', serving_size: '150g (1 buah sedang)', calories: 130, protein_g: 3.0, carbs_g: 30.0, fat_g: 0.2 },
  { id: 'id-05', name: 'Ubi Jalar Cilembu Rebus', category: 'Karbohidrat', serving_size: '100g', calories: 90, protein_g: 1.6, carbs_g: 20.7, fat_g: 0.1 },
  { id: 'id-06', name: 'Singkong Rebus', category: 'Karbohidrat', serving_size: '100g', calories: 160, protein_g: 1.4, carbs_g: 38.0, fat_g: 0.3 },
  { id: 'id-07', name: 'Oatmeal Matang', category: 'Karbohidrat', serving_size: '150g (1 mangkuk)', calories: 120, protein_g: 4.5, carbs_g: 21.0, fat_g: 2.2 },

  // Unggas & Daging
  { id: 'id-08', name: 'Dada Ayam Bakar / Grill', category: 'Protein', serving_size: '150g', calories: 247, protein_g: 46.0, carbs_g: 0.0, fat_g: 5.4 },
  { id: 'id-09', name: 'Dada Ayam Rebus (Suwir)', category: 'Protein', serving_size: '100g', calories: 165, protein_g: 31.0, carbs_g: 0.0, fat_g: 3.6 },
  { id: 'id-10', name: 'Paha Ayam Bakar (Tanpa Kulit)', category: 'Protein', serving_size: '100g', calories: 175, protein_g: 24.0, carbs_g: 0.0, fat_g: 8.5 },
  { id: 'id-11', name: 'Ayam Goreng Lengkuas', category: 'Protein', serving_size: '1 potong (100g)', calories: 260, protein_g: 25.0, carbs_g: 4.0, fat_g: 16.0 },
  { id: 'id-12', name: 'Rendang Daging Sapi', category: 'Protein', serving_size: '1 potong (80g)', calories: 215, protein_g: 18.5, carbs_g: 5.2, fat_g: 14.0 },
  { id: 'id-13', name: 'Empal Daging Sapi Manis', category: 'Protein', serving_size: '1 potong (75g)', calories: 190, protein_g: 20.0, carbs_g: 6.0, fat_g: 9.5 },
  { id: 'id-14', name: 'Daging Sapi Panggang / Steak Tipis', category: 'Protein', serving_size: '100g', calories: 210, protein_g: 26.0, carbs_g: 0.0, fat_g: 11.0 },

  // Telur & Seafood
  { id: 'id-15', name: 'Telur Ayam Rebus', category: 'Protein', serving_size: '1 butir (50g)', calories: 78, protein_g: 6.3, carbs_g: 0.6, fat_g: 5.3 },
  { id: 'id-16', name: 'Telur Dadar / Omelet (Sedikit Minyak)', category: 'Protein', serving_size: '1 butir (60g)', calories: 110, protein_g: 7.0, carbs_g: 1.0, fat_g: 8.5 },
  { id: 'id-17', name: 'Telur Balado', category: 'Protein', serving_size: '1 butir (60g)', calories: 125, protein_g: 6.5, carbs_g: 4.0, fat_g: 9.0 },
  { id: 'id-18', name: 'Ikan Nila Bakar Bumbu Kuning', category: 'Protein', serving_size: '1 ekor (150g)', calories: 195, protein_g: 39.0, carbs_g: 1.5, fat_g: 4.2 },
  { id: 'id-19', name: 'Ikan Kembung Goreng', category: 'Protein', serving_size: '1 ekor (100g)', calories: 180, protein_g: 22.0, carbs_g: 0.0, fat_g: 9.8 },
  { id: 'id-20', name: 'Ikan Tongkol Balado', category: 'Protein', serving_size: '1 potong (80g)', calories: 155, protein_g: 21.0, carbs_g: 3.0, fat_g: 6.5 },
  { id: 'id-21', name: 'Udang Rebus Jeruk Nipis', category: 'Protein', serving_size: '100g', calories: 99, protein_g: 24.0, carbs_g: 0.2, fat_g: 0.3 },

  // Kedelai / Tahu & Tempe (Superfood Indonesia)
  { id: 'id-22', name: 'Tempe Bacem Panggang', category: 'Nabati', serving_size: '2 potong (100g)', calories: 160, protein_g: 14.0, carbs_g: 12.0, fat_g: 6.0 },
  { id: 'id-23', name: 'Tempe Goreng Tepung', category: 'Nabati', serving_size: '2 potong (80g)', calories: 200, protein_g: 10.0, carbs_g: 14.0, fat_g: 12.0 },
  { id: 'id-24', name: 'Tempe Orek Kering', category: 'Nabati', serving_size: '50g (3 sdm)', calories: 135, protein_g: 8.5, carbs_g: 11.0, fat_g: 6.2 },
  { id: 'id-25', name: 'Tahu Kukus Putih', category: 'Nabati', serving_size: '2 potong (150g)', calories: 114, protein_g: 12.0, carbs_g: 2.8, fat_g: 6.5 },
  { id: 'id-26', name: 'Tahu Goreng Kuning', category: 'Nabati', serving_size: '2 potong (100g)', calories: 145, protein_g: 10.0, carbs_g: 3.5, fat_g: 10.5 },
  { id: 'id-27', name: 'Tahu Bacem', category: 'Nabati', serving_size: '2 potong (120g)', calories: 138, protein_g: 9.5, carbs_g: 10.0, fat_g: 6.0 },

  // Sayuran & Masakan Kuah
  { id: 'id-28', name: 'Sayur Bening Bayam Jagung', category: 'Sayuran', serving_size: '1 mangkuk (150g)', calories: 65, protein_g: 2.5, carbs_g: 13.0, fat_g: 0.5 },
  { id: 'id-29', name: 'Sayur Asem Jakarta', category: 'Sayuran', serving_size: '1 mangkuk (200g)', calories: 88, protein_g: 3.0, carbs_g: 16.0, fat_g: 1.5 },
  { id: 'id-30', name: 'Tumis Kangkung Terasi', category: 'Sayuran', serving_size: '1 porsi (120g)', calories: 95, protein_g: 3.2, carbs_g: 6.0, fat_g: 6.5 },
  { id: 'id-31', name: 'Sop Ayam Bening (Wortel & Kentang)', category: 'Sayuran', serving_size: '1 mangkuk (250g)', calories: 145, protein_g: 12.0, carbs_g: 11.0, fat_g: 4.5 },
  { id: 'id-32', name: 'Gado-gado Komplit (Bumbu Sedang)', category: 'Sayuran', serving_size: '1 porsi (250g)', calories: 295, protein_g: 13.5, carbs_g: 32.0, fat_g: 13.0 },
  { id: 'id-33', name: 'Pecel Sayur Madiun (Bumbu Pisah)', category: 'Sayuran', serving_size: '1 porsi (200g)', calories: 190, protein_g: 8.0, carbs_g: 24.0, fat_g: 7.5 },
  { id: 'id-34', name: 'Capcay Kuah Seafood', category: 'Sayuran', serving_size: '1 porsi (200g)', calories: 135, protein_g: 11.0, carbs_g: 12.0, fat_g: 4.0 },

  // Hidangan Nusantara Populer
  { id: 'id-35', name: 'Sate Ayam Madura (Daging Saja, 5 tusuk)', category: 'Hidangan', serving_size: '5 tusuk (100g)', calories: 185, protein_g: 22.0, carbs_g: 6.0, fat_g: 7.5 },
  { id: 'id-36', name: 'Soto Ayam Lamongan (Tanpa Koya)', category: 'Hidangan', serving_size: '1 porsi (300g)', calories: 220, protein_g: 19.0, carbs_g: 14.0, fat_g: 8.5 },
  { id: 'id-37', name: 'Bakso Sapi Kuah Bening (5 butir)', category: 'Hidangan', serving_size: '5 butir (150g)', calories: 240, protein_g: 16.0, carbs_g: 18.0, fat_g: 10.5 },
  { id: 'id-38', name: 'Nasi Goreng Kampung (Minyak Standar)', category: 'Hidangan', serving_size: '1 porsi (200g)', calories: 360, protein_g: 9.0, carbs_g: 52.0, fat_g: 12.5 },
  { id: 'id-39', name: 'Rawon Daging Sapi Khas Jawa Timur', category: 'Hidangan', serving_size: '1 porsi (250g)', calories: 275, protein_g: 21.0, carbs_g: 8.0, fat_g: 16.0 },

  // Buah-buahan
  { id: 'id-40', name: 'Pisang Cavendish / Ambon', category: 'Buah', serving_size: '1 buah sedang (118g)', calories: 105, protein_g: 1.3, carbs_g: 27.0, fat_g: 0.3 },
  { id: 'id-41', name: 'Pepaya Potong Segar', category: 'Buah', serving_size: '150g (1 mangkuk)', calories: 60, protein_g: 0.8, carbs_g: 15.0, fat_g: 0.2 },
  { id: 'id-42', name: 'Apel Fuji Merah', category: 'Buah', serving_size: '1 buah sedang (150g)', calories: 78, protein_g: 0.4, carbs_g: 20.5, fat_g: 0.2 },
  { id: 'id-43', name: 'Alpukat Mentega Matang', category: 'Buah', serving_size: '1/2 buah (100g)', calories: 160, protein_g: 2.0, carbs_g: 8.5, fat_g: 14.7 },
  { id: 'id-44', name: 'Semangka Merah Potong', category: 'Buah', serving_size: '200g (1 mangkuk)', calories: 60, protein_g: 1.2, carbs_g: 15.0, fat_g: 0.3 },

  // Minuman & Suplemen
  { id: 'id-45', name: 'Air Kelapa Muda Murni (Tanpa Gula)', category: 'Minuman', serving_size: '250ml (1 gelas)', calories: 45, protein_g: 1.0, carbs_g: 10.0, fat_g: 0.2 },
  { id: 'id-46', name: 'Kopi Hitam Tubruk (Tanpa Gula)', category: 'Minuman', serving_size: '200ml (1 cangkir)', calories: 2, protein_g: 0.2, carbs_g: 0.0, fat_g: 0.0 },
  { id: 'id-47', name: 'Kopi Susu Gula Aren Tradisional', category: 'Minuman', serving_size: '250ml (1 cup)', calories: 195, protein_g: 3.5, carbs_g: 32.0, fat_g: 6.0 },
  { id: 'id-48', name: 'Teh Manis Hangat', category: 'Minuman', serving_size: '250ml (1 gelas)', calories: 75, protein_g: 0.0, carbs_g: 19.0, fat_g: 0.0 },
  { id: 'id-49', name: 'Teh Hijau / Hitam Tawar', category: 'Minuman', serving_size: '250ml (1 gelas)', calories: 1, protein_g: 0.0, carbs_g: 0.2, fat_g: 0.0 },
  { id: 'id-50', name: 'Whey Protein Isolate Shake (Air)', category: 'Minuman', serving_size: '1 scoop (30g)', calories: 120, protein_g: 25.0, carbs_g: 2.0, fat_g: 1.0 },
  { id: 'id-51', name: 'Yogurt Plain Tanpa Gula', category: 'Minuman', serving_size: '150g', calories: 95, protein_g: 14.0, carbs_g: 5.5, fat_g: 1.5 },
  { id: 'id-52', name: 'Jus Alpukat Manis Kental', category: 'Minuman', serving_size: '300ml (1 gelas)', calories: 310, protein_g: 3.5, carbs_g: 48.0, fat_g: 14.0 },
];
