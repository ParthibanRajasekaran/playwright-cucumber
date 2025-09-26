#!/usr/bin/env node

/**
 * Enhanced Report Generation Script for Playwright + Cucumber Framework
 * 
 * Features:
 * - Generates multiple report formats
 * - Merges Playwright and Cucumber reports
 * - Creates comprehensive HTML reports with screenshots and traces
 * - Supports CI/CD integration
 * - Links video recordings and traces
 */

const fs = require('fs');
const path = require('path');
const { generate } = require('multiple-cucumber-html-reporter');

/**
 * Configuration for report generation
 */
const config = {
  reportDir: 'reports',
  cucumberJsonDir: 'test-results',
  // Playwright HTML report disabled as requested
  screenshotsDir: 'reports/screenshots',
  videosDir: 'reports/videos', 
  tracesDir: 'reports/traces',
  outputDir: 'reports/cucumber-html-report'
};

/**
 * Ensure directories exist
 */
function ensureDirectories() {
  const dirs = [
    config.reportDir,
    config.outputDir,
    config.screenshotsDir,
    config.videosDir,
    config.tracesDir
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
}

/**
 * Get browser information
 */
function getBrowserInfo() {
  return [
    {
      name: 'chrome',
      version: 'Latest'
    },
    {
      name: 'firefox', 
      version: 'Latest'
    },
    {
      name: 'safari',
      version: 'Latest'
    }
  ];
}

/**
 * Get test metadata
 */
function getTestMetadata() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  return {
    app: {
      name: packageJson.name || 'Playwright + Cucumber Framework',
      version: packageJson.version || '1.0.0'
    },
    testData: {
      Total: '0',
      Passed: '0', 
      Failed: '0',
      Pending: '0'
    },
    env: {
      Browser: process.env.BROWSER || 'chromium',
      'Base URL': process.env.BASE_URL || 'https://demo.playwright.dev',
      Platform: process.platform,
      'Node Version': process.version,
      Environment: process.env.NODE_ENV || 'test'
    }
  };
}

/**
 * Parse cucumber report and extract statistics
 */
function parseTestResults() {
  const resultsPath = path.join(config.cucumberJsonDir, 'cucumber-report.json');
  
  if (!fs.existsSync(resultsPath)) {
    console.warn(`⚠️  Cucumber report not found at ${resultsPath}`);
    return { total: 0, passed: 0, failed: 0, pending: 0 };
  }
  
  try {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    let total = 0, passed = 0, failed = 0, pending = 0;
    
    if (Array.isArray(results)) {
      results.forEach(feature => {
        if (feature.elements) {
          feature.elements.forEach(scenario => {
            if (scenario.steps) {
              total++;
              const scenarioStatus = scenario.steps.every(step => 
                step.result && step.result.status === 'passed'
              );
              
              if (scenarioStatus) {
                passed++;
              } else {
                const hasFailed = scenario.steps.some(step => 
                  step.result && step.result.status === 'failed'
                );
                if (hasFailed) {
                  failed++;
                } else {
                  pending++;
                }
              }
            }
          });
        }
      });
    }
    
    return { total, passed, failed, pending };
  } catch (error) {
    console.error('❌ Error parsing cucumber results:', error.message);
    return { total: 0, passed: 0, failed: 0, pending: 0 };
  }
}

/**
 * Link media files (screenshots, videos, traces) to scenarios
 */
function linkMediaFiles() {
  const mediaFiles = {
    screenshots: [],
    videos: [],
    traces: []
  };
  
  // Find screenshot files
  if (fs.existsSync(config.screenshotsDir)) {
    mediaFiles.screenshots = fs.readdirSync(config.screenshotsDir)
      .filter(file => file.endsWith('.png') || file.endsWith('.jpg'))
      .map(file => path.join(config.screenshotsDir, file));
  }
  
  // Find video files
  if (fs.existsSync(config.videosDir)) {
    mediaFiles.videos = fs.readdirSync(config.videosDir)
      .filter(file => file.endsWith('.webm') || file.endsWith('.mp4'))
      .map(file => path.join(config.videosDir, file));
  }
  
  // Find trace files
  if (fs.existsSync(config.tracesDir)) {
    mediaFiles.traces = fs.readdirSync(config.tracesDir)
      .filter(file => file.endsWith('.zip'))
      .map(file => path.join(config.tracesDir, file));
  }
  
  console.log(`📸 Found ${mediaFiles.screenshots.length} screenshots`);
  console.log(`🎥 Found ${mediaFiles.videos.length} videos`);
  console.log(`📊 Found ${mediaFiles.traces.length} traces`);
  
  return mediaFiles;
}

/**
 * Generate enhanced HTML report
 */
function generateCucumberReport() {
  const jsonFiles = fs.readdirSync(config.cucumberJsonDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(config.cucumberJsonDir, file));
  
  if (jsonFiles.length === 0) {
    console.warn('⚠️  No JSON report files found');
    return;
  }
  
  const testResults = parseTestResults();
  const metadata = getTestMetadata();
  
  // Update metadata with actual test results
  metadata.testData = {
    Total: testResults.total.toString(),
    Passed: testResults.passed.toString(),
    Failed: testResults.failed.toString(),
    Pending: testResults.pending.toString()
  };
  
  const reportOptions = {
    jsonDir: config.cucumberJsonDir,
    reportPath: config.outputDir,
    metadata: {
      browser: getBrowserInfo(),
      device: 'Desktop',
      platform: {
        name: process.platform,
        version: 'Latest'
      }
    },
    customData: {
      title: 'Playwright + Cucumber Test Report',
      data: [
        { label: 'Project', value: metadata.app.name },
        { label: 'Version', value: metadata.app.version },
        { label: 'Test Environment', value: metadata.env.Environment },
        { label: 'Base URL', value: metadata.env['Base URL'] },
        { label: 'Browser', value: metadata.env.Browser },
        { label: 'Platform', value: metadata.env.Platform },
        { label: 'Node Version', value: metadata.env['Node Version'] },
        { label: 'Execution Date', value: new Date().toLocaleString() }
      ]
    },
    reportName: 'Playwright + Cucumber Test Report',
    pageTitle: 'Test Automation Report',
    displayDuration: true,
    displayReportTime: true,
    durationInMS: true,
    customStyle: fs.existsSync(path.join('scripts', 'report-styles.css')) ? 
      path.join('scripts', 'report-styles.css') : undefined,
    overrideStyle: false,
    openReportInBrowser: false,
    saveCollectedJSON: true,
    disableLog: false,
    pageFooter: `
      <div style="text-align: center; margin-top: 20px; padding: 10px; border-top: 1px solid #ddd;">
        <p><strong>Generated by Playwright + Cucumber Framework</strong></p>
        <p>For trace files and videos, check the test-results directory</p>
        <p>Framework designed for scalability and MCP integration</p>
      </div>
    `,
    customMetadata: true
  };
  
  try {
    generate(reportOptions);
    console.log('✅ Cucumber HTML report generated successfully');
    console.log(`📊 Report location: ${config.outputDir}/index.html`);
  } catch (error) {
    console.error('❌ Error generating Cucumber report:', error.message);
    throw error;
  }
}

/**
 * Create summary report with links to all artifacts
 */
function createSummaryReport() {
  const testResults = parseTestResults();
  const mediaFiles = linkMediaFiles();
  const metadata = getTestMetadata();
  
  const summaryHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Execution Summary</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .stat-number { font-size: 2em; font-weight: bold; color: #333; }
        .stat-label { color: #666; margin-top: 5px; }
        .passed { border-left-color: #28a745; }
        .failed { border-left-color: #dc3545; }
        .pending { border-left-color: #ffc107; }
        .links { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 30px 0; }
        .link-card { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; transition: transform 0.2s; }
        .link-card:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .link-card a { text-decoration: none; color: #007bff; font-weight: bold; }
        .metadata { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .metadata table { width: 100%; border-collapse: collapse; }
        .metadata th, .metadata td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        .metadata th { background: #e9ecef; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #dee2e6; }
        .trace-instructions { margin-top: 10px; padding: 10px; background: #e8f4f8; border-radius: 4px; font-size: 0.9em; }
        .trace-instructions code { background: #f1f1f1; padding: 2px 4px; border-radius: 2px; font-family: 'Courier New', monospace; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Test Automation Framework</h1>
            <h2>Playwright + Cucumber + TypeScript</h2>
            <p>Execution Summary - ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="content">
            <h3>📊 Test Results</h3>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${testResults.total}</div>
                    <div class="stat-label">Total Tests</div>
                </div>
                <div class="stat-card passed">
                    <div class="stat-number">${testResults.passed}</div>
                    <div class="stat-label">Passed</div>
                </div>
                <div class="stat-card failed">
                    <div class="stat-number">${testResults.failed}</div>
                    <div class="stat-label">Failed</div>
                </div>
                <div class="stat-card pending">
                    <div class="stat-number">${testResults.pending}</div>
                    <div class="stat-label">Pending</div>
                </div>
            </div>
            
            <h3>📋 Reports & Artifacts</h3>
            <div class="links">
                <div class="link-card">
                    <h4>🥒 Cucumber HTML Report</h4>
                    <p>Detailed BDD test report with scenarios and steps</p>
                    <a href="cucumber-html-report/index.html" target="_blank">View Report →</a>
                </div>
                <div class="link-card">
                    <h4>📸 Screenshots</h4>
                    <p>Visual evidence of test failures</p>
                    <a href="screenshots/" target="_blank">View Screenshots (${mediaFiles.screenshots.length}) →</a>
                </div>
                <div class="link-card">
                    <h4>🎥 Videos</h4>
                    <p>Video recordings of failed test executions</p>
                    <a href="videos/" target="_blank">View Videos (${mediaFiles.videos.length}) →</a>
                </div>
                <div class="link-card">
                    <h4>📊 Traces</h4>
                    <p>Interactive trace files for debugging</p>
                    <a href="traces/" target="_blank">View Traces (${mediaFiles.traces.length}) →</a>
                    <br><br>
                    <div class="trace-instructions">
                        <strong>🔍 How to view traces:</strong><br>
                        • Method 1: <code>npx playwright show-trace [trace-file.zip]</code><br>
                        • Method 2: Drag trace file to <a href="https://trace.playwright.dev" target="_blank">trace.playwright.dev</a><br>
                        • Method 3: Use trace links in Cucumber report attachments
                    </div>
                </div>
                    <p>Screen recordings of test execution</p>
                    <a href="../test-results/videos/" target="_blank">View Videos (${mediaFiles.videos.length}) →</a>
                </div>
                <div class="link-card">
                    <h4>📊 Traces</h4>
                    <p>Detailed execution traces for debugging</p>
                    <a href="../test-results/traces/" target="_blank">View Traces (${mediaFiles.traces.length}) →</a>
                </div>
                <div class="link-card">
                    <h4>📄 Raw Reports</h4>
                    <p>JSON and XML test results</p>
                    <a href="../test-results/" target="_blank">View Raw Data →</a>
                </div>
            </div>
            
            <h3>ℹ️ Test Environment</h3>
            <div class="metadata">
                <table>
                    <tr><th>Property</th><th>Value</th></tr>
                    <tr><td>Application</td><td>${metadata.app.name}</td></tr>
                    <tr><td>Version</td><td>${metadata.app.version}</td></tr>
                    <tr><td>Base URL</td><td>${metadata.env['Base URL']}</td></tr>
                    <tr><td>Browser</td><td>${metadata.env.Browser}</td></tr>
                    <tr><td>Platform</td><td>${metadata.env.Platform}</td></tr>
                    <tr><td>Node Version</td><td>${metadata.env['Node Version']}</td></tr>
                    <tr><td>Environment</td><td>${metadata.env.Environment}</td></tr>
                    <tr><td>CI Mode</td><td>${process.env.CI || 'false'}</td></tr>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Playwright + Cucumber + TypeScript Test Framework</strong></p>
            <p>🚀 Designed for scalability, extensibility, and MCP integration</p>
            <p>Generated on ${new Date().toISOString()}</p>
        </div>
    </div>
</body>
</html>`;
  
  const summaryPath = path.join(config.reportDir, 'index.html');
  fs.writeFileSync(summaryPath, summaryHtml);
  console.log(`✅ Summary report created: ${summaryPath}`);
}

/**
 * Create trace index page for easy access
 */
function createTraceIndex() {
  if (!fs.existsSync(config.tracesDir)) {
    return;
  }

  const traceFiles = fs.readdirSync(config.tracesDir)
    .filter(file => file.endsWith('.zip'))
    .map(file => ({
      name: file,
      path: file,
      size: fs.statSync(path.join(config.tracesDir, file)).size,
      modified: fs.statSync(path.join(config.tracesDir, file)).mtime
    }));

  if (traceFiles.length === 0) {
    return;
  }

  const traceIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright Traces</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .trace-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
        .trace-name { font-weight: bold; font-size: 1.1em; margin-bottom: 5px; }
        .trace-info { color: #666; font-size: 0.9em; margin-bottom: 10px; }
        .trace-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .btn { padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 0.9em; font-weight: bold; transition: background-color 0.2s; }
        .btn-primary { background: #007bff; color: white; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn:hover { opacity: 0.9; }
        .instructions { background: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        code { background: #f1f1f1; padding: 2px 4px; border-radius: 2px; font-family: 'Courier New', monospace; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Playwright Trace Files</h1>
            <p>Interactive debugging traces from failed test executions</p>
        </div>
        
        <div class="instructions">
            <h3>🔍 How to View Trace Files:</h3>
            <p><strong>Method 1:</strong> Click "Open with Playwright CLI" below (requires Playwright installed)</p>
            <p><strong>Method 2:</strong> Download the trace file and drag it to <a href="https://trace.playwright.dev" target="_blank">trace.playwright.dev</a></p>
            <p><strong>Method 3:</strong> Use command: <code>npx playwright show-trace [filename]</code></p>
        </div>
        
        ${traceFiles.map(trace => `
        <div class="trace-item">
            <div class="trace-name">${trace.name}</div>
            <div class="trace-info">
                Size: ${(trace.size / 1024).toFixed(1)} KB | 
                Modified: ${trace.modified.toLocaleString()}
            </div>
            <div class="trace-actions">
                <a href="${trace.path}" download class="btn btn-primary">📥 Download Trace</a>
                <a href="https://trace.playwright.dev" target="_blank" class="btn btn-secondary">🌐 Open Trace Viewer</a>
                <button onclick="copyCommand('${trace.path}')" class="btn btn-secondary">📋 Copy CLI Command</button>
            </div>
        </div>
        `).join('')}
    </div>
    
    <script>
        function copyCommand(filename) {
            const command = \`npx playwright show-trace traces/\${filename}\`;
            navigator.clipboard.writeText(command).then(() => {
                alert('CLI command copied to clipboard!');
            });
        }
    </script>
</body>
</html>`;

  const traceIndexPath = path.join(config.tracesDir, 'index.html');
  fs.writeFileSync(traceIndexPath, traceIndexHtml);
  console.log(`📊 Trace index created: ${traceIndexPath}`);
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🎯 Starting enhanced report generation...');
    console.log('════════════════════════════════════════');
    
    // Ensure directories exist
    ensureDirectories();
    
    // Link media files (for future use)
    const _mediaFiles = linkMediaFiles(); // Reserved for media attachments
    
    // Generate Cucumber HTML report
    console.log('📝 Generating Cucumber HTML report...');
    generateCucumberReport();
    
    // Create summary report
    console.log('📋 Creating summary report...');
    createSummaryReport();
    
    // Create trace index for easy access
    console.log('📊 Creating trace index...');
    createTraceIndex();
    
    console.log('');
    console.log('✅ Report generation completed successfully!');
    console.log('════════════════════════════════════════');
    console.log(`📊 Main report: ${config.reportDir}/index.html`);
    console.log(`🥒 Cucumber report: ${config.outputDir}/index.html`);
    console.log('');
    console.log('💡 To serve reports locally:');
    console.log(`   npx http-server ${config.reportDir} -p 8080 -o`);
    
  } catch (error) {
    console.error('');
    console.error('❌ Report generation failed:');
    console.error(error.message);
    console.error('');
    console.error('💡 Troubleshooting tips:');
    console.error('   - Check if test-results directory exists');
    console.error('   - Verify cucumber JSON files are generated');
    console.error('   - Ensure proper file permissions');
    
    process.exit(1);
  }
}

// Execute if this file is run directly
if (require.main === module) {
  main();
}

module.exports = {
  generateCucumberReport,
  createSummaryReport,
  linkMediaFiles,
  parseTestResults
};
