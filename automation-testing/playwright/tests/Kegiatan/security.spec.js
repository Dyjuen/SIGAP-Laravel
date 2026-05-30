/**
 * ============================================================================
 * SIGAP-Laravel Automation Testing
 * Test File: kegiatan-xss.spec.js
 * ============================================================================
 * 
 * Covers Test Cases:
 *   AK-F-012: XSS Prevention
 * 
 * Test Input: <script>alert(1)</script>
 * Expected Result: Teks dirender string biasa, script ditolak/dibersihkan
 * 
 * Prerequisites:
 *   - Laravel app running at http://localhost:8000
 *   - Database seeded with UserSeeder
 */

const { test, expect } = require('@playwright/test');
const { login, USERS } = require('../helpers/auth');
const path = require('path');

// ─── AK-F-012: XSS Prevention ───────────────────────────────────────────────
test.describe('AK-F-012: XSS Prevention', () => {

  test('Script tag dirender sebagai plain text, bukan dieksekusi', async ({ page }) => {
    // 1. Login sebagai Pengusul
    await login(page, USERS.PENGUSUL);

    // 2. Navigate ke halaman kegiatan
    await page.goto('/kegiatan');
    await page.waitForLoadState('networkidle');

    // 3. Buka modal submit
    const ajukanButton = page.locator('button:has-text("Ajukan"), button:has-text("ajukan")').first();
    
    if (!(await ajukanButton.isVisible().catch(() => false))) {
      test.skip(true, 'Tidak ada KAK yang disetujui.');
      return;
    }

    await ajukanButton.click();
    await page.waitForSelector('h3:has-text("Ajukan Kegiatan")', { state: 'visible' });

    // 4. Input XSS payload ke field penanggung_jawab
    const xssPayload = '<script>alert(1)</script>';
    await page.fill('input[placeholder*="penanggung jawab"]', xssPayload);
    await page.fill('input[placeholder*="pelaksana"]', xssPayload);

    // 5. Pasang listener untuk dialog (alert/confirm/prompt)
    //    Jika XSS berhasil, alert(1) akan trigger event ini
    let alertTriggered = false;
    page.on('dialog', async dialog => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    // 6. Upload file valid dan submit
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '..', 'test-data', 'surat_valid.pdf'));
    
    await page.click('button[type="submit"]:has-text("Ajukan")');

    // 7. Tunggu response
    await page.waitForTimeout(3000);

    // 8. Verifikasi: TIDAK ADA alert yang triggered
    expect(alertTriggered).toBe(false);

    // Screenshot
    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-012-xss-prevention-submit.png'),
      fullPage: true 
    });
  });

  test('XSS payload di-escape pada halaman detail/monitoring', async ({ page }) => {
    // 1. Login sebagai Pengusul
    await login(page, USERS.PENGUSUL);

    // 2. Navigate ke monitoring
    await page.goto('/kegiatan/monitoring');
    await page.waitForLoadState('networkidle');

    // 3. Pasang listener untuk dialog
    let alertTriggered = false;
    page.on('dialog', async dialog => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    // 4. Cek search field dengan XSS payload
    const searchInput = page.locator('input[placeholder*="Cari"], input[type="text"]').first();
    
    if (await searchInput.isVisible().catch(() => false)) {
      const xssPayload = '<img src=x onerror=alert(1)>';
      await searchInput.fill(xssPayload);
      await page.waitForTimeout(1000);

      // Verifikasi alert tidak terpicu
      expect(alertTriggered).toBe(false);
    }

    // 5. Cek juga via API: input XSS dan periksa response
    const response = await page.request.post('/kegiatan', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      data: {
        kak_id: 1,
        penanggung_jawab_manual: '<script>alert("xss")</script>',
        pelaksana_manual: '<img src=x onerror=alert(1)>',
      },
    });

    // Jika response body contains the payload, it should be escaped
    const body = await response.text();
    
    // Verifikasi bahwa response TIDAK mengandung unescaped script tags
    // Laravel + React secara default escape HTML entities
    expect(body).not.toContain('<script>alert("xss")</script>');
    // Atau jika dikembalikan, harus di-escape
    if (body.includes('alert')) {
      // Pastikan di-escape (HTML entities)
      const hasEscaped = body.includes('&lt;script&gt;') || body.includes('\\u003cscript');
      const hasRaw = body.includes('<script>alert');
      // Harus escaped, bukan raw
      expect(hasRaw).toBe(false);
    }

    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-012-xss-prevention-monitoring.png'),
      fullPage: true 
    });
  });

  test('Multiple XSS vectors ditolak', async ({ page }) => {
    // Test berbagai vektor XSS umum
    const xssVectors = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '"><script>alert(1)</script>',
      "' onmouseover='alert(1)'",
      '<svg onload=alert(1)>',
      'javascript:alert(1)',
    ];

    await login(page, USERS.PENGUSUL);

    for (const vector of xssVectors) {
      // Pasang listener
      let alertTriggered = false;
      const dialogHandler = async (dialog) => {
        alertTriggered = true;
        await dialog.dismiss();
      };
      page.on('dialog', dialogHandler);

      await page.goto('/kegiatan/monitoring');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[placeholder*="Cari"], input[type="text"]').first();
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill(vector);
        await page.waitForTimeout(500);
      }

      // Verifikasi tidak ada alert
      expect(alertTriggered).toBe(false);

      // Cleanup listener
      page.removeListener('dialog', dialogHandler);
    }

    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-012-xss-multiple-vectors.png'),
      fullPage: true 
    });
  });
});
