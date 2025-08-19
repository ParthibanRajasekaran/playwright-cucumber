import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { BrowserContext, Page, Browser, chromium, firefox, webkit } from 'playwright';
import { PageManager } from '../pages';

/**
 * Custom World class for Cucumber tests with Playwright integration
 * This class maintains the browser context and page instances across test steps
 */
export class CustomWorld extends World {
  public browser?: Browser;
  public context?: BrowserContext;
  public page?: Page;
  public pageManager?: PageManager;
  public scenarioName?: string;
  
  // Test configuration
  public config: {
    browser: string;
    headless: boolean;
    slowMo: number;
    baseURL: string;
    viewport: { width: number; height: number };
    video: boolean;
    trace: boolean;
  };

  constructor(options: IWorldOptions) {
    super(options);
    
    // Initialize configuration from world parameters
    this.config = {
      browser: options.parameters?.browser || 'chromium',
      headless: options.parameters?.headless !== false,
      slowMo: options.parameters?.slowMo || 0,
      baseURL: options.parameters?.baseURL || 'https://demo.playwright.dev',
      viewport: options.parameters?.viewport || { width: 1280, height: 720 },
      video: options.parameters?.video === true,
      trace: options.parameters?.trace === true
    };
  }

  /**
   * Initialize browser and create new context and page
   */
  async init(): Promise<void> {
    // CI-optimized browser launch options
    const ciOptimizations = process.env.CI ? {
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding'
      ]
    } : {};

    // Launch browser based on configuration
    switch (this.config.browser.toLowerCase()) {
      case 'firefox':
        this.browser = await firefox.launch({
          headless: this.config.headless,
          slowMo: this.config.slowMo,
          ...ciOptimizations
        });
        break;
      case 'webkit':
      case 'safari':
        this.browser = await webkit.launch({
          headless: this.config.headless,
          slowMo: this.config.slowMo,
          ...ciOptimizations
        });
        break;
      case 'chromium':
      case 'chrome':
      default:
        this.browser = await chromium.launch({
          headless: this.config.headless,
          slowMo: this.config.slowMo,
          // Use latest Chrome features (skip in CI for stability)
          ...(process.env.CI ? {} : { channel: 'chrome' }),
          ...ciOptimizations
        });
        break;
    }

    // Create browser context with advanced features (simplified for CI)
    const contextOptions = {
      viewport: this.config.viewport,
      baseURL: this.config.baseURL,
      ignoreHTTPSErrors: true,
      locale: 'en-US',
      
      // Disable expensive features in CI
      ...(process.env.CI ? {} : {
        timezoneId: 'America/New_York',
        permissions: ['clipboard-read', 'clipboard-write', 'notifications']
      }),
      
      // Video recording configuration (disabled in CI for performance)
      ...(this.config.video && !process.env.CI && {
        recordVideo: {
          dir: 'test-results/videos/',
          size: this.config.viewport
        }
      }),
      
      // Storage state support
      ...(process.env['STORAGE_STATE'] && {
        storageState: process.env['STORAGE_STATE']
      })
    };

    this.context = await this.browser.newContext(contextOptions);

    // Start tracing if enabled
    if (this.config.trace) {
      await this.context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true
      });
    }

    // Create new page
    this.page = await this.context.newPage();
    
    // Set timeouts
    this.page.setDefaultTimeout(30000);
    this.page.setDefaultNavigationTimeout(30000);
    
    // Initialize page manager
    this.pageManager = new PageManager(this.page);
    
    // Add console logging for debugging
    if (process.env['DEBUG'] === 'true') {
      this.page.on('console', msg => {
        console.log(`🖥️  PAGE LOG [${msg.type()}]: ${msg.text()}`);
      });
      
      this.page.on('pageerror', error => {
        console.error(`🚨 PAGE ERROR: ${error.message}`);
      });
      
      this.page.on('request', request => {
        console.log(`🌐 REQUEST: ${request.method()} ${request.url()}`);
      });
    }
  }

  /**
   * Clean up browser resources
   */
  async cleanup(): Promise<void> {
    try {
      // Increase timeout for cleanup operations in CI - browsers are slow to close
      const cleanupTimeout = process.env.CI ? 8000 : 15000;
      
      // Stop tracing and save if enabled
      if (this.config.trace && this.context) {
        const tracePath = `test-results/traces/trace-${Date.now()}.zip`;
        await Promise.race([
          this.context.tracing.stop({ path: tracePath }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Tracing stop timeout')), 3000))
        ]);
        console.log(`📊 Trace saved to: ${tracePath}`);
      }

      // Close page and context with increased timeout
      await Promise.race([
        this.closeResources(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Cleanup timeout')), cleanupTimeout))
      ]);
      
    } catch (error) {
      console.error('Error during cleanup:', error);
      // Force close browser if regular cleanup fails
      try {
        if (this.browser) {
          await this.browser.close();
        }
      } catch (forceCloseError) {
        console.error('Force close also failed:', forceCloseError);
      }
    }
  }

  /**
   * Close browser resources in order
   */
  private async closeResources(): Promise<void> {
    // Close page first
    if (this.page && !this.page.isClosed()) {
      try {
        await this.page.close();
      } catch (error) {
        console.warn('Failed to close page:', error instanceof Error ? error.message : String(error));
      }
    }
    
    // Close context
    if (this.context) {
      try {
        await this.context.close();
      } catch (error) {
        console.warn('Failed to close context:', error instanceof Error ? error.message : String(error));
      }
    }
    
    // Close browser last
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        console.warn('Failed to close browser:', error instanceof Error ? error.message : String(error));
      }
    }
  }

  /**
   * Take a screenshot
   * @param name - Screenshot name
   */
  async takeScreenshot(name: string): Promise<string> {
    if (!this.page) {
      throw new Error('Page not initialized. Call init() first.');
    }
    
    const screenshotPath = `test-results/screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  /**
   * Get current page URL
   */
  getCurrentUrl(): string {
    if (!this.page) {
      throw new Error('Page not initialized. Call init() first.');
    }
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    if (!this.page) {
      throw new Error('Page not initialized. Call init() first.');
    }
    return await this.page.title();
  }

  /**
   * Navigate to URL
   * @param url - URL to navigate to
   */
  async navigateTo(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized. Call init() first.');
    }
    
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;
    await this.page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Wait for network idle
   */
  async waitForNetworkIdle(): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized. Call init() first.');
    }
    await this.page.waitForLoadState('networkidle');
  }
}

// Set the custom world constructor for Cucumber
setWorldConstructor(CustomWorld);
