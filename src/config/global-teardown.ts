import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Global teardown function that runs after all tests complete
 */
async function globalTeardown(_config: FullConfig): Promise<void> {
  console.log('\n🧹 Running global teardown...');
  
  try {
    // Clean up authentication states
    await cleanupAuthenticationStates();
    
    // Clean up temporary files
    await cleanupTemporaryFiles();
    
    // Archive test artifacts
    await archiveTestArtifacts();
    
    // Cleanup MCP integration
    await cleanupMCPIntegration();
    
    // Generate final summary
    generateFinalSummary();
    
    console.log('✅ Global teardown completed successfully\n');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', (error as Error).message);
    process.exit(1);
  }
}

/**
 * Clean up authentication storage states
 */
async function cleanupAuthenticationStates(): Promise<void> {
  console.log('🔐 Cleaning up authentication states...');
  
  const storageStatesDir = 'storage-states';
  
  if (!fs.existsSync(storageStatesDir)) {
    console.log('   ℹ️  No storage states directory found');
    return;
  }
  
  try {
    const files = fs.readdirSync(storageStatesDir);
    let cleanedCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(storageStatesDir, file);
        const stats = fs.statSync(filePath);
        
        // Remove files older than 1 day (for CI/CD environments)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        if (stats.mtime < oneDayAgo && process.env['CI'] === 'true') {
          fs.unlinkSync(filePath);
          cleanedCount++;
          console.log(`   🗑️  Removed old auth state: ${file}`);
        }
      }
    }
    
    if (cleanedCount === 0) {
      console.log('   ✓ Authentication states preserved for local development');
    } else {
      console.log(`   ✓ Cleaned up ${cleanedCount} old authentication state(s)`);
    }
    
  } catch (error) {
    console.warn('   ⚠️  Failed to clean authentication states:', (error as Error).message);
  }
}

/**
 * Clean up temporary files created during test execution
 */
async function cleanupTemporaryFiles(): Promise<void> {
  console.log('🗂️  Cleaning up temporary files...');
  
  const tempPaths = [
    'temp',
    '.temp',
    'test-tmp',
    'playwright-temp'
  ];
  
  let cleanedCount = 0;
  
  for (const tempPath of tempPaths) {
    if (fs.existsSync(tempPath)) {
      try {
        fs.rmSync(tempPath, { recursive: true, force: true });
        cleanedCount++;
        console.log(`   🗑️  Removed: ${tempPath}`);
      } catch (error) {
        console.warn(`   ⚠️  Failed to remove ${tempPath}:`, (error as Error).message);
      }
    }
  }
  
  if (cleanedCount === 0) {
    console.log('   ✓ No temporary files to clean');
  } else {
    console.log(`   ✓ Cleaned up ${cleanedCount} temporary director(ies)`);
  }
}

/**
 * Archive test artifacts for CI/CD environments
 */
async function archiveTestArtifacts(): Promise<void> {
  console.log('� Archiving test artifacts...');
  
  const artifactDirs = [
    'test-results',
    'playwright-report',
    'cucumber-reports',
    'screenshots',
    'videos',
    'traces'
  ];
  
  // Only archive in CI environments
  if (process.env['CI'] !== 'true') {
    console.log('   ℹ️  Artifact archiving skipped (not in CI environment)');
    return;
  }
  
  const archiveDir = 'archived-artifacts';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archivePath = path.join(archiveDir, `test-run-${timestamp}`);
  
  try {
    // Create archive directory
    fs.mkdirSync(archivePath, { recursive: true });
    
    let archivedCount = 0;
    
    for (const artifactDir of artifactDirs) {
      if (fs.existsSync(artifactDir)) {
        const targetPath = path.join(archivePath, artifactDir);
        
        // Copy directory to archive
        fs.cpSync(artifactDir, targetPath, { recursive: true });
        archivedCount++;
        
        console.log(`   📦 Archived: ${artifactDir} → ${targetPath}`);
      }
    }
    
    if (archivedCount > 0) {
      console.log(`   ✓ Archived ${archivedCount} artifact director(ies) to ${archivePath}`);
      
      // Create a manifest file
      const manifest = {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: `${process.platform} ${process.arch}`,
        archivedDirectories: artifactDirs.filter(dir => fs.existsSync(dir)),
        totalSize: calculateDirectorySize(archivePath)
      };
      
      fs.writeFileSync(
        path.join(archivePath, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      );
      
    } else {
      console.log('   ℹ️  No artifacts to archive');
      // Remove empty archive directory
      fs.rmSync(archivePath, { recursive: true, force: true });
    }
    
  } catch (error) {
    console.warn('   ⚠️  Failed to archive artifacts:', (error as Error).message);
  }
}

/**
 * Cleanup MCP integration resources
 */
async function cleanupMCPIntegration(): Promise<void> {
  if (process.env['MCP_ENABLED'] !== 'true') {
    return;
  }
  
  console.log('🔌 Cleaning up MCP integration...');
  
  // TODO: Implement MCP server shutdown and cleanup
  // This could include:
  // - Gracefully shutting down MCP servers
  // - Cleaning up communication channels
  // - Saving any generated test data or insights
  // - Closing AI assistant connections
  
  console.log('   ⚠️  MCP cleanup is currently a placeholder for future implementation');
}

/**
 * Generate final test execution summary
 */
function generateFinalSummary(): void {
  console.log('📊 Generating final summary...');
  
  const summaryData = {
    teardownTimestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: `${process.platform} ${process.arch}`,
    workingDirectory: process.cwd(),
    environment: {
      baseUrl: process.env['BASE_URL'] || 'https://demo.playwright.dev',
      browser: process.env['BROWSER'] || 'chromium',
      headless: process.env['HEADED'] !== 'true',
      ciMode: process.env['CI'] || 'false',
      debugMode: process.env['DEBUG'] || 'false',
      mcpEnabled: process.env['MCP_ENABLED'] || 'false'
    },
    artifactsGenerated: {
      hasTestResults: fs.existsSync('test-results'),
      hasPlaywrightReport: fs.existsSync('playwright-report'),
      hasCucumberReports: fs.existsSync('cucumber-reports'),
      hasScreenshots: fs.existsSync('screenshots'),
      hasVideos: fs.existsSync('videos'),
      hasTraces: fs.existsSync('traces')
    }
  };
  
  // Write summary to file
  const summaryPath = 'test-execution-summary.json';
  try {
    fs.writeFileSync(summaryPath, JSON.stringify(summaryData, null, 2));
    console.log(`   ✓ Test execution summary saved to ${summaryPath}`);
  } catch (error) {
    console.warn('   ⚠️  Failed to save execution summary:', (error as Error).message);
  }
  
  // Log summary to console
  console.log('ℹ️  Final Test Execution Summary:');
  console.log(`   Duration: Test session completed at ${summaryData.teardownTimestamp}`);
  console.log(`   Environment: ${summaryData.environment.baseUrl} (${summaryData.environment.browser})`);
  console.log(`   Artifacts: ${Object.values(summaryData.artifactsGenerated).filter(Boolean).length} types generated`);
  console.log(`   Platform: ${summaryData.platform} (Node.js ${summaryData.nodeVersion})`);
  
  // Clean up browser processes (CI environments)
  if (process.env['CI'] === 'true') {
    try {
      execSync('pkill -f chromium || true', { stdio: 'ignore' });
      execSync('pkill -f firefox || true', { stdio: 'ignore' });
      execSync('pkill -f webkit || true', { stdio: 'ignore' });
      console.log('   ✓ Browser processes cleaned up');
    } catch (error) {
      // Ignore errors in cleanup
    }
  }
}

/**
 * Calculate directory size in bytes
 */
function calculateDirectorySize(dirPath: string): number {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        totalSize += calculateDirectorySize(filePath);
      } else {
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // Ignore errors for inaccessible directories
  }
  
  return totalSize;
}

export default globalTeardown;
