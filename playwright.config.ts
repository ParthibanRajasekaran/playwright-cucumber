import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Playwright Configuration for Cucumber Integration with Latest Features (v1.55.1)
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./features",

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env["CI"],

  /* Retry on CI only */
  retries: process.env["CI"] ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env["CI"] ? 1 : 2,

  /* Test timeout with improved handling */
  timeout: 60000,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      "html",
      {
        outputFolder: "reports/playwright-html-report",
        open: "never", // Always generate, never auto-open in CI
        attachmentsBaseURL: process.env["ATTACHMENTS_BASE_URL"], // New in 1.55
      },
    ],
    ["list", { printSteps: true }],
    [
      "json",
      {
        outputFile: "test-results/playwright-report.json",
      },
    ],
    [
      "junit",
      {
        outputFile: "test-results/junit-report.xml",
        stripANSIControlSequences: true, // New option for cleaner output
      },
    ],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env["BASE_URL"] || "https://demo.playwright.dev",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env["TRACE"] === "false" ? "off" : "on",

    /* Record video on failure */
    video: process.env["VIDEO"] === "false" ? "off" : "on",

    /* Take screenshot on failure */
    screenshot: process.env["SCREENSHOT"] === "true" ? "on" : "only-on-failure",

    /* Global timeout for all actions */
    actionTimeout: 30000,

    /* Global timeout for navigation */
    navigationTimeout: 30000,

    /* Default viewport */
    viewport: { width: 1280, height: 720 },

    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,

    /* Use storage state for authenticated sessions */
    storageState: process.env["STORAGE_STATE"] || undefined,

    /* Locale */
    locale: "en-US",

    /* Timezone */
    timezoneId: "America/New_York",

    /* Enable experimental features */
    headless: process.env["HEADED"] !== "true",

    /* Latest Playwright features */
    testIdAttribute: "data-testid",

    /* Color scheme preference */
    colorScheme: "light",

    /* New in v1.55: Better HAR recording */
    ...(process.env["RECORD_HAR"] === "true" && {
      recordHar: {
        path: "test-results/network.har",
        mode: "minimal",
        content: "attach",
      },
    }),
  },

  /* Configure projects for major browsers with latest features */
  projects: [
    // Chrome/Chromium with latest features
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use Chrome channel for latest features
        channel: "chrome",
      },
    },

    // Firefox with enhanced configuration
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        // Enhanced Firefox configuration
        contextOptions: {
          ignoreHTTPSErrors: true,
        },
      },
    },

    // Safari/WebKit with latest features
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        // Better WebKit configuration
        contextOptions: {
          ignoreHTTPSErrors: true,
          acceptDownloads: true,
        },
      },
    },

    // Edge with latest channel
    {
      name: "msedge",
      use: {
        ...devices["Desktop Edge"],
        channel: "msedge",
      },
    },

    // Mobile Chrome with enhanced touch support
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        // Enable mobile-specific features
        isMobile: true,
        hasTouch: true,
        contextOptions: {
          geolocation: { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
          permissions: ["geolocation"],
        },
      },
    },

    // Mobile Safari with enhanced features
    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 12"],
        isMobile: true,
        hasTouch: true,
        contextOptions: {
          geolocation: { latitude: 37.7749, longitude: -122.4194 },
          permissions: ["geolocation"],
        },
      },
    },
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve("./src/config/global-setup.ts"),
  globalTeardown: require.resolve("./src/config/global-teardown.ts"),

  /* Output directory for test results */
  outputDir: "test-results/",

  /* Expect timeout with latest assertion features */
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      threshold: 0.2,
    },
  },

  /* Metadata for HTML reports */
  metadata: {
    "Test Environment": process.env["NODE_ENV"] || "development",
    "Base URL": process.env["BASE_URL"] || "https://demo.playwright.dev",
    Browser: process.env["BROWSER"] || "chromium",
    CI: process.env["CI"] || "false",
    OS: process.platform,
    "Node Version": process.version,
  },
});
