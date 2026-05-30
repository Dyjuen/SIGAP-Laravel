/**
 * ============================================================================
 * SIGAP-Laravel Automation Testing
 * Test File: kegiatan-validasi.spec.js
 * ============================================================================
 * 
 * Covers Test Cases:
 *   AK-F-001: Validasi Field Wajib (penanggung_jawab = "")
 *   AK-F-002: Validasi Tipe File (upload .jpg)
 *   AK-F-003: Validasi Ukuran File (6MB PDF)
 *   AK-F-008: Validasi Karakter Max (1001 chars)
 *   AK-F-011: Validasi Tanggal (end_date < start_date)
 * 
 * Prerequisites:
 *   - Laravel app running at http://localhost:8000
 *   - Database seeded with UserSeeder + MasterDataSeeder
 *   - At least one KAK with status "Disetujui Verifikator" (status_id = 3)
 */

const { test, expect } = require('@playwright/test');
const { login, USERS } = require('../../helpers/auth');
const path = require('path');
const fs = require('fs');

// ─── Setup: Ensure test data files exist ──────────────────────────────────────

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  const testDataDir = path.join(__dirname, '..', 'test-data');
  
  // Create test-data directory if it doesn't exist
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }

  // Create a small JPG file for AK-F-002 (invalid file type test)
  const jpgPath = path.join(testDataDir, 'gambar_kegiatan.jpg');
  if (!fs.existsSync(jpgPath)) {
    // Minimal JPEG header (valid enough for upload)
    const jpgBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
      0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
      0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9
    ]);
    fs.writeFileSync(jpgPath, jpgBuffer);
  }

  // Create a 6MB PDF file for AK-F-003 (oversized file test)
  const largePdfPath = path.join(testDataDir, 'dokumen_besar.pdf');
  if (!fs.existsSync(largePdfPath)) {
    // Create a minimal PDF with padding to reach ~6MB
    const pdfHeader = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
    const pdfPage = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
    const pdfContent = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n';
    const padding = 'X'.repeat(6 * 1024 * 1024); // ~6MB of padding
    const pdfFooter = `\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n${pdfHeader.length + pdfPage.length + pdfContent.length}\n%%EOF`;
    fs.writeFileSync(largePdfPath, pdfHeader + pdfPage + pdfContent + padding + pdfFooter);
  }

  // Create a valid small PDF for passing tests
  const validPdfPath = path.join(testDataDir, 'surat_valid.pdf');
  if (!fs.existsSync(validPdfPath)) {
    const pdf = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF';
    fs.writeFileSync(validPdfPath, pdf);
  }
});

// ─── AK-F-001: Validasi Field Wajib ──────────────────────────────────────────
test.describe('AK-F-001: Validasi Field Wajib', () => {
  test('Menampilkan error ketika penanggung_jawab kosong', async ({ page }) => {
    // 1. Login sebagai Pengusul
    await login(page, USERS.PENGUSUL);

    // 2. Navigate ke halaman Kegiatan
    await page.goto('/kegiatan');
    await page.waitForLoadState('networkidle');

    // 3. Cari tombol "Ajukan Kegiatan" pada salah satu KAK yang approved
    //    Tombol ini berada di tabel KegiatanPengusulTable
    const ajukanButton = page.locator('button:has-text("Ajukan"), button:has-text("ajukan")').first();
    
    // Jika tidak ada KAK yang approved, skip test
    if (!(await ajukanButton.isVisible().catch(() => false))) {
      test.skip(true, 'Tidak ada KAK yang disetujui untuk diuji. Seed database terlebih dahulu.');
      return;
    }

    await ajukanButton.click();

    // 4. Tunggu modal muncul
    await page.waitForSelector('h3:has-text("Ajukan Kegiatan")', { state: 'visible' });

    // 5. Kosongkan field penanggung_jawab (sudah kosong by default)
    //    Isi pelaksana agar hanya penanggung_jawab yang error
    await page.fill('input[placeholder*="pelaksana"]', 'Jane Doe');

    // 6. Upload file valid
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '..', 'test-data', 'surat_valid.pdf'));

    // 7. Submit form
    await page.click('button[type="submit"]:has-text("Ajukan")');

    // 8. Tunggu response - karena ada HTML required attribute, browser akan menampilkan
    //    native validation. Atau jika server-side, tunggu error message
    //    Cek apakah ada pesan error dari server
    const errorMessage = page.locator('text=wajib diisi, text=Penanggung Jawab wajib');
    const nativeValidation = page.locator('input:invalid');
    
    // Harapan: salah satu dari native validation atau server error muncul
    const hasError = await Promise.race([
      errorMessage.first().waitFor({ timeout: 5000 }).then(() => 'server'),
      nativeValidation.first().waitFor({ timeout: 5000 }).then(() => 'native'),
    ]).catch(() => 'timeout');

    expect(['server', 'native']).toContain(hasError);
    
    // Screenshot sebagai bukti
    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-001-validasi-field-wajib.png'),
      fullPage: true 
    });
  });
});

// ─── AK-F-002: Validasi Tipe File ────────────────────────────────────────────
test.describe('AK-F-002: Validasi Tipe File', () => {
  test('Menampilkan error ketika upload file JPG', async ({ page }) => {
    await login(page, USERS.PENGUSUL);
    await page.goto('/kegiatan');
    await page.waitForLoadState('networkidle');

    const ajukanButton = page.locator('button:has-text("Ajukan"), button:has-text("ajukan")').first();
    
    if (!(await ajukanButton.isVisible().catch(() => false))) {
      test.skip(true, 'Tidak ada KAK yang disetujui.');
      return;
    }

    await ajukanButton.click();
    await page.waitForSelector('h3:has-text("Ajukan Kegiatan")', { state: 'visible' });

    // Isi semua field
    await page.fill('input[placeholder*="penanggung jawab"]', 'John Doe');
    await page.fill('input[placeholder*="pelaksana"]', 'Jane Doe');

    // Upload file JPG (tipe tidak valid)
    const fileInput = page.locator('input[type="file"]');
    
    // Remove the accept attribute temporarily to allow JPG upload
    await fileInput.evaluate(el => el.removeAttribute('accept'));
    await fileInput.setInputFiles(path.join(__dirname, '..', 'test-data', 'gambar_kegiatan.jpg'));

    // Submit form
    await page.click('button[type="submit"]:has-text("Ajukan")');

    // Tunggu pesan error validasi dari server
    // Expected: "Surat Pengantar harus berupa file dengan format: pdf, doc, docx."
    const errorMessage = page.locator('p.text-red-500, .text-red-500').filter({ hasText: /format|mimes|pdf|doc/i });
    
    await expect(errorMessage.first()).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-002-validasi-tipe-file.png'),
      fullPage: true 
    });
  });
});

// ─── AK-F-003: Validasi Ukuran File ──────────────────────────────────────────
test.describe('AK-F-003: Validasi Ukuran File', () => {
  test('Menampilkan error ketika upload file lebih dari 5MB', async ({ page }) => {
    await login(page, USERS.PENGUSUL);
    await page.goto('/kegiatan');
    await page.waitForLoadState('networkidle');

    const ajukanButton = page.locator('button:has-text("Ajukan"), button:has-text("ajukan")').first();
    
    if (!(await ajukanButton.isVisible().catch(() => false))) {
      test.skip(true, 'Tidak ada KAK yang disetujui.');
      return;
    }

    await ajukanButton.click();
    await page.waitForSelector('h3:has-text("Ajukan Kegiatan")', { state: 'visible' });

    // Isi semua field
    await page.fill('input[placeholder*="penanggung jawab"]', 'John Doe');
    await page.fill('input[placeholder*="pelaksana"]', 'Jane Doe');

    // Upload file 6MB (melebihi batas 5MB/5120KB)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '..', 'test-data', 'dokumen_besar.pdf'));

    // Submit
    await page.click('button[type="submit"]:has-text("Ajukan")');

    // Expected error: "Surat Pengantar maksimal 5120 KB."
    const errorMessage = page.locator('p.text-red-500, .text-red-500').filter({ hasText: /maksimal|5120|ukuran|size/i });
    
    await expect(errorMessage.first()).toBeVisible({ timeout: 15_000 });

    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-003-validasi-ukuran-file.png'),
      fullPage: true 
    });
  });
});

// ─── AK-F-008: Validasi Karakter Max ─────────────────────────────────────────
test.describe('AK-F-008: Validasi Karakter Max', () => {
  test('Menampilkan error ketika input melebihi batas karakter', async ({ page }) => {
    await login(page, USERS.PENGUSUL);
    await page.goto('/kegiatan');
    await page.waitForLoadState('networkidle');

    const ajukanButton = page.locator('button:has-text("Ajukan"), button:has-text("ajukan")').first();
    
    if (!(await ajukanButton.isVisible().catch(() => false))) {
      test.skip(true, 'Tidak ada KAK yang disetujui.');
      return;
    }

    await ajukanButton.click();
    await page.waitForSelector('h3:has-text("Ajukan Kegiatan")', { state: 'visible' });

    // Input penanggung_jawab dengan 256 karakter (max = 255)
    const longString = 'A'.repeat(256);
    await page.fill('input[placeholder*="penanggung jawab"]', longString);
    await page.fill('input[placeholder*="pelaksana"]', 'Jane Doe');

    // Upload file valid
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '..', 'test-data', 'surat_valid.pdf'));

    // Submit form
    await page.click('button[type="submit"]:has-text("Ajukan")');

    // Expected: "Penanggung Jawab maksimal 255 karakter."
    const errorMessage = page.locator('p.text-red-500, .text-red-500').filter({ hasText: /maksimal|karakter|max/i });
    
    await expect(errorMessage.first()).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-008-validasi-karakter-max.png'),
      fullPage: true 
    });
  });
});

// ─── AK-F-011: Validasi Tanggal ──────────────────────────────────────────────
test.describe('AK-F-011: Validasi Tanggal', () => {
  test('Menampilkan error ketika tanggal selesai sebelum tanggal mulai', async ({ page }) => {
    await login(page, USERS.PENGUSUL);
    
    // Navigasi ke halaman KAK create (di mana ada validasi tanggal)
    // Validasi tanggal ada di form Update Kegiatan / KAK form
    await page.goto('/kak/create');
    await page.waitForLoadState('networkidle');

    // Cari field tanggal mulai dan tanggal selesai
    const tanggalMulai = page.locator('input[name="tanggal_mulai"], #tanggal_mulai, [data-testid="tanggal-mulai"]').first();
    const tanggalSelesai = page.locator('input[name="tanggal_selesai"], #tanggal_selesai, [data-testid="tanggal-selesai"]').first();

    if (await tanggalMulai.isVisible().catch(() => false)) {
      // Set tanggal mulai = besok
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Set tanggal selesai = kemarin (lebih awal dari mulai)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      await tanggalMulai.fill(tomorrowStr);
      await tanggalSelesai.fill(yesterdayStr);

      // Isi field lain yang required
      const namaKegiatan = page.locator('input[name="nama_kegiatan"], #nama_kegiatan').first();
      if (await namaKegiatan.isVisible().catch(() => false)) {
        await namaKegiatan.fill('Test Kegiatan Validasi Tanggal');
      }

      // Klik submit
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();

      // Expected: error tentang tanggal
      const errorMessage = page.locator('.text-red-500, .text-red-600').filter({ hasText: /tanggal|setelah|after|lebih awal/i });
      
      await expect(errorMessage.first()).toBeVisible({ timeout: 10_000 });
    } else {
      // Jika form tanggal tidak ditemukan di KAK create, coba lewat API
      // Submit via API langsung
      const response = await page.request.put('/kegiatan/1', {
        data: {
          nama_kegiatan: 'Test Validasi Tanggal Update',
          deskripsi_kegiatan: 'Deskripsi test yang cukup panjang untuk memenuhi minimum karakter validasi deskripsi kegiatan.',
          tanggal_mulai: '2026-06-01',
          tanggal_selesai: '2026-05-01', // Sebelum tanggal mulai
          lokasi: 'Jakarta Selatan',
          mata_anggaran_id: 1,
        },
      });
      
      // Expect validation error (422)
      expect(response.status()).toBe(422);
    }

    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-011-validasi-tanggal.png'),
      fullPage: true 
    });
  });
});
