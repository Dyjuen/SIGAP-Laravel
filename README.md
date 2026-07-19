<p align="center">
  <img src="mobile/assets/images/logoauth.svg" alt="SIGAP Logo" width="300">
</p>

<h1 align="center">SIGAP</h1>
<h3 align="center">Sistem Informasi Manajemen Kegiatan dan Anggaran Politeknik</h3>

<p align="center">
  <strong>Akselerasi Pengajuan Kegiatan Kampus</strong><br>
  Aplikasi berbasis <em>Laravel (PHP)</em> dan <em>Flutter (Dart)</em> untuk pengelolaan siklus kegiatan mulai dari pengajuan KAK, monitoring, LPJ, hingga pencairan dana — dilengkapi SPK TOPSIS dan AI Executive Summary.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-11-FF2D20?style=flat&logo=laravel" alt="Laravel">
  <img src="https://img.shields.io/badge/PHP-8.2-777BB4?style=flat&logo=php" alt="PHP">
  <img src="https://img.shields.io/badge/Flutter-3.16-02569B?style=flat&logo=flutter" alt="Flutter">
  <img src="https://img.shields.io/badge/Dart-3.2-0175C2?style=flat&logo=dart" alt="Dart">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

---

## 📋 Daftar Isi

- [Tentang SIGAP](#tentang-sigap)
- [Fitur & Modul](#fitur--modul)
- [Screenshot Aplikasi](#screenshot-aplikasi)
  - [📱 Tampilan Mobile](#-tampilan-mobile-mobile-app-screenshots)
  - [💻 Tampilan Web / Desktop](#-tampilan-web--desktop-web-screenshots)
- [Arsitektur](#arsitektur)
- [Teknologi](#teknologi)
- [Instalasi](#instalasi)
- [Lisensi](#lisensi)

---

## 🎯 Tentang SIGAP

**SIGAP (Sistem Informasi Manajemen Kegiatan dan Anggaran Politeknik)** adalah aplikasi full-stack untuk mengelola siklus kegiatan kampus — dari pengajuan Kerangka Acuan Kerja (KAK), monitoring realisasi, Laporan Pertanggungjawaban (LPJ), hingga pencairan dana. Aplikasi ini melayani multi-peran: Administrator, PPK, Wakil Direktur II, Direktur, Pengusul (Admin Jurusan), dan Bendahara.

Dilengkapi **Sistem Pendukung Keputusan (SPK) berbasis TOPSIS** untuk evaluasi kinerja unit serta **AI Executive Summary** untuk ringkasan strategis berbasis data.

---

## ✨ Fitur & Modul

| Modul | Deskripsi |
|---|---|
| **Manajemen Pengguna** | CRUD pengguna dengan role-based access control (RBAC) |
| **KAK (Kerangka Acuan Kerja)** | Pengajuan, review, approval, dan tracking KAK multi-level |
| **Monitoring Kegiatan** | Pantau status kegiatan secara real-time |
| **LPJ (Laporan Pertanggungjawaban)** | Upload, validasi, dan tracking LPJ kegiatan |
| **Pencairan Dana** | Manajemen pencairan anggaran oleh Bendahara |
| **SPK / TOPSIS** | Evaluasi kinerja unit dengan metode TOPSIS multi-kriteria |
| **AI Executive Summary** | Ringkasan strategis berbasis AI untuk pimpinan |
| **Dashboard Multi-Role** | Dasbor khusus untuk Administrator, PPK, Wadir, Direktur, Pengusul, Bendahara |
| **Trend Realisasi & Visualisasi** | Grafik perbandingan rencana vs realisasi dan distribusi dana |
| **Log Aktivitas** | Riwayat lengkap seluruh operasi sistem |
| **Notifikasi Push** | Firebase Cloud Messaging (FCM) untuk notifikasi real-time |
| **Landing Page** | Informasi publik tentang fitur SIGAP |

---

## 📸 Screenshot Aplikasi

### 📱 Tampilan Mobile (Mobile App Screenshots)

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(20).png" alt="Landing Page" width="250">
  <br>
  <em>Landing Page — Halaman depan aplikasi yang menampilkan informasi umum tentang fitur cerdas SIGAP untuk akselerasi pengajuan kegiatan kampus.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(1).png" alt="Halaman Login" width="250">
  <br>
  <em>Halaman Login — Form autentikasi bagi pengguna untuk masuk ke dalam sistem SIGAP.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(2).png" alt="Dashboard Administrator" width="250">
  <br>
  <em>Dashboard Administrator — Menampilkan ringkasan data statistik sistem (Total KAK, Kegiatan, Persetujuan, Pengguna), akses cepat, dan log aktivitas terbaru.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(3).png" alt="Manajemen Pengguna" width="250">
  <br>
  <em>Manajemen Pengguna — Daftar seluruh pengguna sistem beserta perannya, dilengkapi fitur untuk menambah, mengedit, dan menghapus pengguna.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(4).png" alt="Monitoring Kegiatan" width="250">
  <br>
  <em>Monitoring Kegiatan — Halaman untuk memantau status seluruh kegiatan dari berbagai unit, baik yang sedang berjalan maupun yang telah selesai.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(5).png" alt="Profil Pengguna" width="250">
  <br>
  <em>Profil Pengguna — Menampilkan detail informasi akun yang sedang login beserta opsi untuk keluar dari sesi (logout).</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(6).png" alt="Evaluasi & Parameter SPK" width="250">
  <br>
  <em>Evaluasi & Parameter SPK — Menampilkan rata-rata skor evaluasi instansi, pemetaan unit dengan kinerja tertinggi dan terendah, serta pengaturan bobot kriteria SPK.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(7).png" alt="Master Data" width="250">
  <br>
  <em>Master Data — Halaman pengelolaan data referensi inti sistem, seperti Tipe Kegiatan, Mata Anggaran, Kategori Belanja, Satuan, dan Indikator Kinerja Utama (IKU).</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(8).png" alt="Manajemen Pengguna (Lanjutan)" width="250">
  <br>
  <em>Manajemen Pengguna (Lanjutan) — Lanjutan dari halaman manajemen pengguna (tampilan scroll) yang menampilkan lebih banyak daftar akun.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(9).png" alt="Dashboard PPK Kegiatan" width="250">
  <br>
  <em>Dashboard PPK Kegiatan — Dasbor khusus Pejabat Pembuat Komitmen (PPK) yang menampilkan ringkasan pengajuan kegiatan (Menunggu, Disetujui, Ditolak).</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(10).png" alt="Kegiatan Menunggu Approval" width="250">
  <br>
  <em>Kegiatan Menunggu Approval — Daftar pengajuan kegiatan yang berstatus pending dan membutuhkan peninjauan atau persetujuan dari pihak terkait.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(11).png" alt="Dashboard Wakil Direktur II" width="250">
  <br>
  <em>Dashboard Wakil Direktur II — Menampilkan ringkasan pengajuan kegiatan dan akses cepat untuk melakukan persetujuan (approval) di level Wadir.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(12).png" alt="Dashboard Direktur PNJ" width="250">
  <br>
  <em>Dashboard Direktur PNJ — Tampilan dasbor eksekutif dengan AI Executive Summary, ringkasan serapan keuangan, dan evaluasi kinerja tiap unit.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(13).png" alt="Analisis Kinerja Unit (SPK/TOPSIS)" width="250">
  <br>
  <em>Analisis Kinerja Unit (SPK/TOPSIS) — Menampilkan peringkat kinerja dari setiap jurusan/unit secara berurutan, lengkap dengan status stabilitas kinerjanya.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(14).png" alt="Trend Realisasi & Kegiatan" width="250">
  <br>
  <em>Trend Realisasi & Kegiatan — Menampilkan visualisasi grafik berupa trend perbandingan Dana Rencana vs Realisasi serta diagram pie chart distribusi dana per unit.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(15).png" alt="Dashboard Pengusul (Admin Jurusan)" width="250">
  <br>
  <em>Dashboard Pengusul (Admin Jurusan) — Dasbor khusus pengusul kegiatan untuk memantau ringkasan status KAK yang mereka buat (Draft, Review, Disetujui, Ditolak).</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(16).png" alt="Daftar LPJ" width="250">
  <br>
  <em>Daftar LPJ (Laporan Pertanggungjawaban) — Halaman bagi pengguna untuk melihat, mencari, dan melacak status LPJ dari kegiatan yang telah selesai.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(17).png" alt="Form Buat KAK Baru" width="250">
  <br>
  <em>Form Buat KAK Baru — Formulir wizard digital (tab kerangka acuan) untuk pengisian detail kegiatan, kurun waktu, dan informasi esensial lainnya.</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(18).png" alt="Dashboard Bendahara" width="250">
  <br>
  <em>Dashboard Bendahara — Menampilkan ringkasan status pencairan dana (LPJ Pending, Approved, Total Anggaran Diusulkan, dan Total Dicairkan).</em>
</p>

<p align="center">
  <img src="docs/image-mobile/Sigap-mobile%20(19).png" alt="Pencairan Dana (Modal)" width="250">
  <br>
  <em>Pencairan Dana (Modal) — Antarmuka pop-up bagi Bendahara untuk melihat sisa dana tersedia dan menginput nominal dana yang akan dicairkan.</em>
</p>

---

### 💻 Tampilan Web / Desktop (Web Screenshots)

<p align="center">
  <img src="docs/image/Sigap%20(1).png" alt="Landing Page" width="700">
  <br>
  <em>Landing Page — Halaman beranda sistem informasi yang menampilkan profil aplikasi SIGAP.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(2).png" alt="Login" width="700">
  <br>
  <em>Login — Portal masuk ke dalam sistem dengan antarmuka web yang responsif.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(3).png" alt="Dashboard Administrator" width="700">
  <br>
  <em>Dashboard Administrator — Tampilan lebar dasbor pengelola sistem dengan ringkasan statistik dan akses cepat.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(4).png" alt="Manajemen Pengguna" width="700">
  <br>
  <em>Manajemen Pengguna — Tabel daftar pengguna yang mendukung pengelolaan data dalam jumlah banyak secara efisien.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(5).png" alt="Monitoring" width="700">
  <br>
  <em>Monitoring — Tabel pemantauan seluruh kegiatan secara real-time.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(6).png" alt="Profil" width="700">
  <br>
  <em>Profil — Halaman manajemen akun pribadi pengguna.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(7).png" alt="Evaluasi SPK" width="700">
  <br>
  <em>Evaluasi SPK — Dasbor Decision Support System untuk mengatur bobot kriteria evaluasi.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(8).png" alt="Master Data" width="700">
  <br>
  <em>Master Data — Halaman kelola data master (Kategori, Anggaran, dll) dalam bentuk grid.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(9).png" alt="Dashboard PPK" width="700">
  <br>
  <em>Dashboard PPK — Ruang kerja Pejabat Pembuat Komitmen (PPK) untuk melihat ringkasan tugas.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(10).png" alt="Approval" width="700">
  <br>
  <em>Approval — Halaman untuk melakukan persetujuan/peninjauan KAK yang masuk.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(11).png" alt="Dashboard Wakil Direktur II" width="700">
  <br>
  <em>Dashboard Wakil Direktur II — Tampilan tingkat pimpinan (executive view) untuk monitoring kegiatan.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(12).png" alt="Dashboard Direktur" width="700">
  <br>
  <em>Dashboard Direktur — Tampilan eksekutif dilengkapi ringkasan AI (Artificial Intelligence) dan pantauan serapan anggaran tingkat institusi.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(13).png" alt="Analisis Kinerja" width="700">
  <br>
  <em>Analisis Kinerja — Laporan analitik metode TOPSIS untuk pemeringkatan unit.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(14).png" alt="Visualisasi Data" width="700">
  <br>
  <em>Visualisasi Data — Grafik interaktif trend realisasi dan distribusi dana.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(15).png" alt="Dashboard Pengusul" width="700">
  <br>
  <em>Dashboard Pengusul — Halaman bagi Admin Jurusan/Unit untuk memantau usulan kegiatan.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(16).png" alt="LPJ" width="700">
  <br>
  <em>LPJ — Halaman pengelolaan laporan pertanggungjawaban kegiatan.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(17).png" alt="Pembuatan KAK" width="700">
  <br>
  <em>Pembuatan KAK — Formulir digital pembuatan KAK secara detail (Target IKU & RAB).</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(18).png" alt="Dashboard Bendahara" width="700">
  <br>
  <em>Dashboard Bendahara — Modul keuangan untuk memvalidasi pencairan anggaran.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(19).png" alt="Pencairan Dana" width="700">
  <br>
  <em>Pencairan Dana — Halaman pemeriksaan rincian dana yang akan didistribusikan.</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(20).png" alt="Detail Peninjauan (Review KAK)" width="700">
  <br>
  <em>Detail Peninjauan (Review KAK) — Halaman pembacaan detail penuh dari sebuah dokumen pengajuan (Document Viewer).</em>
</p>

<p align="center">
  <img src="docs/image/Sigap%20(21).png" alt="Log Aktivitas" width="700">
  <br>
  <em>Log Aktivitas — Riwayat lengkap seluruh operasi yang dilakukan dalam sistem.</em>
</p>

---

## 🏗️ Arsitektur

```
┌────────────────────────────────────────────────────────────┐
│                    Frontend Web (React)                      │
│            Tailwind CSS — Dark UI — Inertia.js               │
└────────────────────────┬───────────────────────────────────┘
                         │         HTTP / JSON API
                         ▼
┌────────────────────────────────────────────────────────────┐
│              Backend (Laravel 11 — PHP 8.2)                  │
│          Eloquent ORM │ RBAC │ Queue │ FCM Push             │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                     Database (MySQL 8.0)                    │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│               Mobile App (Flutter 3.16 — Dart)               │
│       Provider State Management │ Dio HTTP Client            │
└────────────────────────────────────────────────────────────┘
```

- **Frontend Web:** React + Inertia.js dengan Tailwind CSS
- **Mobile App:** Flutter cross-platform (Android & iOS)
- **Backend:** Laravel 11 dengan REST API dan role-based access control
- **Database:** MySQL 8.0 dengan migrasi dan seeder
- **Notifikasi:** Firebase Cloud Messaging (FCM) untuk push notification real-time
- **SPK:** Metode TOPSIS untuk evaluasi dan pemeringkatan kinerja unit

---

## 🛠️ Teknologi

- **Laravel 11** — Framework PHP backend
- **PHP 8.2** — Bahasa pemrograman backend
- **MySQL 8.0** — Database relasional
- **Flutter 3.16** — Framework mobile cross-platform
- **Dart 3.2** — Bahasa pemrograman mobile
- **React 18** — Library frontend web
- **Inertia.js** — Monolithic SPA bridge
- **Tailwind CSS 3** — Utility-first CSS framework
- **Firebase** — Cloud messaging & notifikasi
- **Provider** — State management Flutter
- **Dio** — HTTP client Flutter

---

## ⚙️ Instalasi

### Prasyarat

- **PHP 8.2+** & **Composer** (untuk backend)
- **Node.js & npm** (untuk frontend web)
- **Flutter 3.16+** & **Dart 3.2+** (untuk mobile)
- **MySQL 8.0** (untuk database)

### Langkah Instalasi

```bash
# Clone repositori
git clone https://github.com/username/sigap.git
cd sigap

# ─── Backend ───────────────────────────────────────
cp .env.example .env
# Edit .env sesuai konfigurasi database Anda
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve

# ─── Frontend Web ──────────────────────────────────
npm install
npm run dev

# ─── Mobile App ────────────────────────────────────
cd mobile
flutter pub get
flutter run
```

Buka **http://localhost:8000** untuk web atau jalankan aplikasi Flutter di emulator/device.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**. Lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.
