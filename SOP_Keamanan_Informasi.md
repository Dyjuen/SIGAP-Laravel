# Standar Operasional Prosedur (SOP) Keamanan Informasi
## Sistem Informasi Kegiatan dan Anggaran Politeknik (SIGAP)

### 1. Kebijakan Akses Pengguna
Setiap pengguna yang memiliki akses ke SIGAP wajib mematuhi ketentuan berikut:
*   **Identitas Unik**: Setiap pengguna harus menggunakan akun pribadi masing-masing yang terdaftar di database sistem. Berbagi akun (account sharing) sangat dilarang.
*   **Pembatasan Sesi (Session Management)**: Sesi aktif pengguna akan secara otomatis berakhir (idle timeout) setelah 120 menit tidak ada aktivitas. Pengguna wajib melakukan login kembali untuk melanjutkan sesi.
*   **Pemberhentian Akses**: Apabila staf/pengguna mengalami mutasi, pensiun, atau tidak lagi berwenang mengelola anggaran/kegiatan, Administrator wajib menonaktifkan akun yang bersangkutan dalam waktu maksimal 1x24 jam sejak surat keputusan resmi diterbitkan.

### 2. Kebijakan Kata Sandi (Password Policy)
Untuk memastikan perlindungan akun yang maksimal:
*   **Kriteria Kompleksitas**: Kata sandi wajib memenuhi standar minimal berikut:
    *   Panjang minimal **10 karakter**.
    *   Mengandung kombinasi **huruf besar (A-Z)** dan **huruf kecil (a-z)**.
    *   Mengandung minimal **1 angka (0-9)**.
    *   Mengandung minimal **1 karakter khusus/simbol** (seperti `@`, `#`, `$`, `%`, `!`, dll.).
*   **Pengecekan Kebocoran**: Sistem akan mengecek password yang dimasukkan dengan database kebocoran publik (API *Have I Been Pwned* secara otomatis pada lingkungan produksi) untuk mencegah penggunaan kata sandi yang telah terkompromi.
*   **Masa Berlaku Sandi**: Pengguna sangat disarankan untuk memperbarui kata sandi secara berkala setiap 6 bulan sekali.

### 3. Kontrol Akses Berbasis Peran (Role-Based Access Control - RBAC)
Hak akses di dalam sistem SIGAP dikelola secara ketat berdasarkan peran (*role*) masing-masing pengguna:
1.  **Administrator (Admin)**: Mengelola master data, konfigurasi sistem, dan manajemen user (hak akses). Admin tidak memiliki hak untuk mengajukan anggaran atau mencairkan dana secara langsung.
2.  **Pengusul (Dosen/Staf Jurusan)**: Berwenang membuat, mengajukan, dan mengedit draf KAK (Kerangka Acuan Kerja) serta mengunggah laporan pertanggungjawaban (LPJ).
3.  **PPK (Pejabat Pembuat Komitmen)**: Melakukan review dan memberikan persetujuan atau penolakan pada usulan KAK tingkat unit/jurusan.
4.  **Wadir 2 (Wakil Direktur Bidang Administrasi Umum dan Keuangan)**: Memberikan persetujuan akhir usulan KAK/Anggaran sebelum dana dapat dicairkan.
5.  **Bendahara Pengeluaran (Cair, LPJ, Setor)**:
    *   **Bendahara Cair**: Melakukan verifikasi dan pencairan dana atas kegiatan yang telah disetujui Wadir 2.
    *   **Bendahara LPJ**: Melakukan verifikasi dokumen pertanggungjawaban kegiatan yang diunggah oleh Pengusul.
    *   **Bendahara Setor**: Mengelola pengembalian sisa dana anggaran yang tidak terpakai ke kas negara/politeknik.

### 4. Kebijakan Kriptografi dan Integritas Data
Aplikasi SIGAP mengimplementasikan pengamanan data menggunakan teknik kriptografi modern:
*   **Enkripsi Database**: Data sensitif berupa catatan/deskripsi pencairan anggaran (`keterangan` pada tabel `t_pencairan_dana`) disimpan dalam format terenkripsi menggunakan algoritma AES-256-CBC dengan kunci enkripsi yang aman di sisi server.
*   **Integritas File Lampiran**: Setiap berkas lampiran kegiatan atau dokumen LPJ yang diunggah ke sistem akan dihitung nilai hash SHA-256-nya pada saat proses unggah. Nilai hash ini disimpan ke database dan ditampilkan pada UI sebagai bukti validitas bahwa file tersebut tidak mengalami modifikasi (tampering) pihak ketiga sejak diunggah.

### 5. Penanganan Insiden Keamanan (Incident Response)
Apabila terjadi insiden keamanan seperti kebocoran data, serangan DDoS, atau aktivitas mencurigakan:
1.  **Identifikasi & Deteksi**: Staf IT/Admin memantau log aktivitas sistem (`t_kak_log_status` atau file log aplikasi Laravel) untuk mendeteksi anomali seperti lonjakan kegagalan login dari IP yang sama.
2.  **Isolasi**: Jika ditemukan akun terkompromi, Administrator harus segera menonaktifkan akun tersebut atau mereset password secara paksa melalui panel User Management.
3.  **Investigasi**: Log aktivitas audit trail dianalisis untuk melacak asal IP, waktu insiden, dan data apa saja yang diakses.
4.  **Pemulihan**: Jika database mengalami kerusakan, lakukan *restore* database dari salinan cadangan (*backup*) terakhir yang aman.

### 6. Kebijakan Pencadangan (Database Backup)
*   **Frekuensi**: Pencadangan database PostgreSQL wajib dilakukan secara otomatis setiap hari (Daily Backup) pada pukul 01.00 WIB.
*   **Penyimpanan**: File cadangan disimpan di server terpisah yang aman (cloud storage atau secondary backup storage) dengan kebijakan retensi minimal 30 hari.
*   **Enkripsi Backup**: File dump database cadangan wajib dienkripsi sebelum dipindahkan ke penyimpanan jangka panjang.
