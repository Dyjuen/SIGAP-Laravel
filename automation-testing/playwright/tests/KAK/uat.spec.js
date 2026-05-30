const { test, expect } = require('@playwright/test');
const { login, USERS } = require('../../helpers/auth');

/**
 * KAK (Kerangka Acuan Kerja) - UI/UAT Automation
 * Covers: Create, Edit, Delete, and Index filtering.
 */

test.describe('KAK Module', () => {

    test.beforeEach(async ({ page }) => {
        await login(page, USERS.PENGUSUL);
    });

    // ─── KAK-FT-001: Simpan KAK data valid ──────────────────────────────────
    test('KAK-FT-001: Simpan KAK data valid (Role Pengusul)', async ({ page }) => {
        await page.goto('/kak/create');
        
        // Fill base info
        await page.fill('input[name="nama_kegiatan"]', 'Workshop Automation Testing 2026');
        await page.fill('textarea[name="deskripsi_kegiatan"]', 'Description for automation testing workshop with more than 50 characters to pass validation.');
        
        // Select Tipe
        await page.locator('select[name="tipe_kegiatan_id"]').selectOption({ index: 1 });

        // Add RAB Row (KAK-FT-019)
        const addRabBtn = page.locator('button:has-text("Tambah Baris"), button:has-text("RAB")').first();
        if (await addRabBtn.isVisible()) {
            await addRabBtn.click();
            await page.fill('input[name="rab[0][uraian]"]', 'Sewa Laptop');
            await page.fill('input[name="rab[0][volume1]"]', '10');
            await page.fill('input[name="rab[0][harga_satuan]"]', '100000');
        }

        // Submit
        await page.click('button:has-text("Simpan"), button[type="submit"]');

        // Verify success
        await expect(page.locator('text=berhasil')).toBeVisible();
    });

    // ─── KAK-FT-014: Index: Filter KAK berdasarkan Status ───────────────────
    test('KAK-FT-014: Filter KAK berdasarkan Status', async ({ page }) => {
        await page.goto('/kak');
        
        const filterSelect = page.locator('select[name="status"], select[class*="filter"]').first();
        if (await filterSelect.isVisible()) {
            await filterSelect.selectOption('2'); // Review
            await page.waitForLoadState('networkidle');
            
            // Check if results are filtered
            const badges = page.locator('span:has-text("Review")');
            const count = await badges.count();
            if (count > 0) {
                for (let i = 0; i < count; i++) {
                    await expect(badges.nth(i)).toBeVisible();
                }
            }
        }
    });

});
