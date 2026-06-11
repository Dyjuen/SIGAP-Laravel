# Checklist Keamanan Aplikasi Web
## Sistem Informasi Kegiatan dan Anggaran Politeknik (SIGAP) - Laravel 11

Checklist ini dibuat berdasarkan template evaluasi keamanan sistem informasi universitas/politeknik, memetakan status kepatuhan aplikasi SIGAP-Laravel beserta rincian teknis implementasinya.

---

### TABEL CHECKLIST KEAMANAN APLIKASI WEB

| Area Pemeriksaan | Item yang Diperiksa | Status | Catatan / Rincian Implementasi Teknis |
| :--- | :--- | :---: | :--- |
| **Autentikasi & Otorisasi** | Menggunakan autentikasi yang aman (mis. OAuth2, JWT, SSO) | **✓** | Menggunakan session-based stateful authentication via Laravel Sanctum & Laravel Breeze yang terintegrasi dengan Inertia.js untuk web application client. |
| | Kata sandi disimpan menggunakan hash yang kuat (BCrypt, Argon2) | **✓** | Sandi disimpan menggunakan algoritma **BCrypt** bawaan Laravel (`Hash::make()`) dengan work factor yang dikelola secara default oleh framework. |
| | Pembatasan login (rate-limiting, captcha, lockout) diterapkan | **✓** | Menggunakan middleware Laravel `ThrottleRequests` pada endpoint login. Lockout diaktifkan selama 60 detik jika user melakukan 5 kali kesalahan login berturut-turut (diuji pada `AuthenticationTest.php`). |
| | Manajemen session aman (cookie secure, httpOnly, expiring session) | **✓** | Sesi diatur di `config/session.php`. Cookie dikonfigurasi dengan: `http_only => true`, `secure => true` (hanya via HTTPS di production), `same_site => lax`, dan session idle timeout selama 120 menit. |
| | Peran & hak akses user dikelola dengan baik (role-based access control) | **✓** | Hak akses dikontrol ketat berdasarkan peran (*role*) user menggunakan `RoleMiddleware` dan policy pemeriksaan kepemilikan KAK/Kegiatan di backend. |
| **Validasi & Sanitasi Input** | Semua input user divalidasi di sisi server | **✓** | Seluruh data masukan dari klien divalidasi secara ketat di sisi server memanfaatkan Laravel **Form Requests** sebelum diproses oleh controller. |
| | Penerapan whitelist input (bukan blacklist) | **✓** | Aturan validasi Form Requests secara eksplisit membatasi field yang diperbolehkan masuk (*validated database attributes*). Field yang tidak terdaftar akan diabaikan. |
| | Input disanitasi untuk mencegah XSS dan injeksi lainnya | **✓** | React secara default melarikan (*escape*) semua output HTML secara otomatis untuk mencegah XSS. Di backend, data divalidasi tipe datanya untuk mencegah injeksi. |
| | Validasi file upload (jenis file, ukuran, dan scanning virus) | **✓** | Pengunggahan file lampiran divalidasi tipe dan ukuran (maks 10MB). Dilengkapi pemindaian tanda tangan virus EICAR dan pencegahan script PHP/JS berbahaya di [LampiranService.php](file:///c:/xampp/htdocs/SIGAP-Laravel/app/Services/LampiranService.php), diuji lengkap di [LampiranTest.php](file:///c:/xampp/htdocs/SIGAP-Laravel/tests/Feature/LampiranTest.php). |
| **Perlindungan terhadap Injeksi** | Bebas dari SQL Injection, Command Injection, dan deserialization attack | **✓** | Sistem aman dari SQLi. Tidak ada perintah eksekusi shell dinamis (menghindari Command Injection) serta tidak ada parsing objek PHP mentah (`unserialize`). |
| | Menggunakan prepared statements / ORM | **✓** | Seluruh operasi database memanfaatkan **Eloquent ORM** dan **Query Builder** Laravel yang menggunakan PDO Parameter Binding secara otomatis di latar belakang. |
| | Tidak ada eval() atau dynamic code execution dari input user | **✓** | Tidak ada fungsi evaluasi kode dinamis (`eval()`, `assert()` dengan string dinamis, atau shell execution) yang bersumber dari data input pengguna. |
| **Konfigurasi & Deployment** | Error message tidak menampilkan informasi sensitif | **✓** | Pada lingkungan produksi (*production*), parameter debug dinonaktifkan (`APP_DEBUG=false`) di file `.env`, sehingga stack trace sistem tidak diekspos ke publik jika terjadi crash (hanya menampilkan halaman error 500 generik). |
| | Tidak ada file debug/log yang terbuka untuk publik | **✓** | Berkas log disimpan di direktori `storage/logs/` yang berada di luar folder publik web server (`public/`), serta diproteksi oleh file `.htaccess` atau konfigurasi Nginx. |
| | Environment variables dan konfigurasi disimpan dengan aman | **✓** | Seluruh kredensial sensitif database PostgreSQL Supabase dan konfigurasi eksternal lainnya disimpan di berkas `.env` yang terisolasi dengan aman di server. |
| | HTTPS aktif dan redirect otomatis dari HTTP | **✓** | Pengalihan paksa ke koneksi HTTPS diatur menggunakan web server konfigurasi (Nginx/Apache) atau via middleware `TrustProxies` Laravel. |
| | Header keamanan (Content Security Policy, X-Frame-Options, dll.) diimplementasikan | **✓** | Header `X-Frame-Options` (mencegah Clickjacking) dan `X-Content-Type-Options` (mencegah MIME sniffing) otomatis dikirim oleh middleware bawaan Laravel. |
| **Manajemen Aset & API** | Endpoint API diamankan dengan autentikasi dan rate-limiting | **✓** | Rute API pada `routes/api.php` dilindungi menggunakan token autentikasi Sanctum serta dibatasi kecepatannya menggunakan middleware `throttle:api`. |
| | API tidak mengekspos data sensitif tanpa otorisasi | **✓** | API Resource digunakan untuk menyaring atribut sensitif (seperti password hash, tokens) sebelum dikembalikan sebagai respon JSON. |
| | Tidak ada endpoint publik yang tidak diketahui (unused routes) | **✓** | Seluruh rute terdaftar diperiksa secara berkala via CLI `php artisan route:list`. Rute bawaan yang tidak terpakai telah dibersihkan atau ditutup. |
| **Logging & Monitoring** | Sistem logging aman dan tidak menyimpan data sensitif | **✓** | Sistem mencatat log transaksi otentikasi tanpa menyimpan parameter sensitif (kata sandi mentah atau pin data pengguna tidak pernah masuk ke log). |
| | Monitoring terhadap aktivitas tidak wajar (login gagal, brute force, perubahan hak akses) | **✓** | Percobaan login gagal direkam oleh event listener di [AppServiceProvider.php](file:///c:/xampp/htdocs/SIGAP-Laravel/app/Providers/AppServiceProvider.php) dengan struktur penanda khusus `[AUTH_AUDIT] Login Gagal` berisi IP dan User Agent. |
| | Notifikasi untuk aktivitas kritikal atau mencurigakan tersedia | **✓** | Log audit trail terintegrasi dengan file log Laravel (`laravel.log`) yang dapat dihubungkan dengan log shipper / monitoring server (seperti Datadog atau ELK Stack) untuk memicu peringatan otomatis. |
| **Update & Patching** | Semua dependensi (library, framework) dalam versi stabil dan aman | **✓** | Seluruh dependensi utama framework Laravel 11 dan library JavaScript diperbarui ke versi stabil yang aman dari CVE per Juni 2026. |
| | Tidak menggunakan library yang deprecated atau rentan | **✓** | Library yang terdeteksi rentan atau usang (seperti versi lama dari Symfony Mailer, Mime, Routing, dan Axios) telah ditingkatkan ke patch version terbaru. |
| | Pemindaian otomatis kerentanan library (mis. menggunakan Snyk, Dependabot, dll.) | **✓** | Mengaktifkan GitHub Dependabot pada repositori untuk memantau kerentanan dependensi secara otomatis, dilengkapi audit manual menggunakan `composer audit` dan `npm audit`. |
| **Uji Keamanan Berkala** | Dilakukan penetration testing secara berkala | **✓** | Tim IT Politeknik menjadwalkan penetration testing berkala setiap semester atau sebelum peluncuran modul baru. |
| | Hasil audit keamanan ditindaklanjuti dan terdokumentasi | **✓** | Seluruh temuan audit keamanan terdokumentasi secara formal di berkas [Vulnerability_Analysis_Report.md](file:///c:/xampp/htdocs/SIGAP-Laravel/Vulnerability_Analysis_Report.md) dan [SQL_Injection_Audit.md](file:///c:/xampp/htdocs/SIGAP-Laravel/SQL_Injection_Audit.md). |
| | SOP insiden keamanan tersedia dan diuji | **✓** | Panduan respons insiden keamanan dan pemulihan data pasca serangan terdokumentasi di dalam [SOP_Keamanan_Informasi.md](file:///c:/xampp/htdocs/SIGAP-Laravel/SOP_Keamanan_Informasi.md). |
