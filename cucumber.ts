#!/usr/bin/env node

/**
 * Cucumber Test Entrypoint with Playwright Integration
 * This file bootstraps Cucumber.js with TypeScript and Playwright configuration
 * 
 * Features:
 * - TypeScript support with ts-node
 * - Playwright browser automation
 * - Cucumber BDD test execution
 * - Enhanced reporting
 * - MCP (Model Context Protocol) support placeholder
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment configuration
 */
interface TestConfig {
  browser: string;
  headless: boolean;
  parallel: number;
  tags: string;
  format: string[];
  timeout: number;
  retries: number;
  baseUrl: string;
}

/**
 * Get test configuration from environment variables
 */
function getTestConfig(): TestConfig {
  return {
    browser: process.env.BROWSER || 'chromium',
    headless: process.env.HEADED !== 'true',
    parallel: parseInt(process.env.PARALLEL || '2'),
    tags: process.env.TAGS || 'not @skip',
    format: [
      'progress-bar',
      '@cucumber/pretty-formatter',
      'json:test-results/cucumber-report.json',
      'html:reports/cucumber-html-report.html',
      ...(process.env.CI ? ['json:test-results/cucumber-ci-report.json'] : [])
    ],
    timeout: parseInt(process.env.TIMEOUT || '60000'),
    retries: parseInt(process.env.RETRIES || (process.env.CI ? '2' : '0')),
    baseUrl: process.env.BASE_URL || 'https://demo.playwright.dev'
  };
}

/**
 * Ensure required directories exist
 */
function ensureDirectories(): void {
  const dirs = [
    'test-results',
    'reports',
    'test-results/videos',
    'test-results/traces',
    'test-results/screenshots'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
}

/**
 * Build Cucumber CLI command
 */
function buildCucumberCommand(config: TestConfig): string {
  const args = [
    'npx cucumber-js',
    '--config=cucumber.config.js',
    `--parallel ${config.parallel}`,
    `--tags="${config.tags}"`,
    `--retry ${config.retries}`,
    ...config.format.map(f => `--format ${f}`),
    '--format-options \'{"snippetInterface": "async-await"}\'',
    '--publish-quiet'
  ];
  
  // Add debug options if DEBUG is enabled
  if (process.env.DEBUG === 'true') {
    args.push('--fail-fast');
  }
  
  // Add dry run for syntax checking
  if (process.env.DRY_RUN === 'true') {
    args.push('--dry-run');
  }
  
  return args.join(' ');
}

/**
 * Setup MCP (Model Context Protocol) integration
 * This is a placeholder for future MCP server integration
 */
function setupMCPIntegration(): void {
  if (process.env.MCP_ENABLED === 'true') {
    console.log('🔌 MCP Integration enabled');
    console.log('📋 MCP server configuration will be loaded from mcp-config.json');
    
    // TODO: Implement MCP server integration
    // This could include:
    // - Starting MCP servers
    // - Configuring communication channels
    // - Setting up test data providers
    // - Initializing AI-powered test assistants
    
    console.log('⚠️  MCP integration is currently a placeholder for future implementation');
  }
}

/**
 * Print test configuration information
 */
function printConfiguration(config: TestConfig): void {
  console.log('🚀 Starting Playwright + Cucumber Test Framework');
  console.log('════════════════════════════════════════════════');
  console.log(`🌐 Base URL: ${config.baseUrl}`);
  console.log(`🖥️  Browser: ${config.browser}`);
  console.log(`👁️  Headless: ${config.headless}`);
  console.log(`⚡ Parallel: ${config.parallel}`);
  console.log(`🏷️  Tags: ${config.tags}`);
  console.log(`⏱️  Timeout: ${config.timeout}ms`);
  console.log(`🔄 Retries: ${config.retries}`);
  console.log(`📊 Reports: ${config.format.join(', ')}`);
  console.log('════════════════════════════════════════════════');
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    console.log('🎬 Initializing test environment...');
    
    // Ensure required directories exist
    ensureDirectories();
    
    // Get configuration
    const config = getTestConfig();
    
    // Print configuration
    printConfiguration(config);
    
    // Setup MCP integration if enabled
    setupMCPIntegration();
    
    // Build and execute Cucumber command
    const command = buildCucumberCommand(config);
    
    console.log('▶️  Executing tests...');
    console.log(`📜 Command: ${command}`);
    console.log('');
    
    // Execute Cucumber tests
    execSync(command, {
      stdio: 'inherit',
      env: {
        ...process.env,
        // Pass configuration to Cucumber world
        BROWSER: config.browser,
        HEADLESS: config.headless.toString(),
        BASE_URL: config.baseUrl,
        TIMEOUT: config.timeout.toString(),
        PARALLEL: config.parallel.toString()
      }
    });
    
    console.log('');
    console.log('✅ Tests completed successfully!');
    console.log('📊 Check the reports directory for detailed results');
    
  } catch (error: any) {
    console.error('');
    console.error('❌ Test execution failed:');
    console.error(error.message);
    
    if (error.status) {
      console.error(`Exit code: ${error.status}`);
    }
    
    console.error('');
    console.error('💡 Troubleshooting tips:');
    console.error('   - Check if all dependencies are installed (npm install)');
    console.error('   - Verify browser binaries are installed (npm run install:browsers)');
    console.error('   - Check feature files and step definitions for syntax errors');
    console.error('   - Review test-results directory for failure details');
    
    process.exit(error.status || 1);
  }
}

// Execute if this file is run directly
if (require.main === module) {
  main();
}

export { main, getTestConfig, buildCucumberCommand };
