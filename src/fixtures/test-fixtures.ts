import { test as base, BrowserContext, Page } from '@playwright/test';
import { PageManager } from '../pages';

/**
 * Custom test fixtures for Playwright + Cucumber integration
 */
export interface TestFixtures {
  pageManager: PageManager;
  context: BrowserContext;
  page: Page;
}

/**
 * Worker fixtures that are shared across tests
 */
export interface WorkerFixtures {
  browserName: 'chromium' | 'firefox' | 'webkit';
}

/**
 * Extended test with custom fixtures
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Worker-scoped fixtures
  browserName: [async ({}, use) => {
    const browser = process.env['BROWSER'] || 'chromium';
    const validBrowsers = ['chromium', 'firefox', 'webkit'];
    const browserName = validBrowsers.includes(browser) ? browser as 'chromium' | 'firefox' | 'webkit' : 'chromium';
    await use(browserName);
  }, { scope: 'worker' }],

  // Test-scoped fixtures
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      // Configure context with latest Playwright features
      viewport: { 
        width: parseInt(process.env['VIEWPORT_WIDTH'] || '1280'), 
        height: parseInt(process.env['VIEWPORT_HEIGHT'] || '720') 
      },
      
      // Enable video recording
      recordVideo: {
        dir: 'test-results/videos/',
        size: { width: 1280, height: 720 }
      },
      
      // Storage state for authentication
      ...(process.env['STORAGE_STATE'] && {
        storageState: process.env['STORAGE_STATE']
      }),
      
      // Additional context options
      ignoreHTTPSErrors: true,
      locale: 'en-US',
      timezoneId: 'America/New_York',
      
      // Latest Playwright features
      ...(process.env['CI'] && {
        // Enable additional features for CI
        permissions: ['clipboard-read', 'clipboard-write'],
      })
    });

    // Enable tracing if configured
    if (process.env['TRACE'] === 'true') {
      await context.tracing.start({ 
        screenshots: true, 
        snapshots: true,
        sources: true
      });
    }

    await use(context);

    // Save trace on test end
    if (process.env['TRACE'] === 'true') {
      await context.tracing.stop({ 
        path: `test-results/traces/trace-${Date.now()}.zip` 
      });
    }

    await context.close();
  },

  page: async ({ context }, use) => {
    const page = await context.newPage();
    
    // Set default timeouts
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);
    
    // Add console logging in debug mode
    if (process.env['DEBUG'] === 'true') {
      page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));
      page.on('pageerror', error => console.error(`PAGE ERROR: ${error.message}`));
    }
    
    await use(page);
    await page.close();
  },

  pageManager: async ({ page }, use) => {
    const pageManager = new PageManager(page);
    await use(pageManager);
    pageManager.reset();
  }
});

/**
 * Expect with custom matchers
 */
export { expect } from '@playwright/test';
