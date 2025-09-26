const { chromium: _chromium, firefox: _firefox, webkit: _webkit } = require('playwright'); // Available browsers

// Configure Cucumber to work with TypeScript
module.exports = {
  default: {
    require: [
      'ts-node/register',
      'features/step-definitions/**/*.ts',
      'src/fixtures/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      '@cucumber/pretty-formatter',
      'json:test-results/cucumber-report.json',
      'html:reports/cucumber-html-report.html'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    // Removed publishQuiet as it's deprecated - see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md
    dryRun: false,
    parallel: 2,
    retry: 1,
    retryTagFilter: '@flaky',
    tags: process.env.TAGS || 'not @skip',
    timeout: 60000, // 60 seconds default timeout
    worldParameters: {
      browser: process.env.BROWSER || 'chromium',
      headless: process.env.HEADED !== 'true',
      slowMo: parseInt(process.env.SLOW_MO) || 0,
      baseURL: process.env.BASE_URL || 'https://the-internet.herokuapp.com',
      viewport: {
        width: parseInt(process.env.VIEWPORT_WIDTH) || 1280,
        height: parseInt(process.env.VIEWPORT_HEIGHT) || 720
      },
      video: process.env.VIDEO === 'true',
      trace: process.env.TRACE === 'true'
    }
  }
};
