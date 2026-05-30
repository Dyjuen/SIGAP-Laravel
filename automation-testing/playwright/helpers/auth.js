/**
 * Authentication Helper for Playwright Tests
 * 
 * Provides reusable login function matching SIGAP-Laravel's login form.
 * Credentials sourced from UserSeeder.php.
 * 
 * Usage:
 *   const { login, USERS } = require('../helpers/auth');
 *   await login(page, USERS.PENGUSUL);
 */

/**
 * User credentials from UserSeeder.php
 * Each entry maps to a role in the SIGAP system.
 */
const USERS = {
  ADMIN: {
    username: 'admin',
    password: 'admin123',
    role: 'Admin',
    roleId: 1,
  },
  VERIFIKATOR: {
    username: 'verifikator1',
    password: 'verif1123',
    role: 'Verifikator',
    roleId: 2,
  },
  PENGUSUL: {
    username: 'jurusantik',
    password: 'tik123',
    role: 'Pengusul',
    roleId: 3,
  },
  PPK: {
    username: 'ppk',
    password: 'ppk123',
    role: 'PPK',
    roleId: 4,
  },
  WADIR: {
    username: 'wadir2',
    password: 'wadir2123',
    role: 'Wadir',
    roleId: 5,
  },
  BENDAHARA: {
    username: 'bendahara',
    password: 'bendahara123',
    role: 'Bendahara',
    roleId: 6,
  },
};

/**
 * Login to the SIGAP application.
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} user - User credentials object from USERS constant
 * @param {string} user.username - Username
 * @param {string} user.password - Password
 */
async function login(page, user) {
  await page.goto('/login');
  
  // Wait for the login form to be visible
  await page.waitForSelector('#username', { state: 'visible' });
  
  // Fill in credentials
  await page.fill('#username', user.username);
  await page.fill('#password', user.password);
  
  // Click the submit button
  await page.click('button[type="submit"]');
  
  // Wait for navigation to a restricted page (URL should no longer be /login)
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  
  // Ensure we landed on a dashboard or intended page
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    throw new Error(`Login failed: still on /login page. URL is ${currentUrl}`);
  }
}

/**
 * Logout from the SIGAP application.
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function logout(page) {
  // Navigate to dashboard first if not already there
  await page.goto('/dashboard');
  // The logout mechanism depends on the UI - typically a dropdown
  // This is a generic approach using direct navigation
  await page.evaluate(() => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/logout';
    const csrf = document.querySelector('meta[name="csrf-token"]');
    if (csrf) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = '_token';
      input.value = csrf.getAttribute('content');
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  });
  await page.waitForURL('**/login', { timeout: 10_000 });
}

module.exports = { login, logout, USERS };
