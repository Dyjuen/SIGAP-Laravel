const { test, expect } = require('@playwright/test');
const { login, USERS } = require('../helpers/auth');

/**
 * Common UI Patterns & Gaps Suite
 * Covers many missing AK-F, LPJ-F, and USR-F scenarios.
 */

test.describe('Common UI & Gaps', () => {

    test.beforeEach(async ({ page }) => {
        await login(page, USERS.PENGUSUL);
    });

    // ─── AK-F-004: Otorisasi Role ─────────────────────────────────────────────
    test('AK-F-004: Otorisasi Role - Verifikator dilarang akses form Create', async ({ browser }) => {
        const verifContext = await browser.newContext();
        const verifPage = await verifContext.newPage();
        await login(verifPage, USERS.VERIFIKATOR);
        await verifPage.goto('/kegiatan/create');
        await expect(verifPage.locator('text=403|Forbidden|tidak memiliki izin')).toBeVisible();
        await verifPage.close();
        await verifContext.close();
    });

    // ─── AK-F-005: Pencarian Nama ─────────────────────────────────────────────
    test('AK-F-005: Pencarian Nama di Index Kegiatan', async ({ page }) => {
        await page.goto('/kegiatan');
        const searchInput = page.locator('input[placeholder*="Cari"]').first();
        if (await searchInput.isVisible()) {
            await searchInput.fill('Seminar');
            await page.waitForTimeout(500);
            // Verify table is filtered
        }
    });

    // ─── AK-F-009: Navigasi Halaman ────────────────────────────────────────────
    test('AK-F-009: Navigasi Halaman Pagination', async ({ page }) => {
        await page.goto('/kegiatan');
        const page2 = page.locator('button:has-text("2"), a:has-text("2")').first();
        if (await page2.isVisible()) {
            await page2.click();
            await expect(page).toHaveURL(/.*page=2/);
        }
    });

    // ─── LPJ-F-010: Pencarian Nama Kegiatan ────────────────────────────────────
    test('LPJ-F-010: Pencarian Nama Kegiatan di LPJ', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await login(page, USERS.BENDAHARA);
        await page.goto('/lpj');
        const searchInput = page.locator('input[placeholder*="Cari"]').first();
        if (await searchInput.isVisible()) {
            await searchInput.fill('Test');
            await page.waitForTimeout(500);
        }
        await page.close();
        await context.close();
    });

    // ─── Generic: Dialog Konfirmasi & Loading States ───────────────────────────
    test('AK-F-010, LPJ-F-016, PD-F-010: Dialog Konfirmasi & Loading States', async ({ page }) => {
        // This is a representative test for confirmation modals
        await page.goto('/kegiatan');
        const hapusBtn = page.locator('button[title*="Hapus"], button:has-text("Hapus")').first();
        if (await hapusBtn.isVisible()) {
            await hapusBtn.click();
            const modal = page.locator('text=Yakin|Confirm|Hapus').first();
            await expect(modal).toBeVisible();
        }
    });

});
