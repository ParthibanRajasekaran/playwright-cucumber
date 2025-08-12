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
    // Launch browser based on configuration
    switch (this.config.browser.toLowerCase()) {
      case 'firefox':
        this.browser = await firefox.launch({
          headless: this.config.headless,
          slowMo: this.config.slowMo
        });
        break;
      case 'webkit':
      case 'safari':
        this.browser = await webkit.launch({
          headless: this.config.headless,
          slowMo: this.config.slowMo
        });
        break;
      case 'chromium':
      case 'chrome':
      default:
        this.browser = await chromium.launch({
          headless: this.config.headless,
          slowMo: this.config.slowMo,
          // Use latest Chrome features
          channel: 'chrome'
        });
        break;
    }

    // Create browser context with advanced features
    this.context = await this.browser.newContext({
      viewport: this.config.viewport,
      baseURL: this.config.baseURL,
      
      // Video recording configuration
      ...(this.config.video && {
        recordVideo: {
          dir: 'test-results/videos/',
          size: this.config.viewport
        }
      }),
      
      // Additional context options for latest Playwright features
      ignoreHTTPSErrors: true,
      locale: 'en-US',
      timezoneId: 'America/New_York',
      
      // Enable permissions for modern web features
      permissions: ['clipboard-read', 'clipboard-write', 'notifications'],
      
      // Storage state support
      ...(process.env['STORAGE_STATE'] && {
        storageState: process.env['STORAGE_STATE']
      })
    });

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
      // Stop tracing and save if enabled
      if (this.config.trace && this.context) {
        const tracePath = `test-results/traces/trace-${Date.now()}.zip`;
        await this.context.tracing.stop({ path: tracePath });
        console.log(`📊 Trace saved to: ${tracePath}`);
      }

      // Close page and context
      if (this.page) {
        await this.page.close();
      }
      
      if (this.context) {
        await this.context.close();
      }
      
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
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
