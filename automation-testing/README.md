# SIGAP-Laravel — Automation Testing Suite

## 📋 Ringkasan

Suite pengujian otomatis untuk fitur **Ajukan Kegiatan** (AK-F-001 ~ AK-F-012) pada aplikasi SIGAP-Laravel.

### Tools yang Digunakan

| Tool | Versi | Kategori | Lisensi |
|------|-------|----------|---------|
| [Playwright](https://playwright.dev/) | 1.49+ | UI Functional Testing | Apache 2.0 |
| [Newman](https://github.com/postmanlabs/newman) | latest | API Testing (Postman CLI) | Apache 2.0 |
| [k6](https://k6.io/) | latest | Load/Performance Testing | AGPL-3.0 |

> Semua tools **100% gratis, open-source, dan mudah di-custom**.

---

## 🗂️ Struktur Direktori

```
automation-testing/
├── playwright/                    # UI Functional Tests
│   ├── tests/
│   │   ├── kegiatan-validasi.spec.js      # AK-F-001, 002, 003, 008, 011
│   │   ├── kegiatan-otorisasi.spec.js     # AK-F-004
│   │   ├── kegiatan-crud.spec.js          # AK-F-005, 006, 007
│   │   ├── kegiatan-ui.spec.js            # AK-F-009, 010
│   │   └── kegiatan-xss.spec.js           # AK-F-012
│   ├── helpers/
│   │   └── auth.js                        # Login helper & user credentials
│   ├── test-data/                         # Auto-generated test files
│   ├── playwright.config.js
│   └── package.json
│
├── postman/                       # API Tests
│   ├── SIGAP-Kegiatan.postman_collection.json
│   ├── SIGAP-Local.postman_environment.json
│   └── run-newman.bat
│
├── k6/                            # Load/Performance Tests
│   ├── scripts/
│   │   ├── login-load.js                  # 50 VUs, 30s
│   │   ├── kegiatan-index-load.js         # 100 VUs, 75s
│   │   └── kegiatan-store-load.js         # 20 VUs, 40s
│   └── run-k6.bat
│
├── reports/                       # Auto-generated (gitignored)
│   ├── playwright/                # HTML report + screenshots
│   ├── newman/                    # HTML report
│   └── k6/                        # JSON metrics
│
└── README.md                      # Dokumentasi ini
```

---

## 🖥️ SIGAP Test Runner Dashboard (GUI)

Dashboard interaktif berbasis web untuk mengimpor skenario spreadsheet (CSV/TSV), mengelola data test case secara dinamis, dan memicu pengujian otomatis (Playwright) langsung dari UI web dengan memetakan hasilnya kembali ke baris tabel.

### Fitur Utama:
1. **Spreadsheet Grid Grid**: Grid interaktif yang mendukung editing sel inline, filter, pencarian, multi-seleksi, checkbox bulk actions (Set Pass/Fail/Skip/Delete), dan tambah baris baru secara manual dengan auto-increment ID.
2. **Flexible Importer**: Drag-and-drop file atau paste langsung dari Excel/Google Sheets dengan opsi timpa (replace), tambah (append), atau gabung berdasarkan ID (merge).
3. **Automated Testing Bridge**: Menjalankan Playwright test suite secara background dan sinkronisasi hasil secara langsung ke baris tabel.

### Cara Menjalankan Dashboard:
1. **Buka Dashboard**: Cukup klik dua kali `automation-testing/index.html` atau buka lewat browser.
2. **Jalankan Server Pendamping**: Agar dashboard bisa memicu Playwright otomatis, jalankan server pendamping lokal:
   ```bash
   cd automation-testing
   node server.js
   ```
   *Server pendamping akan berjalan di `http://localhost:3001`.*
3. Klik tombol **⚡ Jalankan Auto Test** di dashboard untuk memulai sinkronisasi otomatis!

---


## 🔧 Prasyarat

### Sistem
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Laravel app** berjalan di `http://localhost:8000`
- **Database** sudah di-seed (`php artisan db:seed`)

### Install Tools

```bash
# 1. Playwright (dari folder playwright)
cd automation-testing/playwright
npm install
npx playwright install chromium

# 2. Newman (global)
npm install -g newman newman-reporter-htmlextra

# 3. k6 (via winget di Windows)
winget install k6 --source winget
# Atau download dari: https://github.com/grafana/k6/releases
```

---

## 🚀 Cara Menjalankan

### Pastikan Laravel app berjalan terlebih dahulu:
```bash
# Di terminal terpisah, dari root project SIGAP-Laravel:
php artisan serve
```

### 1️⃣ Playwright — UI Functional Tests

```bash
cd automation-testing/playwright

# Jalankan semua tests
npx playwright test

# Jalankan test tertentu
npx playwright test kegiatan-validasi      # AK-F-001, 002, 003, 008, 011
npx playwright test kegiatan-otorisasi     # AK-F-004
npx playwright test kegiatan-crud          # AK-F-005, 006, 007
npx playwright test kegiatan-ui            # AK-F-009, 010
npx playwright test kegiatan-xss           # AK-F-012

# Jalankan dengan browser terbuka (headed mode)
npx playwright test --headed

# Buka UI interactive mode
npx playwright test --ui

# Lihat HTML report setelah test selesai
npx playwright show-report ../reports/playwright
```

### 2️⃣ Newman — API Tests

```bash
cd automation-testing/postman

# Jalankan via batch script
run-newman.bat

# Atau manual:
npx newman run SIGAP-Kegiatan.postman_collection.json \
  -e SIGAP-Local.postman_environment.json \
  -r cli,htmlextra \
  --reporter-htmlextra-export ../reports/newman/report.html
```

### 3️⃣ k6 — Load/Performance Tests

```bash
cd automation-testing/k6

# Jalankan semua load tests
run-k6.bat

# Jalankan test spesifik
run-k6.bat login     # Login endpoint
run-k6.bat index     # Monitoring page
run-k6.bat store     # Store endpoint

# Atau manual:
k6 run scripts/login-load.js
k6 run scripts/kegiatan-index-load.js
k6 run scripts/kegiatan-store-load.js
```

---

## 📊 Mapping Test Case → Test File

| ID | Skenario | Tool | File Test |
|----|----------|------|-----------|
| AK-F-001 | Validasi Field Wajib | Playwright + Newman | `kegiatan-validasi.spec.js` |
| AK-F-002 | Validasi Tipe File | Playwright + Newman | `kegiatan-validasi.spec.js` |
| AK-F-003 | Validasi Ukuran File | Playwright + Newman | `kegiatan-validasi.spec.js` |
| AK-F-004 | Otorisasi Role | Playwright + Newman | `kegiatan-otorisasi.spec.js` |
| AK-F-005 | Pencarian Nama | Playwright | `kegiatan-crud.spec.js` |
| AK-F-006 | Edit Draft | Playwright | `kegiatan-crud.spec.js` |
| AK-F-007 | Hapus Draft | Playwright | `kegiatan-crud.spec.js` |
| AK-F-008 | Validasi Karakter Max | Playwright | `kegiatan-validasi.spec.js` |
| AK-F-009 | Navigasi Halaman | Playwright | `kegiatan-ui.spec.js` |
| AK-F-010 | Loading State | Playwright | `kegiatan-ui.spec.js` |
| AK-F-011 | Validasi Tanggal | Playwright | `kegiatan-validasi.spec.js` |
| AK-F-012 | XSS Prevention | Playwright + Newman | `kegiatan-xss.spec.js` |

---

## 📝 Membaca Hasil Testing

### Playwright Reports
- **Lokasi**: `reports/playwright/index.html`
- **Screenshots**: Otomatis diambil saat test gagal + setiap akhir test case
- **Cara buka**: `npx playwright show-report ../reports/playwright`

### Newman Reports
- **Lokasi**: `reports/newman/report.html`
- **Isi**: Status pass/fail per API request, response time, assertion results
- **Cara buka**: Double-click file HTML

### k6 Reports
- **Lokasi**: `reports/k6/*.json`
- **Console output**: Summary langsung di terminal (p95, avg, min, max)
- **Metrik utama**:
  - `http_req_duration` — Response time (avg, p95, max)
  - `http_req_failed` — Persentase request gagal
  - `iterations` — Jumlah total iterasi

---

## 🔐 Referensi Kredensial (dari UserSeeder.php)

| Username | Password | Role | Role ID |
|----------|----------|------|---------|
| admin | admin123 | Admin | 1 |
| verifikator1 | verif1123 | Verifikator | 2 |
| jurusantik | tik123 | Pengusul | 3 |
| ppk | ppk123 | PPK | 4 |
| wadir2 | wadir2123 | Wadir | 5 |
| bendahara | bendahara123 | Bendahara | 6 |
| rektorat | rektorat123 | Rektorat | 7 |

---

## ⚙️ Konfigurasi

### Mengubah Base URL
Jika app berjalan di port/URL berbeda:

**Playwright** (`playwright.config.js`):
```javascript
use: {
  baseURL: 'http://localhost:8080', // Ubah di sini
}
```

**Newman**: Edit file `SIGAP-Local.postman_environment.json`, ubah value `base_url`.

**k6**: Gunakan environment variable:
```bash
k6 run -e BASE_URL=http://localhost:8080 scripts/login-load.js
```

---

## 🛠️ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `npx playwright test` gagal | Jalankan `npx playwright install chromium` |
| Login gagal di test | Pastikan database sudah di-seed: `php artisan db:seed` |
| k6 not found | Install: `winget install k6 --source winget` |
| Newman not found | Install: `npm install -g newman newman-reporter-htmlextra` |
| 419 (CSRF Token Mismatch) | Pastikan Laravel app berjalan dan session berfungsi |
| Test timeout | Naikkan timeout di `playwright.config.js` atau periksa koneksi |

---

## 📄 Lisensi

Semua tools yang digunakan bersifat open-source:
- **Playwright**: Apache License 2.0
- **Newman**: Apache License 2.0
- **k6**: GNU AGPL v3.0
