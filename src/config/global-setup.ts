import { chromium, FullConfig } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Global Setup for Playwright + Cucumber Framework
 *
 * This function runs once before all tests and handles:
 * - Environment preparation
 * - Authentication setup
 * - Test data initialization
 * - Browser installation verification
 * - Directory structure creation
 * - Latest Playwright features setup
 */
async function globalSetup(config: FullConfig) {
  console.log(
    "🚀 Starting global setup for Playwright + Cucumber Framework...",
  );
  console.log("══════════════════════════════════════════════════════════════");

  // Create necessary directories
  await ensureDirectories();

  // Verify browser installations
  await verifyBrowserInstallations();

  // Setup authentication if needed
  await setupAuthentication(config);

  // Initialize test environment
  await initializeTestEnvironment();

  // Setup MCP integration if enabled
  await setupMCPIntegration();

  // Log environment information
  logEnvironmentInfo();

  console.log("✅ Global setup completed successfully!");
  console.log("══════════════════════════════════════════════════════════════");
}

/**
 * Ensure all necessary directories exist
 */
async function ensureDirectories(): Promise<void> {
  console.log("📁 Creating directory structure...");

  const directories = [
    "test-results",
    "test-results/videos",
    "test-results/screenshots",
    "test-results/traces",
    "test-results/downloads",
    "reports",
    "reports/cucumber-html-report",
    "reports/playwright-html-report",
    "storage-states",
    "test-data",
    "temp",
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   ✓ Created: ${dir}`);
    }
  }
}

/**
 * Verify that required browsers are installed
 */
async function verifyBrowserInstallations(): Promise<void> {
  console.log("🌐 Verifying browser installations...");

  try {
    // Test Chromium
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("about:blank");
    await page.close();
    await browser.close();
    console.log("   ✓ Chromium: Available");

    // Note: We only test Chromium here as it's the most commonly used
    // Firefox and WebKit will be tested during actual test execution
  } catch (error) {
    console.error("❌ Browser installation verification failed:");
    console.error("   Please run: npm run install:browsers");
    throw error;
  }
}

/**
 * Setup authentication and create storage states
 */
async function setupAuthentication(_config: FullConfig): Promise<void> {
  console.log("🔐 Setting up authentication...");

  // Check if authentication is needed
  const needsAuth =
    process.env["SETUP_AUTH"] === "true" ||
    process.env["BASE_URL"]?.includes("staging") ||
    process.env["BASE_URL"]?.includes("production");

  if (!needsAuth) {
    console.log(
      "   ℹ️  Authentication setup skipped (not required for demo environment)",
    );
    return;
  }

  try {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();

    // Example authentication flow (customize based on your application)
    const baseURL = process.env["BASE_URL"] || "https://demo.playwright.dev";
    await page.goto(`${baseURL}/login`);

    // Wait for login form to be visible
    try {
      await page.waitForSelector(
        '[data-testid="username"], input[name="username"]',
        { timeout: 5000 },
      );

      // Perform login with environment credentials
      const username = process.env["AUTH_USERNAME"] || "demo@playwright.dev";
      const password = process.env["AUTH_PASSWORD"] || "demo123";

      await page.fill(
        '[data-testid="username"], input[name="username"]',
        username,
      );
      await page.fill(
        '[data-testid="password"], input[name="password"]',
        password,
      );
      await page.click('[data-testid="login-button"], button[type="submit"]');

      // Wait for successful login
      await page.waitForURL("**/dashboard", { timeout: 10000 });

      // Save authentication state
      const storageStatePath = path.join(
        "storage-states",
        "authenticated.json",
      );
      await context.storageState({ path: storageStatePath });

      console.log(
        `   ✓ Authentication successful, state saved to ${storageStatePath}`,
      );
    } catch {
      console.log("   ℹ️  Login form not found, skipping authentication setup");
    }

    await browser.close();
  } catch (error) {
    console.warn("⚠️  Authentication setup failed:", (error as Error).message);
    console.warn("   Tests will run without pre-authenticated state");
  }
}

/**
 * Initialize test environment and data
 */
async function initializeTestEnvironment(): Promise<void> {
  console.log("🔧 Initializing test environment...");

  // Create test data files if they don't exist
  const testDataDir = "test-data";
  const testDataFiles = [
    {
      name: "users.json",
      content: {
        admin: {
          username: "admin",
          password: "admin123",
          role: "administrator",
        },
        user: { username: "user", password: "user123", role: "user" },
        demo: {
          username: "demo@playwright.dev",
          password: "demo123",
          role: "demo",
        },
      },
    },
    {
      name: "test-config.json",
      content: {
        timeouts: {
          short: 5000,
          medium: 10000,
          long: 30000,
        },
        retry: {
          attempts: 2,
          delay: 1000,
        },
        screenshots: {
          onFailure: true,
          onSuccess: false,
        },
      },
    },
  ];

  for (const file of testDataFiles) {
    const filePath = path.join(testDataDir, file.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(file.content, null, 2));
      console.log(`   ✓ Created: ${filePath}`);
    }
  }

  // Set environment variables for test execution
  process.env["PLAYWRIGHT_TEST_BASE_URL"] =
    process.env["BASE_URL"] || "https://demo.playwright.dev";
  process.env["PLAYWRIGHT_BROWSERS_PATH"] =
    process.env["PLAYWRIGHT_BROWSERS_PATH"] || "0";

  console.log("   ✓ Test environment initialized");
}

/**
 * Setup MCP (Model Context Protocol) integration
 * This is a placeholder for future MCP server integration
 */
async function setupMCPIntegration(): Promise<void> {
  if (process.env["MCP_ENABLED"] !== "true") {
    return;
  }

  console.log("🔌 Setting up MCP integration...");

  // TODO: Implement MCP server startup and configuration
  // This could include:
  // - Starting MCP servers defined in mcp-config.json
  // - Establishing communication channels
  // - Registering test data providers
  // - Initializing AI-powered test assistants

  const mcpConfigPath = process.env["MCP_CONFIG"] || "mcp-config.json";

  if (fs.existsSync(mcpConfigPath)) {
    try {
      const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, "utf8"));
      console.log("   ✓ MCP configuration loaded");
      console.log(`   ℹ️  MCP servers: ${mcpConfig.servers?.length || 0}`);
    } catch (error) {
      console.warn(
        "   ⚠️  Failed to load MCP configuration:",
        (error as Error).message,
      );
    }
  } else {
    // Create a default MCP configuration
    const defaultMcpConfig = {
      servers: [],
      capabilities: {
        "test-data-provider": true,
        "ai-test-assistant": false,
        "visual-regression": false,
      },
      settings: {
        timeout: 30000,
        retries: 2,
      },
    };

    fs.writeFileSync(mcpConfigPath, JSON.stringify(defaultMcpConfig, null, 2));
    console.log(`   ✓ Created default MCP configuration: ${mcpConfigPath}`);
  }

  console.log(
    "   ⚠️  MCP integration is currently a placeholder for future implementation",
  );
}

/**
 * Log environment information for debugging
 */
function logEnvironmentInfo(): void {
  console.log("ℹ️  Environment Information:");
  console.log(`   Node.js Version: ${process.version}`);
  console.log(`   Platform: ${process.platform} ${process.arch}`);
  console.log(`   Working Directory: ${process.cwd()}`);
  console.log(
    `   Base URL: ${process.env["BASE_URL"] || "https://demo.playwright.dev"}`,
  );
  console.log(`   Browser: ${process.env["BROWSER"] || "chromium"}`);
  console.log(`   Headless: ${process.env["HEADED"] !== "true"}`);
  console.log(`   CI Mode: ${process.env["CI"] || "false"}`);
  console.log(`   Debug Mode: ${process.env["DEBUG"] || "false"}`);
  console.log(`   MCP Enabled: ${process.env["MCP_ENABLED"] || "false"}`);
  console.log(`   Parallel Workers: ${process.env["PARALLEL"] || "2"}`);
  console.log(`   Test Timeout: ${process.env["TIMEOUT"] || "60000"}ms`);
}

export default globalSetup;
