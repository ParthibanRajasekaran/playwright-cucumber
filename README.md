# 🎭 Playwright + Cucumber + TypeScript Test Automation Framework

A comprehensive, production-ready test automation framework combining **Playwright**, **Cucumber**, and **TypeScript** with modern development practices, extensive reporting, and CI/CD integration.

[![CI/CD Pipeline](https://github.com/your-username/playwright-cucumber/actions/workflows/playwright-cucumber.yml/badge.svg)](https://github.com/your-username/playwright-cucumber/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.44.0-green.svg)](https://playwright.dev/)
[![Cucumber](https://img.shields.io/badge/Cucumber-10.8.0-orange.svg)](https://cucumber.io/)

## 🚀 Features

### ✨ Core Capabilities
- **🎭 Playwright 1.44.0** - Latest features including enhanced trace viewer, storage states, and network interception
- **🥒 Cucumber.js 10.8.0** - BDD framework with TypeScript support and advanced reporting
- **📘 TypeScript 5.4.5** - Strict typing with latest ECMAScript features
- **🔧 Modern Tool Chain** - ESLint, Prettier, and comprehensive CI/CD

### 🌐 Cross-Browser Testing
- **Chromium** - Google Chrome, Microsoft Edge, and Chromium-based browsers
- **Firefox** - Mozilla Firefox
- **WebKit** - Safari and WebKit-based browsers
- **Mobile Devices** - iOS Safari, Android Chrome with device emulation

### 📊 Advanced Reporting
- **📈 Multiple Cucumber HTML Reporter** - Rich HTML reports with screenshots and videos
- **🎯 Playwright HTML Reporter** - Interactive test results with trace viewer
- **📋 Custom JSON Reports** - Machine-readable results for CI/CD integration
- **📸 Visual Evidence** - Automatic screenshots, videos, and traces on failure

### 🔧 Developer Experience
- **🏗️ Page Object Model** - Scalable and maintainable test architecture
- **🌍 Environment Configuration** - Support for multiple environments (dev, staging, prod)
- **🔐 Authentication Management** - Automatic login and session state persistence
- **🛠️ Debugging Tools** - VS Code debugging, headed mode, and trace analysis

### 🚀 CI/CD Integration
- **⚡ GitHub Actions** - Comprehensive workflow with matrix testing
- **🔍 Quality Gates** - Linting, type checking, and security audits
- **📦 Artifact Management** - Test results, reports, and failure evidence
- **🔔 Notifications** - Slack integration and GitHub PR comments

## 📁 Project Structure

```
playwright-cucumber/
├── 🎬 .github/workflows/         # CI/CD workflows
├── 🥒 features/                  # Cucumber feature files and step definitions
│   ├── login.feature            # Sample login functionality tests
│   └── step-definitions/        # TypeScript step definitions
├── 📜 scripts/                  # Build and utility scripts
│   ├── generate-report.js       # Custom report generation
│   └── report-styles.css        # Custom report styling
├── 🏗️ src/                      # Source code and test infrastructure
│   ├── config/                  # Global setup and configuration
│   │   ├── global-setup.ts      # Test environment initialization
│   │   └── global-teardown.ts   # Cleanup and summary generation
│   ├── fixtures/                # Test fixtures and world setup
│   │   ├── test-fixtures.ts     # Playwright fixtures
│   │   └── world.ts             # Cucumber world context
│   ├── pages/                   # Page Object Model classes
│   │   ├── BasePage.ts          # Base page with common functionality
│   │   ├── LoginPage.ts         # Login page interactions
│   │   ├── DashboardPage.ts     # Dashboard page interactions
│   │   └── index.ts             # Page exports
│   └── utils/                   # Utility functions and helpers
│       ├── assertions.ts        # Custom assertion utilities
│       └── test-data.ts         # Test data management
├── ⚙️ Configuration Files
│   ├── cucumber.config.js       # Cucumber configuration
│   ├── playwright.config.ts     # Playwright configuration
│   ├── tsconfig.json           # TypeScript configuration
│   └── package.json            # Dependencies and scripts
└── 📚 Documentation
    ├── README.md               # This file
    └── .env.example           # Environment variables template
```

## 🛠️ Quick Start

### Prerequisites
- **Node.js 18+** (LTS recommended)
- **npm 9+** or **yarn 1.22+**

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/playwright-cucumber.git
cd playwright-cucumber

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Run Tests

```bash
# Run smoke tests
npm run test:smoke

# Run regression tests
npm run test:regression

# Run specific browser
npm run test:chrome

# Run with custom tags
npm run test:cucumber -- --tags "@login and @smoke"

# Run in headed mode (see browser)
npm run test:headed
```

## 📋 Available Scripts

### 🧪 Testing Commands
```bash
# Basic test execution
npm run test                    # Run all tests
npm run test:smoke             # Run smoke tests (@smoke tag)
npm run test:regression        # Run regression tests (@regression tag)
npm run test:cucumber          # Run Cucumber tests with default config

# Browser-specific testing
npm run test:chrome            # Run tests in Chromium
npm run test:firefox           # Run tests in Firefox
npm run test:webkit            # Run tests in WebKit (Safari)
npm run test:edge              # Run tests in Edge

# Development and debugging
npm run test:headed            # Run tests in headed mode (visible browser)
npm run test:debug             # Run tests with debugging enabled
npm run test:trace             # Run tests with tracing enabled
npm run test:record            # Run tests with video recording

# Specialized testing
npm run test:visual            # Run visual regression tests
npm run test:performance       # Run performance tests
npm run test:accessibility     # Run accessibility tests
npm run test:mobile            # Run mobile device tests

# Parallel execution
npm run test:parallel          # Run tests in parallel (2 workers)
npm run test:parallel:max      # Run tests with maximum workers
```

### 📊 Reporting Commands
```bash
# Generate reports
npm run report:generate        # Generate all reports
npm run report:cucumber        # Generate Cucumber HTML report
npm run report:playwright      # Generate Playwright HTML report
npm run report:open            # Open latest HTML reports

# Serve reports locally
npm run report:serve           # Serve reports on local server
npm run report:performance     # Generate performance reports
```

### 🔧 Development Commands
```bash
# Code quality
npm run lint                   # Run ESLint
npm run lint:fix              # Fix ESLint issues automatically
npm run format                # Format code with Prettier
npm run type-check            # Run TypeScript compiler check

# Setup and maintenance
npm run setup                 # Initial project setup
npm run clean                 # Clean generated files
npm run browsers:install      # Install Playwright browsers
npm run browsers:update       # Update Playwright browsers
```

### 🚀 CI/CD Commands
```bash
# CI-specific commands
npm run ci:install            # Install dependencies (CI optimized)
npm run ci:test               # Run tests in CI mode
npm run ci:lint               # Run linting in CI mode
npm run ci:security           # Run security audit
```

## ⚙️ Configuration

### 🌍 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Application Configuration
BASE_URL=https://demo.playwright.dev
APP_ENV=staging

# Browser Configuration
BROWSER=chromium
HEADED=false
SLOW_MO=0

# Test Execution
PARALLEL=2
TIMEOUT=60000
RETRIES=1

# Authentication
SETUP_AUTH=true
AUTH_USERNAME=demo@playwright.dev
AUTH_PASSWORD=demo123

# Reporting
REPORT_CUCUMBER=true
REPORT_PLAYWRIGHT=true
GENERATE_TRACE=true
RECORD_VIDEO=true

# CI/CD Configuration
CI=false
DEBUG=false
CLEANUP_TEMP=true
ARCHIVE_ARTIFACTS=false

# MCP Integration (Future)
ENABLE_MCP=false
MCP_SERVER_URL=http://localhost:3000
MCP_CONFIG=mcp-config.json
```

### 🎭 Playwright Configuration

The framework includes a comprehensive Playwright configuration with:

- **Multiple Browser Projects** - Chromium, Firefox, WebKit, Edge, Mobile
- **Environment-based Settings** - Different configs for dev/staging/prod
- **Advanced Features** - Tracing, video recording, screenshots
- **Performance Optimization** - Parallel execution, retry logic
- **Global Setup/Teardown** - Authentication, cleanup, reporting

### 🥒 Cucumber Configuration

Cucumber is configured with:

- **TypeScript Support** - Full TypeScript integration
- **Custom World** - Enhanced context with Playwright integration
- **Flexible Formatting** - JSON, HTML, and custom formatters
- **Tag-based Execution** - Run specific test suites
- **Parallel Execution** - Multiple worker support

## 🧪 Writing Tests

### 📝 Feature Files

Create feature files in the `features/` directory using Gherkin syntax:

```gherkin
@login @smoke @regression
Feature: User Login Functionality
  As a user
  I want to be able to log into the application
  So that I can access my account

  Background:
    Given I am on the login page

  @positive @critical
  Scenario: Successful login with valid credentials
    When I enter valid username "demo@playwright.dev" and password "demo123"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  @negative @security
  Scenario Outline: Failed login with invalid credentials
    When I enter username "<username>" and password "<password>"
    And I click the login button
    Then I should see an error message "<error_message>"
    And I should remain on the login page

    Examples:
      | username          | password      | error_message                |
      | invalid@user.com  | validpass123  | Invalid username or password |
      | valid@user.com    | wrongpassword | Invalid username or password |
```

### 🔧 Step Definitions

Implement step definitions in TypeScript:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../../src/fixtures/world';

Given('I am on the login page', async function (this: ICustomWorld) {
  await this.pageManager!.loginPage.navigateToLoginPage();
  await this.pageManager!.loginPage.waitForPageLoad();
});

When('I enter valid username {string} and password {string}', 
  async function (this: ICustomWorld, username: string, password: string) {
    await this.pageManager!.loginPage.enterUsername(username);
    await this.pageManager!.loginPage.enterPassword(password);
});

Then('I should be redirected to the dashboard', 
  async function (this: ICustomWorld) {
    await this.pageManager!.loginPage.waitForLoginRedirect();
    const isOnDashboard = await this.pageManager!.dashboardPage.verifySuccessfulLogin();
    expect(isOnDashboard).toBe(true);
});
```

### 🏗️ Page Objects

Create maintainable page objects:

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usernameField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameField = page.locator('[data-testid=\"username\"]');
    this.passwordField = page.locator('[data-testid=\"password\"]');
    this.loginButton = page.locator('[data-testid=\"login-button\"]');
  }

  async navigateToLoginPage(): Promise<void> {
    await this.navigateTo('/login');
    await this.waitForPageLoad();
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameField.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordField.fill(password);
  }

  async clickLoginButton(): Promise<void> {
    await this.loginButton.click();
  }
}
```

## 📊 Reporting

The framework generates multiple types of reports:

### 📈 Cucumber HTML Report
- **Rich HTML interface** with filtering and search
- **Screenshots and videos** embedded in failed steps
- **Execution timeline** and duration metrics
- **Tag-based filtering** and test suite breakdown

### 🎯 Playwright HTML Report
- **Interactive test results** with trace viewer integration
- **Step-by-step execution** with screenshots
- **Network activity** and console logs
- **Performance metrics** and timing data

### 📋 JSON Reports
- **Machine-readable results** for CI/CD integration
- **Detailed test metadata** including tags and timing
- **Custom report generation** support
- **Third-party tool integration** (TestRail, Xray, etc.)

## 🚀 CI/CD Integration

### GitHub Actions Workflow

The included workflow provides:

- **✅ Multi-OS Testing** - Ubuntu, Windows, macOS
- **🌐 Cross-Browser Matrix** - All major browsers
- **🔍 Quality Gates** - Linting, type checking, security audit
- **📊 Automated Reporting** - HTML reports deployed to GitHub Pages
- **🔔 Notifications** - Slack integration and PR comments
- **⚡ Performance Testing** - Lighthouse integration
- **👁️ Visual Regression** - Screenshot comparison

### Environment-Specific Testing

```yaml
# Test against different environments
- name: Run staging tests
  run: npm run test:cucumber -- --tags "@smoke"
  env:
    BASE_URL: https://staging.example.com

- name: Run production smoke tests
  run: npm run test:cucumber -- --tags "@smoke and @critical"
  env:
    BASE_URL: https://production.example.com
```

## 🔧 Advanced Features

### 🔐 Authentication Management
- **Automatic login** with configurable credentials
- **Session state persistence** across test runs
- **Multi-user authentication** support
- **Token-based authentication** handling

### 📱 Mobile Testing
- **Device emulation** for iOS and Android
- **Responsive design testing** across viewports
- **Touch gesture simulation** and mobile-specific interactions
- **Performance testing** on mobile devices

### 🎯 Visual Testing
- **Screenshot comparison** with automatic baseline management
- **Cross-browser visual validation** 
- **Responsive layout testing** across device sizes
- **Visual regression detection** with diff highlighting

### ⚡ Performance Monitoring
- **Page load time measurement**
- **Core Web Vitals tracking**
- **Network performance analysis**
- **Lighthouse integration** for comprehensive audits

## 🔍 Debugging

### Local Debugging
```bash
# Run in headed mode to see browser
npm run test:headed

# Enable debug mode with detailed logging
npm run test:debug

# Record traces for detailed analysis
npm run test:trace

# Step-by-step debugging in VS Code
npm run test:debug:vscode
```

### VS Code Integration
- **Debugging configuration** included
- **Breakpoint support** in TypeScript code
- **Test execution** from VS Code interface
- **Integrated terminal** for running commands

### Trace Analysis
- **Playwright Trace Viewer** for step-by-step analysis
- **Network request inspection**
- **Console log analysis**
- **Performance timeline** visualization

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Write tests** for your changes
4. **Run the test suite** (`npm run test`)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines
- **Follow TypeScript best practices**
- **Write comprehensive tests** for new features
- **Update documentation** for significant changes
- **Ensure CI/CD pipeline passes**
- **Follow conventional commit messages**

## 📚 Resources & Documentation

### Official Documentation
- **[Playwright Documentation](https://playwright.dev/docs/intro)**
- **[Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)**
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**

### Framework Guides
- **[Page Object Model Best Practices](docs/page-object-model.md)**
- **[Writing Effective Tests](docs/writing-tests.md)**
- **[CI/CD Configuration Guide](docs/cicd-setup.md)**
- **[Troubleshooting Guide](docs/troubleshooting.md)**

### Community & Support
- **[GitHub Issues](https://github.com/your-username/playwright-cucumber/issues)** - Bug reports and feature requests
- **[Discussions](https://github.com/your-username/playwright-cucumber/discussions)** - Questions and community support
- **[Wiki](https://github.com/your-username/playwright-cucumber/wiki)** - Extended documentation and examples

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Microsoft Playwright Team** for the amazing testing framework
- **Cucumber.js Contributors** for BDD testing capabilities
- **TypeScript Team** for type-safe JavaScript
- **Open Source Community** for inspiration and contributions

---

**Built with ❤️ for the testing community**

*Happy Testing! 🧪✨*
# CI Test - Tue Aug 19 19:25:28 BST 2025
