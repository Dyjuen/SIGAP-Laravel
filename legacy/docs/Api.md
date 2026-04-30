# Dokumentasi API SIGAP-PNJ

Dokumen ini menyediakan ringkasan dari seluruh endpoint API yang tersedia dalam sistem SIGAP-PNJ.

**URL Base**: `/api`

## 1. Rute Publik

Endpoint yang dapat diakses tanpa autentikasi.

---

### **Generate Captcha**

Menghasilkan gambar captcha untuk form login.

- **Endpoint**: `GET /captcha`
- **Hak Akses**: Publik
- **Content Diterima**: -
- **Body JSON**: -
- **Expected Result**:
  - **Success (200)**: Mengembalikan gambar `image/jpeg`.
  - **Error (500)**: Jika library GD tidak terinstal di server.

---

### **Login Pengguna**

Mengautentikasi pengguna dan mengembalikan token JWT.

- **Endpoint**: `POST /auth/login`
- **Hak Akses**: Publik
- **Content Diterima**: `application/json`
- **Body JSON**:
  ```json
  {
    "username": "admin",
    "password": "admin123",
    "captcha": "_MY_TEST_CAPTCHA_"
  }
  ```
- **Expected Result**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "message": "Login berhasil",
      "data": {
        "token": "jwt.token.string",
        "token_type": "Bearer",
        "expires_in": 86400,
        "user": {
          "user_id": 1,
          "username": "user_test",
          "nama_lengkap": "User Test",
          "email": "test@example.com",
          "roles": ["Pengusul"]
        }
      }
    }
    ```
  - **Error (400)**: Jika `username`, `password`, atau `captcha` tidak diisi, atau captcha salah.
  - **Error (401)**: Jika `username` atau `password` salah.

## 2. Rute Autentikasi

Endpoint yang terkait dengan manajemen sesi pengguna yang sudah login. Membutuhkan header `Authorization: Bearer <token>`.

---

### **Logout Pengguna**

Memberi sinyal kepada client untuk menghapus token.

- **Endpoint**: `POST /auth/logout`
- **Hak Akses**: Pengguna Terautentikasi
- **Content Diterima**: -
- **Body JSON**: -
- **Expected Result**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "message": "Logout berhasil. Token harus dihapus dari client."
    }
    ```

---

### **Refresh Token**

Memperbarui token JWT yang akan segera kedaluwarsa.

- **Endpoint**: `POST /auth/refresh`
- **Hak Akses**: Pengguna Terautentikasi
- **Content Diterima**: -
- **Body JSON**: -
- **Expected Result**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "message": "Token berhasil di-refresh",
      "data": {
        "token": "new.jwt.token.string",
        "token_type": "Bearer",
        "expires_in": 86400
      }
    }
    ```

---

### **Lihat Profil**

Mengambil data profil pengguna yang sedang login.

- **Endpoint**: `GET /auth/profile`
- **Hak Akses**: Pengguna Terautentikasi
- **Content Diterima**: -
- **Body JSON**: -
- **Expected Result**:
  - **Success (200)**: Mengembalikan data profil pengguna beserta rolenya.
  - **Error (401)**: Jika token tidak valid.

## 3. Rute Admin

Endpoint khusus untuk manajemen pengguna oleh Admin.

---

### **Registrasi Pengguna Baru**

Mendaftarkan pengguna baru ke dalam sistem.

- **Endpoint**: `POST /admin/register`
- **Hak Akses**: Admin
- **Content Diterima**: `application/json`
- **Body JSON**:
  ```json
  {
    "username": "new_user",
    "password": "password_baru",
    "nama_lengkap": "Nama User Baru",
    "email": "new@example.com",
    "role_ids": [2] // Array of role IDs
  }
  ```
- **Expected Result**:
  - **Success (201)**: Mengembalikan data pengguna yang baru dibuat.
  - **Error (400)**: Jika validasi gagal (field kosong, format salah).
  - **Error (409)**: Jika `username` atau `email` sudah ada.

---

### **Lihat Semua Pengguna**

Mengambil daftar semua pengguna yang terdaftar.

- **Endpoint**: `GET /admin/users`
- **Hak Akses**: Admin
- **Content Diterima**: -
- **Body JSON**: -
- **Expected Result**:
  - **Success (200)**: Mengembalikan array berisi data semua pengguna.

---

### **Update Pengguna**

Memperbarui data pengguna berdasarkan ID.

- **Endpoint**: `PUT /admin/users/{id}`
- **Hak Akses**: Admin
- **Content Diterima**: `application/json`
- **Body JSON**:
  ```json
  {
    "nama_lengkap": "Nama Lengkap Update",
    "email": "update@example.com",
    "role_ids": [2, 3]
  }
  ```
- **Expected Result**:
  - **Success (200)**: Mengembalikan data pengguna yang telah diupdate.
  - **Error (404)**: Jika user tidak ditemukan.
  - **Error (422)**: Jika validasi gagal.

---

### **Ubah Password Pengguna**

Mengubah password pengguna lain oleh Admin.

- **Endpoint**: `PUT /admin/users/{id}/change-password`
- **Hak Akses**: Admin
- **Content Diterima**: `application/json`
- **Body JSON**:
  ```json
  {
    "new_password": "password_baru_aman",
    "new_password_confirmation": "password_baru_aman"
  }
  ```
- **Expected Result**:
  - **Success (200)**: Pesan sukses.
  - **Error (404)**: Jika user tidak ditemukan.
  - **Error (422)**: Jika password tidak cocok atau kurang dari 8 karakter.

## 4. Rute KAK (Kerangka Acuan Kerja)

Endpoint untuk mengelola dokumen KAK.

---

### **Download KAK (PDF)**

- **Endpoint**: `GET /kak/{telaah_id}`
- **Hak Akses**: Pengguna Terautentikasi
- **Expected Result**: File PDF akan terunduh.

### **Preview KAK (HTML)**

- **Endpoint**: `GET /kak/{telaah_id}/preview`
- **Hak Akses**: Pengguna Terautentikasi
- **Expected Result**: Tampilan HTML dari KAK.

### **Data KAK (JSON)**

- **Endpoint**: `GET /kak/{telaah_id}/data`
- **Hak Akses**: Pengguna Terautentikasi
- **Expected Result**: Data KAK dalam format JSON.

## 5. Rute Telaah

Endpoint untuk proses pengajuan dan verifikasi usulan kegiatan (Telaah).

- **`GET /telaah`**: Melihat semua data telaah.
- **`POST /telaah`**: Membuat draft telaah baru.
- **`GET /telaah/{id}`**: Melihat detail sebuah telaah.
- **`POST /telaah/{id}/submit`**: Pengusul mengajukan telaah untuk diverifikasi.
- **`POST /telaah/{id}/resubmit`**: Pengusul mengajukan kembali telaah setelah revisi.
- **`POST /telaah/{id}/approve`**: Verifikator menyetujui telaah.
- **`POST /telaah/{id}/reject`**: Verifikator menolak telaah.
- **`POST /telaah/{id}/revise`**: Verifikator meminta revisi pada telaah.

## 6. Rute Kegiatan

Endpoint untuk manajemen kegiatan yang sudah disetujui dari telaah.

- **`GET /kegiatan`**: Melihat daftar kegiatan dengan filter.
- **`POST /kegiatan`**: Membuat kegiatan baru dari telaah yang disetujui.
  - **Content**: `multipart/form-data`
  - **Body**: `telaah_id` (number), `surat_pengantar` (file).
- **`GET /kegiatan/{id}`**: Melihat detail kegiatan.
- **`POST /kegiatan/{id}/revise`**: Approver meminta revisi.
- **`POST /kegiatan/{id}/approve`**: Approver (PPK, Wadir, Bendahara) menyetujui tahapan.
- **`GET /kegiatan/{id}/logs`**: Melihat riwayat status kegiatan.
- **`POST /kegiatan/{id}/duplicate`**: Menduplikasi kegiatan.
- **`POST /kegiatan/{id}/cairkan`**: Bendahara mencatat pencairan dana.
  - **Body**: `{ "nominal": 1000000 }`
- **`GET /kegiatan/export/excel`**: Mengekspor data kegiatan ke Excel.
- **`GET /kegiatan/statistics/dashboard`**: Melihat statistik kegiatan.

## 7. Rute Lampiran Kegiatan

Endpoint untuk mengelola file lampiran pada sebuah kegiatan.

- **`GET /kegiatan/{id}/lampiran`**: Melihat semua lampiran.
- **`POST /kegiatan/{id}/lampiran`**: Mengunggah lampiran baru.
  - **Content**: `multipart/form-data`
  - **Body**: `file` (file), `keterangan` (string, opsional).
- **`GET /kegiatan/{id}/lampiran/{file_id}`**: Mengunduh file lampiran.
- **`DELETE /kegiatan/{id}/lampiran/{file_id}`**: Menghapus file lampiran.

## 8. Rute Pencairan Dana

Endpoint untuk melihat informasi terkait pencairan dana. Proses pencairan itu sendiri dilakukan melalui `POST /kegiatan/{id}/cairkan`.

---

### **Lihat Riwayat Pencairan**

Melihat riwayat pencairan dana untuk satu kegiatan.

- **Endpoint**: `GET /pencairan/kegiatan/{kegiatan_id}`
- **Hak Akses**: Pengguna Terautentikasi
- **Expected Result**:
  - **Success (200)**: Mengembalikan array berisi daftar transaksi pencairan.

---

### **Cek Sisa Dana**

Melihat sisa dana yang belum dicairkan dari total anggaran kegiatan.

- **Endpoint**: `GET /pencairan/sisa-dana/{kegiatan_id}`
- **Hak Akses**: Pengguna Terautentikasi
- **Expected Result**:
  - **Success (200)**:
    ```json
    {
        "success": true,
        "data": {
            "total_anggaran": 10000000,
            "total_dicairkan": 2500000,
            "sisa_dana": 7500000
        }
    }
    ```