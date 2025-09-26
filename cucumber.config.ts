import { setDefaultTimeout } from "@cucumber/cucumber";

/**
 * Cucumber Configuration for Playwright Integration (v12.2.0)
 * This configuration enables TypeScript support and integrates with Playwright Test
 */

// Set default timeout for Cucumber steps
setDefaultTimeout(60 * 1000);

// Cucumber configuration with TypeScript support
const config = {
  default: {
    // TypeScript support with improved loading
    loader: ["ts-node/esm"],
    require: [
      "ts-node/register",
      "features/step-definitions/**/*.ts",
      "src/fixtures/**/*.ts",
    ],
    requireModule: ["ts-node/register"],

    // Output formats with enhanced options
    format: [
      "progress-bar",
      "@cucumber/pretty-formatter",
      "json:test-results/cucumber-report.json",
      "html:reports/cucumber-html-report.html",
      "summary",
      // New in v12: Enhanced JUnit output
      "junit:test-results/cucumber-junit.xml",
    ],

    // Format options with new features
    formatOptions: {
      snippetInterface: "async-await",
      printAttachments: true,
      colorsEnabled: true,
      // New in v12: Better error reporting
      theme: "hierarchy",
      // New in v12: Enhanced stack traces
      backtrace: process.env.NODE_ENV !== "production",
    },

    // Publishing and execution options
    // Removed publishQuiet as it's deprecated - see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md
    dryRun: false,

    // Parallel execution with improved worker management
    parallel: parseInt(process.env.PARALLEL || "2"),

    // Retry configuration with enhanced options (v12.2.0)
    retry: parseInt(process.env.RETRIES || (process.env.CI ? "2" : "1")),
    retryTagFilter: "@flaky",

    // New in v12: Fail fast options
    failFast: process.env.FAIL_FAST === "true",

    // New in v12: Order execution
    order: process.env.ORDER || "defined", // 'defined' | 'random'

    // Tag filtering with enhanced syntax
    tags: process.env.TAGS || "not @skip and not @wip",

    // World parameters passed to step definitions
    worldParameters: {
      // Browser configuration
      browser: process.env.BROWSER || "chromium",
      headless: process.env.HEADED !== "true",
      slowMo: parseInt(process.env.SLOW_MO || "0"),

      // Application configuration
      baseURL: process.env.BASE_URL || "https://demo.playwright.dev",

      // Viewport configuration
      viewport: {
        width: parseInt(process.env.VIEWPORT_WIDTH || "1280"),
        height: parseInt(process.env.VIEWPORT_HEIGHT || "720"),
      },

      // Recording configuration - enabled by default for better debugging
      video: process.env.VIDEO !== "false",
      trace: process.env.TRACE !== "false",
      screenshot: process.env.SCREENSHOT !== "false",

      // Test environment
      environment: process.env.NODE_ENV || "test",
      debug: process.env.DEBUG === "true",

      // Timeouts
      actionTimeout: parseInt(process.env.ACTION_TIMEOUT || "30000"),
      navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || "30000"),

      // Latest Playwright features
      testIdAttribute: "data-testid",
      storageState: process.env.STORAGE_STATE || undefined,

      // MCP integration (placeholder)
      mcpEnabled: process.env.MCP_ENABLED === "true",
      mcpConfig: process.env.MCP_CONFIG || "mcp-config.json",
    },
  },
};

export default config;
module.exports = config;
