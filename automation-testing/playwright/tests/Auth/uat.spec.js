const { test, expect } = require('@playwright/test');
const { login, USERS } = require('../../helpers/auth');

/**
 * Auth Module - UI/UAT Automation
 * Covers: Login, Logout, Redirects, and Session Security.
 */

test.describe('Auth Module', () => {

    // ─── LGN-F-001: Login Screen ─────────────────────────────────────────────
    test('LGN-F-001: Tampil Halaman Login', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('#username')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    // ─── LGN-F-002: Login Berhasil ──────────────────────────────────────────
    test('LGN-F-002: Login Berhasil (Admin)', async ({ page }) => {
        await login(page, USERS.ADMIN);
        await expect(page).toHaveURL(/.*dashboard/);
    });

    // ─── LGN-F-015: Otorisasi Tamu ───────────────────────────────────────────
    test('LGN-F-015: Akses URL Terproteksi Tanpa Login Redirect ke Login', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/.*login/);
    });

});
