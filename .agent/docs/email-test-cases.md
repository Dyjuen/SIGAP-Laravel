# Dokumen Test Case Otomatisasi Email SIGAP

Dokumen ini digunakan untuk memverifikasi alur pengiriman email (background queue) pada sistem SIGAP-Laravel.

## Bagian 0: Data Uji (Testing Data)
Gunakan akun-akun berikut untuk melakukan pengujian alur lengkap agar email masuk ke kotak masuk yang Anda kontrol:

| Peran | Username | Nama Lengkap | Email Tujuan (Hasil Update Seeder) |
|:---|:---|:---|:---|
| **Pengusul (Jurusan)** | `jurusantik` | Admin Jurusan TIK | **rafifdwiarka123@gmail.com** |
| **Verifikator** | `verifikator1` | Verifikator Akademik | **rafifdwiarka321@gmail.com** |
| **PPK** | `ppk` | Falih Elmanda | **m.rafifdwiarka@gmail.com** |
| **Wadir** | `wadir2` | Utami Puji Lestari | **muhammad.rafif.dwiarka.tik24@stu.pnj.ac.id** |
| **Bendahara** | `bendahara` | Mba Amanah | **diktek2.himatik.pnj@gmail.com** |

---

## 1. Alur Kerja KAK (Kerangka Acuan Kerja)
*Gunakan akun `jurusantik` untuk submit, dan `verifikator1` untuk proses pemeriksaan.*

| ID | Event | Pemicu (Aksi User) | Email Tujuan | Notifikasi Ke |
|:---|:---|:---|:---|:---|
| KAK-01 | **Submit KAK** | `jurusantik` klik Submit | **rafifdwiarka321@gmail.com** | Verifikator |
| KAK-02 | **KAK Disetujui** | `verifikator1` klik Approve | **rafifdwiarka123@gmail.com** | Pengusul |
| KAK-03 | **KAK Direvisi** | `verifikator1` klik Revisi | **rafifdwiarka123@gmail.com** | Pengusul |
| KAK-04 | **KAK Ditolak** | `verifikator1` klik Reject | **rafifdwiarka123@gmail.com** | Pengusul |
| KAK-05 | **Resubmit KAK** | `jurusantik` klik Submit Ulang | **rafifdwiarka321@gmail.com** | Verifikator |

## 2. Alur Persetujuan Kegiatan
*Email dikirim ke Pengusul setelah Pejabat (PPK/Wadir) memberikan persetujuan.*

| ID | Event | Pemicu (Aksi User) | Email Tujuan | Notifikasi Ke |
|:---|:---|:---|:---|:---|
| ACT-01 | **Persetujuan PPK** | `ppk` klik Approve | **rafifdwiarka123@gmail.com** | Pengusul |
| ACT-02 | **Persetujuan Wadir** | `wadir2` klik Approve | **rafifdwiarka123@gmail.com** | Pengusul |

## 3. Alur Pencairan Dana
*Email dikirim saat Bendahara menyelesaikan proses pencairan.*

| ID | Event | Pemicu (Aksi User) | Email Tujuan | Notifikasi Ke |
|:---|:---|:---|:---|:---|
| FND-01 | **Dana Cair** | `bendahara` klik Selesai Cair | **rafifdwiarka123@gmail.com** | Pengusul |

## 4. Alur Kerja LPJ (Laporan Pertanggungjawaban)
*Gunakan `jurusantik` untuk submit LPJ, dan `bendahara` untuk verifikasi.*

| ID | Event | Pemicu (Aksi User) | Email Tujuan | Notifikasi Ke |
|:---|:---|:---|:---|:---|
| LPJ-01 | **Submit LPJ** | `jurusantik` klik Submit LPJ | **diktek2.himatik.pnj@gmail.com** | Bendahara |
| LPJ-02 | **LPJ Direvisi** | `bendahara` klik Revisi | **rafifdwiarka123@gmail.com** | Pengusul |
| LPJ-03 | **Resubmit LPJ** | `jurusantik` klik Submit Ulang | **diktek2.himatik.pnj@gmail.com** | Bendahara |
| LPJ-04 | **LPJ Disetujui** | `bendahara` klik Approve | **rafifdwiarka123@gmail.com** | Pengusul |
| LPJ-05 | **LPJ Selesai** | `bendahara` klik Selesai | **rafifdwiarka123@gmail.com** | Pengusul |

## 5. Administrasi Akun
*Admin mengubah password salah satu user di atas.*

| ID | Event | Pemicu (Aksi User) | Email Tujuan | Notifikasi Ke |
|:---|:---|:---|:---|:---|
| ACC-01 | **Reset Password** | Admin reset pass `jurusantik` | **rafifdwiarka123@gmail.com** | User Terkait |

---

## Cara Verifikasi (Testing)
1.  **Jalankan Seeder**: Jalankan `php artisan db:seed --class=UpdateUserEmailsSeeder` untuk menerapkan alamat email di atas.
2.  **Queue**: Jalankan `php artisan queue:work` di terminal agar email diproses di background.
3.  **Inbox**: Cek kotak masuk email Gmail/Student Anda sesuai tabel di atas.
