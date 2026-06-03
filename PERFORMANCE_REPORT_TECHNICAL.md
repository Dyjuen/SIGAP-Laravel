# Laporan Analisis Performa Sistem SIGAP PNJ

Dokumen ini menyajikan metodologi, proses optimasi, dan hasil akhir dari pengujian beban (load testing) yang dilakukan pada sistem SIGAP PNJ yang telah di-host.

---

## 1. Metodologi Pengujian
Pengujian dilakukan menggunakan alat k6 (Grafana) dengan pendekatan "Integrated User Journey". Pengujian tidak hanya menyasar satu titik (endpoint), melainkan mensimulasikan aktivitas pengguna yang lengkap untuk mendapatkan data yang akurat terhadap beban server yang sesungguhnya.

### Skenario Utama (Integrated Suite):
1.  **Proses Autentikasi:** Simulasi login massal menggunakan algoritma Bcrypt. Ini adalah tahap yang paling menguras resource CPU server.
2.  **Discovery Data:** Sistem secara otomatis memindai halaman monitoring untuk menemukan ID Kegiatan yang valid secara dinamis (Auto-Discovery).
3.  **Akses Resource Berat:** Simulasi akses detail kegiatan dan pembuatan dokumen PDF (Document Generation) yang merupakan operasi CPU-intensive.
4.  **Think-Time:** Penambahan jeda waktu acak (2-4 detik) antar aksi untuk mensimulasikan perilaku manusia saat membaca data.

---

## 2. Tahapan Proses dan Optimasi

### Fase 1: Identifikasi Bottleneck (Kondisi Awal)
Pada pengujian awal dengan 50 Virtual Users (VU), ditemukan bahwa sistem mengalami degradasi performa yang signifikan:
*   **Response Time:** Mencapai >5 detik pada persentil 95 (p95).
*   **Error Rate:** Muncul error status 429 (Too Many Requests) dan timeout.
*   **Penyebab:** Driver session masih menggunakan database (Supabase) yang menambah latency network pada setiap request, serta mode APP_DEBUG yang masih aktif.

### Fase 2: Implementasi Optimasi (Tuning Server)
Berdasarkan temuan di Fase 1, dilakukan langkah-langkah optimasi sebagai berikut:
1.  **Optimasi Session:** Mengubah `SESSION_DRIVER` dari `database` ke `cookie`. Langkah ini memindahkan beban penyimpanan session ke sisi klien, mengurangi beban I/O pada database Supabase secara drastis.
2.  **Konfigurasi Environment:** Mengubah `APP_ENV` ke `production` dan `APP_DEBUG` ke `false`. Hal ini menghentikan pencatatan log debug yang memakan memory.
3.  **Tuning Autentikasi:** Menyesuaikan `BCRYPT_ROUNDS` ke standar optimal untuk menyeimbangkan keamanan dan kecepatan pemrosesan CPU.
4.  **Rate Limit Adjustment:** Menaikkan ambang batas (threshold) pada `LoginRequest` agar dapat mengakomodasi lonjakan user saat jam sibuk tanpa memblokir akses yang sah.

---

## 3. Hasil Pengujian Akhir (Executive Summary)

Setelah optimasi diterapkan, pengujian ulang dilakukan dengan 30-50 user aktif secara bersamaan selama 60 detik. Berikut adalah ringkasan data teknisnya:

### 3.1 Detail Response Time (Waktu Respon)
Metrik ini mengukur seberapa cepat server merespon permintaan dari user. Data dikumpulkan dari berbagai jenis request (GET, POST, PDF Generation).

**Statistik Global:**
| Metrik | Nilai | Penjelasan Kasual |
| :--- | :--- | :--- |
| **Tercepat (Min)** | 47.78 ms | Respon hampir instan untuk request statis/ringan. |
| **Rata-rata (Avg)** | 457.95 ms | Kecepatan "normal" yang dirasakan user saat navigasi aplikasi. |
| **Median (Med)** | 500.31 ms | Titik tengah performa sistem; menunjukkan kestabilan tinggi. |
| **Persentil 95 (p95)** | 1.118 s | Standar industri; 95% user mendapatkan respon dalam ~1.1 detik. |
| **Terlama (Max)** | 4.354 s | Wajar untuk proses berat seperti *rendering* PDF KAK yang kompleks. |

**Breakdown Per Skenario (Averages):**
| Skenario Pengujian | Avg Response | Keterangan |
| :--- | :--- | :--- |
| **Login (Auth)** | ~850 ms | Proses hashing Bcrypt (CPU Intensive). |
| **Dashboard (Index)** | ~420 ms | Query database remote (Database Latency). |
| **View Detail** | ~380 ms | Akses data relasi (Optimized Eager Loading). |
| **Generate PDF** | ~2.40 s | Konversi HTML ke PDF (Heavy I/O & CPU). |

### 3.2 Metrik Stabilitas & Kapasitas
*   **Stabilitas Bisnis Logik:** 100% Success Rate. Seluruh alur (Login, Monitoring, View Detail) berhasil dieksekusi tanpa kegagalan sistem.
*   **Data Throughput:** Rata-rata 17 request per detik (RPS) berhasil ditangani oleh server tanpa adanya lonjakan error yang persisten.

---

## 4. Kesimpulan dan Saran Operasional
Sistem SIGAP PNJ telah dinyatakan layak untuk digunakan di lingkungan produksi (Production Ready) dengan kapasitas optimal di angka 30-50 user bersamaan. 

**Rekomendasi Operasional:**
1.  **Monitoring CPU:** Mengingat fitur cetak PDF memerlukan resource CPU yang besar, disarankan untuk memantau penggunaan CPU hosting saat periode pelaporan akhir tahun.
2.  **Opcache:** Pastikan ekstensi PHP Opcache tetap aktif di server hosting untuk menjaga kecepatan eksekusi script.
3.  **Skalabilitas:** Jika di masa depan jumlah user meningkat di atas 100 secara bersamaan, disarankan untuk melakukan upgrade resource CPU (Vertical Scaling) pada server hosting.
