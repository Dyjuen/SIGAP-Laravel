/**
 * ============================================================================
 * SIGAP-Laravel Automation Testing
 * Test File: kegiatan-otorisasi.spec.js
 * ============================================================================
 * 
 * Covers Test Cases:
 *   AK-F-004: Otorisasi Role (Login sebagai Verifikator, akses /kegiatan/create)
 * 
 * Expected Result:
 *   - Halaman menampilkan 403 Forbidden
 *   - ATAU tombol 'Tambah'/'Ajukan' tidak ada
 * 
 * Prerequisites:
 *   - Laravel app running at http://localhost:8000
 *   - Database seeded with UserSeeder
 */

const { test, expect } = require('@playwright/test');
const { login, USERS } = require('../helpers/auth');
const path = require('path');

// ─── AK-F-004: Otorisasi Role ────────────────────────────────────────────────
test.describe('AK-F-004: Otorisasi Role', () => {

  test('Verifikator tidak dapat mengajukan kegiatan (403 atau tanpa tombol Ajukan)', async ({ page }) => {
    // 1. Login sebagai Verifikator
    await login(page, USERS.VERIFIKATOR);

    // 2. Coba akses halaman kegiatan index
    const response = await page.goto('/kegiatan');
    
    // Skenario A: Server mengembalikan 403 karena middleware role
    if (response && response.status() === 403) {
      // Test PASS: Verifikator tidak diizinkan akses halaman kegiatan
      expect(response.status()).toBe(403);
      
      await page.screenshot({ 
        path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-004-otorisasi-403.png'),
        fullPage: true 
      });
      return;
    }

    // Skenario B: Halaman bisa diakses tapi tombol "Ajukan" tidak ada
    await page.waitForLoadState('networkidle');

    // Verifikasi bahwa tombol "Ajukan Kegiatan" TIDAK visible untuk Verifikator
    const ajukanButton = page.locator('button:has-text("Ajukan"), button:has-text("ajukan")');
    const tambahButton = page.locator('a:has-text("Tambah"), a:has-text("Usulan Baru")');
    
    // Kedua tombol seharusnya tidak ada
    await expect(ajukanButton).toHaveCount(0);
    await expect(tambahButton).toHaveCount(0);

    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-004-otorisasi-no-button.png'),
      fullPage: true 
    });
  });

  test('Verifikator mendapat 403 saat POST ke /kegiatan (API-level)', async ({ page }) => {
    // 1. Login sebagai Verifikator
    await login(page, USERS.VERIFIKATOR);

    // 2. Coba POST langsung ke endpoint kegiatan
    const response = await page.request.post('/kegiatan', {
      multipart: {
        kak_id: '1',
        penanggung_jawab_manual: 'Hacker Test',
        pelaksana_manual: 'Hacker Test',
        surat_pengantar: {
          name: 'test.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4 test'),
        },
      },
    });

    // Expected: 403 Forbidden (karena StoreKegiatanRequest authorize() return false)
    expect(response.status()).toBe(403);

    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-004-otorisasi-api-403.png'),
      fullPage: true 
    });
  });

  test('PPK tidak dapat mengajukan kegiatan baru', async ({ page }) => {
    // Bonus test: PPK juga tidak boleh submit kegiatan baru
    await login(page, USERS.PPK);

    const response = await page.request.post('/kegiatan', {
      multipart: {
        kak_id: '1',
        penanggung_jawab_manual: 'PPK Test',
        pelaksana_manual: 'PPK Test',
        surat_pengantar: {
          name: 'test.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4 test'),
        },
      },
    });

    // PPK can access the page but cannot submit (authorize returns false)
    expect(response.status()).toBe(403);

    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-004-otorisasi-ppk-403.png'),
      fullPage: true 
    });
  });
});
