# Laporan Audit Keamanan: Proteksi SQL Injection (SQLi)
## Sistem Informasi Kegiatan dan Anggaran Politeknik (SIGAP)

### 1. Ringkasan Eksekutif
Audit keamanan kode sumber (*source code audit*) telah dilakukan pada seluruh modul interaksi database aplikasi SIGAP-Laravel. Fokus utama audit adalah memastikan tidak adanya celah kerentanan SQL Injection (SQLi), baik melalui penggunaan Eloquent ORM, Query Builder, maupun query mentah (*raw queries*).

Berdasarkan hasil analisis, **SIGAP-Laravel dinyatakan AMAN dari kerentanan SQL Injection** karena mematuhi praktik terbaik penggunaan parameter binding PDO.

---

### 2. Metodologi Audit
Pencarian dilakukan secara komprehensif pada folder `app/` untuk mendeteksi penggunaan fungsi database berisiko tinggi:
1.  **Fungsi Raw Query**: `DB::raw`, `whereRaw`, `selectRaw`, `havingRaw`, `orderByRaw`.
2.  **Konkatenasi Input Langsung**: Memastikan tidak adanya penggabungan variabel input user (misalnya `$request->input(...)`) langsung ke dalam string query SQL tanpa binding.

---

### 3. Temuan & Analisis Audit Kode

#### A. Analisis `whereRaw`
Ditemukan beberapa penggunaan fungsi `whereRaw` di dalam kode program:
1.  **Statis / Hardcoded Conditions**:
    *   `whereRaw('1 = 0')` di [AuthorizesKakAccess.php](file:///c:/xampp/htdocs/SIGAP-Laravel/app/Traits/AuthorizesKakAccess.php#L120) dan [KakService.php](file:///c:/xampp/htdocs/SIGAP-Laravel/app/Services/KakService.php#L245) digunakan untuk memblokir query jika otorisasi gagal. Hal ini sepenuhnya aman.
    *   `whereRaw('is_active = true')` di [MasterDataController.php](file:///c:/xampp/htdocs/SIGAP-Laravel/app/Http/Controllers/MasterDataController.php#L45) dan [KakController.php](file:///c:/xampp/htdocs/SIGAP-Laravel/app/Http/Controllers/KakController.php#L69). Query ini statis tanpa parameter dinamis, sehingga sepenuhnya aman.
2.  **Pencarian Dinamis dengan Parameter Binding**:
    *   Di [KakController.php](file:///c:/xampp/htdocs/SIGAP-Laravel/app/Http/Controllers/KakController.php#L41):
        ```php
        $query->whereRaw('LOWER(nama_kegiatan) LIKE ?', ["%{$search}%"]);
        ```
        *Analisis*: Variabel `$search` diikat menggunakan penanda tanya (`?`) sebagai parameter binding. Nilai `$search` tidak langsung dimasukkan ke dalam sintaks SQL, melainkan dikirimkan terpisah ke database engine melalui PDO. Ini adalah penanganan yang aman dan direkomendasikan.

#### B. Analisis `DB::raw`
Ditemukan beberapa penggunaan `DB::raw` untuk agregasi data statistik pada Dashboard:
1.  **DashboardService & DashboardDirekturController**:
    *   `DB::raw(1)` di dalam klausa `whereExists`.
    *   `DB::raw('count(distinct k.kegiatan_id) as total')`
    *   `DB::raw('sum(tka.jumlah_diusulkan) as total')`
    *   `DB::raw('sum(COALESCE(tka.realisasi_volume1, 1) * ... * COALESCE(tka.realisasi_harga_satuan, 0)) as total')`
    *   *Analisis*: Seluruh penggunaan `DB::raw` di atas hanya berisi nama kolom, konstanta angka, atau perhitungan logika bawaan SQL (COALESCE/perkalian). Tidak ada input dari form pengguna yang disisipkan ke dalam fungsi `DB::raw` tersebut, sehingga tidak ada celah eksploitasi SQLi.

---

### 4. Mekanisme Proteksi Bawaan Laravel yang Aktif
Aplikasi SIGAP-Laravel memanfaatkan fitur keamanan bawaan framework Laravel 11:
1.  **Eloquent ORM**: Seluruh pencarian data berbasis model seperti `User::where('username', $username)->first()` menggunakan PDO Parameter Binding secara otomatis di latar belakang.
2.  **Query Builder**: Pemanggilan database via `DB::table('t_kak')->where('status_id', $statusId)` aman secara otomatis.
3.  **Strict Data Typing**: Parameter routing (misalnya `{id}`) divalidasi bertipe integer sebelum diproses ke database.

### 5. Kesimpulan & Rekomendasi
*   **Status**: **LULUS AUDIT (Aman)**.
*   **Rekomendasi Berkelanjutan**:
    *   Selalu gunakan placeholder `?` atau named bindings `:name` jika terpaksa menggunakan `DB::raw` atau `whereRaw` di masa depan.
    *   Hindari interpolasi string langsung (contoh salah: `whereRaw("name = '$input'")`).
