import { setDefaultTimeout } from '@cucumber/cucumber';

/**
 * Cucumber Configuration for Playwright Integration
 * This configuration enables TypeScript support and integrates with Playwright Test
 */

// Set default timeout for Cucumber steps
setDefaultTimeout(60 * 1000);

// Cucumber configuration with TypeScript support
const config = {
  default: {
    // TypeScript support
    require: [
      'ts-node/register',
      'features/step-definitions/**/*.ts',
      'src/fixtures/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    
    // Output formats
    format: [
      'progress-bar',
      '@cucumber/pretty-formatter',
      'json:test-results/cucumber-report.json',
      'html:reports/cucumber-html-report.html',
      'summary'
    ],
    
    // Format options
    formatOptions: {
      snippetInterface: 'async-await',
      printAttachments: true,
      colorsEnabled: true
    },
    
    // Publishing and execution options
    publishQuiet: true,
    dryRun: false,
    
    // Parallel execution
    parallel: parseInt(process.env.PARALLEL || '2'),
    
    // Retry configuration
    retry: parseInt(process.env.RETRIES || (process.env.CI ? '2' : '1')),
    retryTagFilter: '@flaky',
    
    // Tag filtering
    tags: process.env.TAGS || 'not @skip',
    
    // World parameters passed to step definitions
    worldParameters: {
      // Browser configuration
      browser: process.env.BROWSER || 'chromium',
      headless: process.env.HEADED !== 'true',
      slowMo: parseInt(process.env.SLOW_MO || '0'),
      
      // Application configuration
      baseURL: process.env.BASE_URL || 'https://demo.playwright.dev',
      
      // Viewport configuration
      viewport: {
        width: parseInt(process.env.VIEWPORT_WIDTH || '1280'),
        height: parseInt(process.env.VIEWPORT_HEIGHT || '720')
      },
      
      // Recording configuration
      video: process.env.VIDEO === 'true' || process.env.CI === 'true',
      trace: process.env.TRACE === 'true' || process.env.CI === 'true',
      screenshot: process.env.SCREENSHOT !== 'false',
      
      // Test environment
      environment: process.env.NODE_ENV || 'test',
      debug: process.env.DEBUG === 'true',
      
      // Timeouts
      actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '30000'),
      navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '30000'),
      
      // Latest Playwright features
      testIdAttribute: 'data-testid',
      storageState: process.env.STORAGE_STATE || undefined,
      
      // MCP integration (placeholder)
      mcpEnabled: process.env.MCP_ENABLED === 'true',
      mcpConfig: process.env.MCP_CONFIG || 'mcp-config.json'
    }
  }
};

export default config;
module.exports = config;
