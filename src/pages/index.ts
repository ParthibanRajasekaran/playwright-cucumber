import { LoginPage } from "./LoginPage";
import { DashboardPage } from "./DashboardPage";

/**
 * Page Object Manager
 * Centralized access to all page objects
 */
export class PageManager {
  private readonly page: import("@playwright/test").Page;

  private _loginPage: LoginPage | undefined;
  private _dashboardPage: DashboardPage | undefined;

  constructor(page: import("@playwright/test").Page) {
    this.page = page;
  }

  /**
   * Get Login Page instance
   */
  get loginPage(): LoginPage {
    if (!this._loginPage) {
      this._loginPage = new LoginPage(this.page);
    }
    return this._loginPage;
  }

  /**
   * Get Dashboard Page instance
   */
  get dashboardPage(): DashboardPage {
    if (!this._dashboardPage) {
      this._dashboardPage = new DashboardPage(this.page);
    }
    return this._dashboardPage;
  }

  /**
   * Reset all page instances (useful for test cleanup)
   */
  reset(): void {
    this._loginPage = undefined;
    this._dashboardPage = undefined;
  }
}

// Export all page objects for direct import if needed
export { BasePage } from "./BasePage";
export { LoginPage } from "./LoginPage";
export { DashboardPage } from "./DashboardPage";
