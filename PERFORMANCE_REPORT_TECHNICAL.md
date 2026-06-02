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

*   **Latency (p95):** 1.03 Detik. Artinya, 95% pengguna mendapatkan respon dalam waktu sekitar 1 detik, yang masuk dalam kategori sangat responsif untuk aplikasi web modern.
*   **Stabilitas Bisnis Logik:** 100% Success Rate. Seluruh alur (Login, Monitoring, View Detail) berhasil dieksekusi tanpa kegagalan sistem.
*   **Data Throughput:** Rata-rata 17 request per detik (RPS) berhasil ditangani oleh server tanpa adanya lonjakan error yang persisten.

---

## 4. Kesimpulan dan Saran Operasional
Sistem SIGAP PNJ telah dinyatakan layak untuk digunakan di lingkungan produksi (Production Ready) dengan kapasitas optimal di angka 30-50 user bersamaan. 

**Rekomendasi Operasional:**
1.  **Monitoring CPU:** Mengingat fitur cetak PDF memerlukan resource CPU yang besar, disarankan untuk memantau penggunaan CPU hosting saat periode pelaporan akhir tahun.
2.  **Opcache:** Pastikan ekstensi PHP Opcache tetap aktif di server hosting untuk menjaga kecepatan eksekusi script.
3.  **Skalabilitas:** Jika di masa depan jumlah user meningkat di atas 100 secara bersamaan, disarankan untuk melakukan upgrade resource CPU (Vertical Scaling) pada server hosting.
