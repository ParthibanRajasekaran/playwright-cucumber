import { World, IWorldOptions, setWorldConstructor } from "@cucumber/cucumber";
import {
  BrowserContext,
  Page,
  Browser,
  chromium,
  firefox,
  webkit,
} from "playwright";
import { PageManager } from "../pages";
import {
  getTestArtifactConfig,
  printArtifactConfig,
  TestArtifactConfig,
} from "../config/artifacts";

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

  // Authentication-related properties
  public authenticationAttempts?: number;
  public lastError?: string;
  public credentials?: { username: string; password: string };
  public authenticationStartTime?: number;
  public dashboardLoadStartTime?: number;

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

  // Artifact configuration
  public artifactConfig: TestArtifactConfig;

  constructor(options: IWorldOptions) {
    super(options);

    // Get artifact configuration from environment variables
    this.artifactConfig = getTestArtifactConfig();

    // Print configuration on first initialization
    if (process.env["SHOW_ARTIFACT_CONFIG"] !== "false") {
      printArtifactConfig(this.artifactConfig);
    }

    // Initialize configuration from world parameters
    this.config = {
      browser: options.parameters?.browser || "chromium",
      headless: options.parameters?.headless !== false,
      slowMo: options.parameters?.slowMo || 0,
      baseURL: options.parameters?.baseURL || "https://demo.playwright.dev",
      viewport: options.parameters?.viewport || { width: 1280, height: 720 },
      video: this.artifactConfig.videos && options.parameters?.video !== false, // Respect artifact config
      trace: this.artifactConfig.traces && options.parameters?.trace !== false, // Respect artifact config
    };
  }

  /**
   * Initialize browser and create new context and page
   */
  async init(): Promise<void> {
    // CI-optimized browser launch options
    const ciOptimizations = process.env.CI
      ? {
          args: [
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-web-security",
            "--disable-features=VizDisplayCompositor",
            "--disable-extensions",
            "--disable-plugins",
            "--disable-background-timer-throttling",
            "--disable-renderer-backgrounding",
          ],
        }
      : {};

    // Launch browser based on configuration
    switch (this.config.browser.toLowerCase()) {
      case "firefox":
        this.browser = await firefox.launch({
          headless: this.config.headless,
          slowMo: this.config.slowMo,
          ...ciOptimizations,
        });
        break;
      case "webkit":
      case "safari":
        this.browser = await webkit.launch({
          headless: this.config.headless,
          slowMo: this.config.slowMo,
          ...ciOptimizations,
        });
        break;
      case "chromium":
      case "chrome":
      default:
        this.browser = await chromium.launch({
          headless: this.config.headless,
          slowMo: this.config.slowMo,
          // Use latest Chrome features (skip in CI for stability)
          ...(process.env.CI ? {} : { channel: "chrome" }),
          ...ciOptimizations,
        });
        break;
    }

    // Create browser context with advanced features (simplified for CI)
    const contextOptions = {
      viewport: this.config.viewport,
      baseURL: this.config.baseURL,
      ignoreHTTPSErrors: true,
      locale: "en-US",

      // Disable expensive features in CI
      ...(process.env.CI
        ? {}
        : {
            timezoneId: "America/New_York",
            permissions: ["clipboard-read", "clipboard-write", "notifications"],
          }),

      // Video recording configuration - controlled by artifact config
      ...(this.artifactConfig.videos && {
        recordVideo: {
          dir: "reports/videos/",
          size: this.config.viewport,
        },
      }),

      // Storage state support
      ...(process.env["STORAGE_STATE"] && {
        storageState: process.env["STORAGE_STATE"],
      }),
    };

    this.context = await this.browser.newContext(contextOptions);

    // Start tracing if enabled
    if (this.artifactConfig.traces) {
      await this.context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
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
    if (process.env["DEBUG"] === "true") {
      this.page.on("console", (msg) => {
        console.log(`🖥️  PAGE LOG [${msg.type()}]: ${msg.text()}`);
      });

      this.page.on("pageerror", (error) => {
        console.error(`🚨 PAGE ERROR: ${error.message}`);
      });

      this.page.on("request", (request) => {
        console.log(`🌐 REQUEST: ${request.method()} ${request.url()}`);
      });
    }
  }

  /**
   * Set scenario name for better trace/video naming
   */
  setScenarioName(name: string): void {
    this.scenarioName = name.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
  }

  /**
   * Clean up browser resources
   */
  async cleanup(scenarioFailed: boolean = false): Promise<void> {
    try {
      // Increase timeout for cleanup operations in CI - browsers are slow to close
      const cleanupTimeout = process.env.CI ? 8000 : 15000;

      let tracePath: string | undefined;
      let videoPath: string | undefined;

      // Stop tracing and save if enabled
      if (this.artifactConfig.traces && this.context) {
        // Ensure traces directory exists in reports
        const traceDir = "reports/traces";
        if (!require("fs").existsSync(traceDir)) {
          require("fs").mkdirSync(traceDir, { recursive: true });
        }

        tracePath = `${traceDir}/trace-${this.scenarioName || "scenario"}-${Date.now()}.zip`;
        await Promise.race([
          this.context.tracing.stop({ path: tracePath }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Tracing stop timeout")), 3000),
          ),
        ]);

        // Only keep trace file if scenario failed (or artifacts on success enabled)
        const shouldKeep = scenarioFailed || !this.artifactConfig.onlyOnFailure;
        if (shouldKeep) {
          console.log(`📊 Trace saved to: ${tracePath}`);
        } else {
          // Delete trace file for passing tests to save space
          if (require("fs").existsSync(tracePath)) {
            require("fs").unlinkSync(tracePath);
          }
        }
      }

      // Save video if enabled and page exists
      if (this.artifactConfig.videos && this.page && !this.page.isClosed()) {
        try {
          // Videos are already saved to reports/videos/ by recordVideo config
          videoPath = await this.page.video()?.path();
          if (videoPath) {
            // Only keep video if scenario failed (or artifacts on success enabled)
            const shouldKeep =
              scenarioFailed || !this.artifactConfig.onlyOnFailure;
            if (shouldKeep) {
              console.log(`🎥 Video saved to: ${videoPath}`);
            } else {
              // Delete video file for passing tests to save space
              if (require("fs").existsSync(videoPath)) {
                require("fs").unlinkSync(videoPath);
              }
            }
          }
        } catch (error) {
          console.warn(
            "Video save failed:",
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      // Attach trace and video to Cucumber report on failure
      if (scenarioFailed) {
        try {
          if (
            this.artifactConfig.traces &&
            tracePath &&
            require("fs").existsSync(tracePath)
          ) {
            // Attach trace file directly to Cucumber report for viewing
            const traceBuffer = require("fs").readFileSync(tracePath);
            await this.attach(traceBuffer, "application/zip");

            // Also provide a text link for reference
            const relativeTracePath = tracePath.replace(
              process.cwd() + "/",
              "",
            );
            await this.attach(
              `Trace viewer: Use Playwright CLI 'npx playwright show-trace ${relativeTracePath}' or drag ${relativeTracePath} to https://trace.playwright.dev`,
              "text/plain",
            );
            console.log(`📊 Trace attached to report: ${tracePath}`);
          }

          if (
            this.artifactConfig.videos &&
            videoPath &&
            require("fs").existsSync(videoPath)
          ) {
            // Attach video file directly to Cucumber report
            const videoBuffer = require("fs").readFileSync(videoPath);
            await this.attach(videoBuffer, "video/webm");

            // Also provide file path reference
            const relativeVideoPath = videoPath.replace(
              process.cwd() + "/",
              "",
            );
            await this.attach(
              `Video recording: ${relativeVideoPath}`,
              "text/plain",
            );
            console.log(`🎥 Video attached to report: ${videoPath}`);
          }
        } catch (attachError) {
          console.warn("Failed to attach media files to report:", attachError);
        }
      }

      // Close page and context with increased timeout
      await Promise.race([
        this.closeResources(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Cleanup timeout")),
            cleanupTimeout,
          ),
        ),
      ]);
    } catch (error) {
      console.error("Error during cleanup:", error);
      // Force close browser if regular cleanup fails
      try {
        if (this.browser) {
          await this.browser.close();
        }
      } catch (forceCloseError) {
        console.error("Force close also failed:", forceCloseError);
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
        console.warn(
          "Failed to close page:",
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    // Close context
    if (this.context) {
      try {
        await this.context.close();
      } catch (error) {
        console.warn(
          "Failed to close context:",
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    // Close browser last
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        console.warn(
          "Failed to close browser:",
          error instanceof Error ? error.message : String(error),
        );
      }
    }
  }

  /**
   * Take a screenshot
   * @param name - Screenshot name
   */
  async takeScreenshot(name: string): Promise<string> {
    if (!this.page) {
      throw new Error("Page not initialized. Call init() first.");
    }

    if (!this.artifactConfig.screenshots) {
      console.log("📸 Screenshots disabled - skipping screenshot capture");
      return "";
    }

    // Ensure screenshots directory exists in reports
    const screenshotDir = "reports/screenshots";
    if (!require("fs").existsSync(screenshotDir)) {
      require("fs").mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = `${screenshotDir}/${name}-${Date.now()}.png`;
    await this.page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  /**
   * Get current page URL
   */
  getCurrentUrl(): string {
    if (!this.page) {
      throw new Error("Page not initialized. Call init() first.");
    }
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    if (!this.page) {
      throw new Error("Page not initialized. Call init() first.");
    }
    return await this.page.title();
  }

  /**
   * Navigate to URL
   * @param url - URL to navigate to
   */
  async navigateTo(url: string): Promise<void> {
    if (!this.page) {
      throw new Error("Page not initialized. Call init() first.");
    }

    const fullUrl = url.startsWith("http")
      ? url
      : `${this.config.baseURL}${url}`;
    await this.page.goto(fullUrl, { waitUntil: "domcontentloaded" });
  }

  /**
   * Wait for network idle
   */
  async waitForNetworkIdle(): Promise<void> {
    if (!this.page) {
      throw new Error("Page not initialized. Call init() first.");
    }
    await this.page.waitForLoadState("networkidle");
  }
}

// Set the custom world constructor for Cucumber
setWorldConstructor(CustomWorld);
