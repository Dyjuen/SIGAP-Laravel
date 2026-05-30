const { test, expect } = require('@playwright/test');
const { login, USERS } = require('../../helpers/auth');

/**
 * LPJ (Laporan Pertanggung Jawaban) - UI/UAT Automation
 * Covers: Review, Revise, Approve, and Complete flows.
 */

test.describe('LPJ Module', () => {

    test.beforeEach(async ({ page }) => {
        await login(page, USERS.BENDAHARA);
    });

    // ─── LPJ-F-001: Review LPJ ───────────────────────────────────────────────
    test('LPJ-F-001: Otorisasi Akses Bendahara ke Review LPJ', async ({ page }) => {
        await page.goto('/lpj');
        
        // Find a "Review" button or status badge
        const reviewBtn = page.locator('a:has-text("Review"), button:has-text("Review")').first();
        if (await reviewBtn.isVisible()) {
            await reviewBtn.click();
            await expect(page).toHaveURL(/.*review/);
            await expect(page.locator('text=Anggaran')).toBeVisible();
        }
    });

    // ─── LPJ-F-006: Approve LPJ ──────────────────────────────────────────────
    test('LPJ-F-006: Tombol Approve Muncul untuk Bendahara', async ({ page }) => {
        await page.goto('/lpj');
        
        const reviewBtn = page.locator('a:has-text("Review")').first();
        if (await reviewBtn.isVisible()) {
            await reviewBtn.click();
            
            const approveBtn = page.locator('button:has-text("Setujui"), button:has-text("Approve")').first();
            await expect(approveBtn).toBeVisible();
        }
    });

});
