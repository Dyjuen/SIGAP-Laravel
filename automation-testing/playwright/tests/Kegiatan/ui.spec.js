/**
 * ============================================================================
 * SIGAP-Laravel Automation Testing
 * Test File: kegiatan-ui.spec.js
 * ============================================================================
 * 
 * Covers Test Cases:
 *   AK-F-009: Navigasi Halaman (pagination)
 *   AK-F-010: Loading State (button disabled + spinner)
 * 
 * Prerequisites:
 *   - Laravel app running at http://localhost:8000
 *   - Database seeded with enough data for pagination (>10 records)
 *   - DummyKegiatanSeeder recommended
 */

const { test, expect } = require('@playwright/test');
const { login, USERS } = require('../../helpers/auth');
const path = require('path');

// ─── AK-F-009: Navigasi Halaman (Pagination) ────────────────────────────────
test.describe('AK-F-009: Navigasi Halaman', () => {

  test('Tabel me-refresh dan menampilkan data berbeda saat klik halaman 2', async ({ page }) => {
    // 1. Login sebagai Pengusul
    await login(page, USERS.PENGUSUL);

    // 2. Navigate ke monitoring (di mana ada pagination)
    await page.goto('/kegiatan/monitoring');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Tunggu animasi

    // 3. Ambil teks dari baris pertama di halaman 1
    const firstPageFirstRow = page.locator('table tbody tr').first();
    let firstPageText = '';
    
    if (await firstPageFirstRow.isVisible().catch(() => false)) {
      firstPageText = await firstPageFirstRow.textContent() || '';
    }

    // 4. Cek apakah pagination muncul (berarti ada >10 data)
    const paginationLinks = page.locator('nav[aria-label*="Pagination"] a, .pagination a, a[href*="page=2"]');
    const paginationCount = await paginationLinks.count();

    if (paginationCount > 0) {
      // 5. Klik halaman 2
      const page2Link = page.locator('a[href*="page=2"]').first();
      
      if (await page2Link.isVisible().catch(() => false)) {
        await page2Link.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // 6. Verifikasi URL berubah ke page=2
        expect(page.url()).toContain('page=2');

        // 7. Verifikasi data berubah (baris pertama berbeda)
        const secondPageFirstRow = page.locator('table tbody tr').first();
        if (await secondPageFirstRow.isVisible().catch(() => false)) {
          const secondPageText = await secondPageFirstRow.textContent() || '';
          
          // Data di halaman 2 harus berbeda dari halaman 1
          if (firstPageText && secondPageText) {
            expect(secondPageText).not.toBe(firstPageText);
          }
        }

        // 8. Verifikasi nomor urut dimulai dari 11 (untuk page 2 dengan 10 per page)
        const rowNumber = page.locator('table tbody tr td').first();
        if (await rowNumber.isVisible().catch(() => false)) {
          const numberText = await rowNumber.textContent() || '';
          // Nomor bisa "11" atau "011" 
          expect(numberText.trim()).toMatch(/0?11/);
        }
      }
    } else {
      console.log('INFO: Pagination tidak muncul. Data kurang dari 10 records. Jalankan DummyKegiatanSeeder untuk menambah data.');
    }

    // Screenshot
    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-009-navigasi-halaman.png'),
      fullPage: true 
    });
  });
});

// ─── AK-F-010: Loading State ─────────────────────────────────────────────────
test.describe('AK-F-010: Loading State', () => {

  test('Tombol Simpan menjadi disabled dan muncul spinner saat submit', async ({ page }) => {
    // 1. Login sebagai Pengusul
    await login(page, USERS.PENGUSUL);

    // 2. Navigate ke halaman kegiatan
    await page.goto('/kegiatan');
    await page.waitForLoadState('networkidle');

    // 3. Buka modal submit
    const ajukanButton = page.locator('button:has-text("Ajukan"), button:has-text("ajukan")').first();
    
    if (!(await ajukanButton.isVisible().catch(() => false))) {
      test.skip(true, 'Tidak ada KAK yang disetujui. Seed database terlebih dahulu.');
      return;
    }

    await ajukanButton.click();
    await page.waitForSelector('h3:has-text("Ajukan Kegiatan")', { state: 'visible' });

    // 4. Isi form
    await page.fill('input[placeholder*="penanggung jawab"]', 'John Doe');
    await page.fill('input[placeholder*="pelaksana"]', 'Jane Doe');
    
    const fileInput = page.locator('input[type="file"]');
    const testDataPath = path.join(__dirname, '..', 'test-data', 'surat_valid.pdf');
    await fileInput.setInputFiles(testDataPath);

    // 5. Intercept network request agar lambat (untuk melihat loading state)
    await page.route('**/kegiatan', async route => {
      // Delay response selama 3 detik agar spinner terlihat
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.continue();
    });

    // 6. Klik submit dan langsung cek loading state
    const submitButton = page.locator('button[type="submit"]:has-text("Ajukan"), button[type="submit"]:has-text("Memproses")');
    await submitButton.click();

    // 7. Verifikasi bahwa tombol menjadi disabled
    //    Segera setelah click, cek state disabled
    const disabledButton = page.locator('button[type="submit"][disabled]');
    await expect(disabledButton).toBeVisible({ timeout: 2000 });

    // 8. Verifikasi spinner/loading icon muncul
    //    Berdasarkan KegiatanSubmitModal.jsx, saat processing=true:
    //    - Tombol menampilkan SVG spinner (animate-spin)
    //    - Text berubah ke "Memproses..."
    const spinnerOrText = page.locator('.animate-spin, text=Memproses');
    await expect(spinnerOrText.first()).toBeVisible({ timeout: 2000 });

    // Screenshot loading state sebagai bukti
    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-010-loading-state.png'),
      fullPage: true 
    });

    // 9. Hapus route interceptor dan tunggu response selesai
    await page.unroute('**/kegiatan');
  });
});
