# 🏋️ BUGAR - Edge Fitness, Nutrition & Fat Burner Server

[![Release ARM64 Binary](https://github.com/faisalfa123/bugar/actions/workflows/release.yml/badge.svg)](https://github.com/faisalfa123/bugar/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-ODROID--C2%20(ARM64)-blue.svg)](https://www.hardkernel.com/)
[![RAM Footprint](https://img.shields.io/badge/RAM%20Idle-%3C%208.5%20MB-purple.svg)]()

**BUGAR** adalah platform kesehatan, kebugaran, pola makan, dan *fat burner* all-in-one yang dirancang dan dioptimalkan khusus untuk **SBC ODROID-C2 (ARM64 / `aarch64`, RAM 2GB)**. Mengusung filosofi arsitektur **"Rust Single-Binary Edge Server + 100% Client-Side Local-First UI"**.

---

## ⚡ Panduan Instalasi Cepat ODROID-C2 (1-Baris Perintah)

Jalankan perintah ini langsung di terminal ODROID-C2 Anda (DietPi / Armbian / Debian):

```bash
curl -fsSL https://raw.githubusercontent.com/faisalfa123/bugar/main/scripts/install-odroid.sh | sudo bash
```

### Apa yang dilakukan skrip installer ini?
1. Otomatis mendeteksi arsitektur ARM64 (`aarch64`).
2. Mengunduh binary *single static* `bugar-linux-arm64` dari [GitHub Releases](https://github.com/faisalfa123/bugar/releases/latest).
3. Memverifikasi integritas checksum SHA256.
4. Memasang executable ke `/usr/local/bin/bugar`.
5. Membuat direktori database hemat eMMC `/var/lib/bugar/`.
6. Membuat dan mengaktifkan service systemd `/etc/systemd/system/bugar.service`.
7. Aplikasi langsung dapat diakses di browser melalui `http://<IP-ODROID-C2>:8080`.

---

## 🏛️ Arsitektur Sistem

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT-SIDE (HP / Browser)                      │
│   Vite + React 18 + TS + Tailwind + PWA + Capacitor (iOS & Android)    │
│   - Triple Concentric Activity Rings (SVG Animation)                   │
│   - Client-side Knapsack Mastermind Solver                             │
│   - 50+ Database Makanan Indonesia (Offline Cache < 5ms)               │
│   - Full-Screen Workout Player (Web Audio API Synthesizer)             │
│   - IndexedDB Storage (100% Local-First & Offline Ready)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API JSON Sync (LWW UUID)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   ODROID-C2 EDGE SERVER (ARM64 SBC)                    │
│   Single Static Binary: bugar-linux-arm64                              │
│   - Axum Web Server + Selective Tokio (< 10 MB RAM)                    │
│   - rust-embed: Seluruh bundle web/dist/ tertanam di dalam binary      │
│   - rusqlite (Bundled SQLite): Zero dependency sistem OS               │
│   - PRAGMA WAL mode + cache 2MB (Proteksi flash eMMC/MicroSD)          │
│   - Server-Side Mastermind Backup Engine & JSON Backup Export          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Otomatisasi CI/CD GitHub Actions (`release.yml`)

Kompilasi Rust untuk arsitektur ARM64 membutuhkan CPU dan waktu yang cukup intensif jika dijalankan di ODROID-C2. Oleh karena itu, seluruh proses build diotomatisasi di cloud melalui **GitHub Actions**:

1. **Trigger Otomatis:** Setiap kali terjadi `git push origin main` atau pembuatan tag rilis `v*`.
2. **Build Web Client:** Node.js 20 membangun bundle PWA (`npm ci && npm run build` -> `web/dist/`).
3. **Cross-Compilation:** Menggunakan `cargo-zigbuild` untuk mengompilasi Rust target `aarch64-unknown-linux-gnu` dengan optimasi ukuran:
   ```toml
   [profile.release]
   opt-level = "z"
   lto = true
   codegen-units = 1
   panic = "abort"
   strip = true
   ```
4. **Publish Release:** Binary statis `bugar-linux-arm64` beserta `checksums.txt` otomatis diunggah ke [GitHub Releases](https://github.com/faisalfa123/bugar/releases).

---

## 🌐 Akses PWA & HTTPS via Cloudflare Tunnel / Tailscale

Untuk mengaktifkan fitur instalasi **PWA (Add to Home Screen)** di iOS Safari dan Android Chrome, koneksi HTTPS diperlukan:

### Opsi 1: Cloudflare Tunnel (`cloudflared`) — Gratis & Publik
1. Pasang `cloudflared` di ODROID-C2:
   ```bash
   sudo apt install cloudflared
   ```
2. Jalankan quick tunnel ke port BUGAR:
   ```bash
   cloudflared tunnel --url http://localhost:8080
   ```
3. Buka URL HTTPS yang diberikan di Safari (iOS) atau Chrome (Android) -> Tekan **Share** -> **Add to Home Screen (Tambahkan ke Layar Utama)**.

### Opsi 2: Tailscale — Jaringan Pribadi Aman
1. Pasang Tailscale di ODROID-C2 dan aktifkan HTTPS MagicDNS:
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up
   sudo tailscale cert <nama-node>.tailnet-name.ts.net
   ```

---

## 📱 Build Aplikasi Native (Android & iOS via Capacitor)

Frontend BUGAR sudah dilengkapi konfigurasi **Capacitor 6** (`capacitor.config.ts`):

```bash
cd web

# 1. Pastikan build web siap
npm run build

# 2. Tambahkan platform Android atau iOS
npx cap add android
npx cap add ios

# 3. Sinkronisasikan aset ke proyek native
npm run cap:sync

# 4. Buka Android Studio atau Xcode untuk build APK / IPA
npx cap open android
npx cap open ios
```

---

## 💡 4 Segmen Utama Aplikasi BUGAR

### 0. Unified Dashboard
- **Triple Concentric Activity Rings:** Visualisasi SVG animasi melingkar untuk Kalori Terbakar, Menit Olahraga/Fat Burner, dan Hidrasi Air Harian.
- **BUGAR Mastermind Smart Card:** Widget cerdas yang menghitung sisa defisit/kuota kalori dan protein hari ini, lalu menyusun kombinasi menu makan dan sesi fat burner paling pas dalam 1-klik.

### 1. Segmen 1: Pola Makan & Penghitung Kalori (Gaya FatSecret)
- **Kalkulator BMR & TDEE:** Rumus Mifflin-St Jeor otomatis menyesuaikan target makronutrisi (*Fat Loss*, *Maintenance*, *Muscle Gain*).
- **Jurnal 4 Waktu:** Sarapan Pagi, Makan Siang, Makan Malam, dan Camilan.
- **50+ Database Makanan Indonesia:** Pencarian instan (< 5ms) untuk Nasi Putih, Nasi Merah, Dada Ayam Bakar, Tempe Bacem, Ikan Nila, Gado-gado, Soto Ayam, Rendang, Kopi Susu Gula Aren, dll.
- **Custom Food Creator:** Menambahkan menu kustom dengan perhitungan gramatur dan makronutrisi.

### 2. Segmen 2: Pencatatan Workout & Progres (Gaya Hevy & Strava)
- **Template Gym Siap Pakai:** Push Day, Pull Day, Leg Day, Full Body, Upper Power.
- **Pencatatan Per Set:** Input beban (kg), repetisi, dan checklist selesai.
- **Deteksi PR (Personal Record):** Otomatis mendeteksi rekor angkatan baru.
- **Auto-Rest Timer:** Pilihan 60s, 90s, 120s dengan efek suara lembut Web Audio API.
- **Pelacak Kardio Outdoor:** Menghitung jarak, durasi, *pace* (menit/km), kecepatan (km/j), dan estimasi kalori.

### 3. Segmen 3: Fat Burner Trainer Rumah & Gym (Gaya Nike Training Club)
- **12 Program Latihan Komplit:** Mulai dari 7-Menit Tabata Express, 15-Menit Core Shred, hingga 45-Menit Warrior Gym Melt.
- **Full-Screen Interactive Workout Player:**
  - Timer hitung mundur kontras tinggi: **WORK** (Oranye Menyala `#F97316`) vs **REST** (Biru Tenang `#3B82F6`).
  - Efek suara sintesis Web Audio API (bip hitung mundur 3-2-1 dan peluit pergantian gerakan, 0 KB file audio eksternal).
  - Kontrol Pause, Resume, Skip, dan Previous.
  - Selesai otomatis mencatat kalori terbakar ke cincin dashboard.

### 4. Segmen 4: Pusat Kesehatan & Biometrik (Gaya Apple Health / Google Fit)
- **Komposisi Tubuh:** Riwayat berat badan, BMI otomatis, dan estimasi **Body Fat %** metode US Navy.
- **Hidrasi Air:** Pelacak minum interaktif (+250ml / +500ml) dengan target dinamis sesuai berat badan (35ml/kg).
- **Pencatat Tidur:** Durasi tidur dan rating kualitas 1–5 bintang.
- **Penghitung Langkah & Native Bridge:** Adapter siap pakai untuk Apple HealthKit dan Android Health Connect via Capacitor.

---

## 🛠️ Perintah Pengembangan Lokal (Development)

```bash
# 1. Jalankan Frontend (Vite Dev Server)
cd web
npm run dev

# 2. Jalankan Backend Rust secara lokal
cargo run -- --port 8080 --db ./bugar.db

# 3. Build Production Binary Lokal
cd web && npm run build && cd ..
cargo build --release
```

---

## 💾 Penyimpanan Eksternal & Disaster Recovery (`/mnt/hdd1/bugar/`)

Untuk memastikan data kebugaran dan konfigurasi pribadi Anda aman dari kerusakan kartu SD atau kegagalan sistem, BUGAR otomatis menyinkronkan data ke media penyimpanan eksternal `/mnt/hdd1/bugar/`:

### Berkas yang Tersimpan di `/mnt/hdd1/bugar/`:
1. **`config.json`**: Pengaturan profil pribadi, usia, tinggi, berat, dan target kalori/makro dalam format JSON yang rapi (*human-readable/writable*). Anda dapat melihat dan mengubahnya secara manual jika diperlukan.
2. **`backup_latest.json`**: Cadangan lengkap seluruh database (jurnal makan, rekam gym, fat burner, dan metrik kesehatan) dalam format JSON terstruktur.
3. **`data_overview.txt`**: Ringkasan teks biasa yang dapat langsung dibaca di terminal dengan perintah `cat /mnt/hdd1/bugar/data_overview.txt` atau `nano`.
4. **`exports/`**: Direktori yang menampung arsip cadangan bertanggal otomatis (`backup_YYYYMMDD_HHMMSS.json`).

### 🔄 Otomatisasi Pemulihan Bencana (Auto-Recovery)
Jika database internal `/var/lib/...` atau sistem ODROID-C2 terformat/rusak, cukup instal kembali BUGAR. Saat pertama kali dijalankan dan mendeteksi database kosong, BUGAR akan **secara otomatis memulihkan seluruh data** dari `/mnt/hdd1/bugar/backup_latest.json`.

### 📦 Ekspor & Impor Berkas via Web UI
- **Ekspor:** Buka menu **Pengaturan** -> Klik **"Ekspor File (.json)"** untuk mengunduh berkas cadangan langsung ke browser HP atau komputer Anda.
- **Impor:** Buka menu **Pengaturan** -> Klik **"Impor File (.json)"** -> Pilih opsi **"Gabungkan (Merge LWW)"** atau **"Timpa Bersih (Clean Replace)"** untuk memulihkan data kapan pun.

---

## 🛡️ Integrasi Mastermind Sandbox (`bugar.batasan.toml`)

BUGAR menyediakan berkas konfigurasi resmi `bugar.batasan.toml` yang kompatibel dengan **App Manager Mastermind** (`faisalfa123/mastermind`):
- Alokasi memori terkendali: `memory_max_mb = 96`
- Kuota CPU: `cpu_quota_pct = 50`
- Izin filesystem jail: `paths_rw = ["/mnt/hdd1/bugar"]` (memberikan akses tulis penuh ke hard disk eksternal di dalam sandbox systemd).

---

Jika server ODROID-C2 dapat diakses dari jaringan publik, aktifkan perlindungan PIN akses:

```bash
export BUGAR_PIN="123456"
/usr/local/bin/bugar --port 8080 --db /var/lib/bugar/bugar.db
```

Frontend akan secara otomatis menampilkan **Keypad Layar Kunci PIN** yang elegan sebelum membuka dashboard.

---

## 📄 Lisensi
Hak Cipta (c) 2026 Faisal. Dirilis di bawah lisensi [MIT](LICENSE).
