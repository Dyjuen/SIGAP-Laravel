// @ts-check
const { defineConfig } = require('@playwright/test');

/**
 * Playwright Configuration for SIGAP-Laravel Automation Testing
 * 
 * Targets: Ajukan Kegiatan feature (AK-F-001 ~ AK-F-012)
 * Base URL: http://localhost:8000 (php artisan serve)
 */
module.exports = defineConfig({
  testDir: './tests',
  
  /* Maximum time one test can run */
  timeout: 60_000,
  
  /* Expect timeout for assertions */
  expect: {
    timeout: 10_000,
  },

  /* Run tests in files in parallel */
  fullyParallel: false,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Reporter: HTML report saved to reports directory */
  reporter: [
    ['list'],
    ['html', { 
      outputFolder: '../reports/playwright',
      open: 'never' 
    }],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL for the Laravel app */
    baseURL: process.env.BASE_URL || 'http://localhost:8000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'on',
    
    /* Video on failure */
    video: 'on',
    
    /* Default navigation timeout */
    navigationTimeout: 30_000,
    
    /* Action timeout */
    actionTimeout: 15_000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
