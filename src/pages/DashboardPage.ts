import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  private readonly pageHeader: Locator;
  private readonly userMenu: Locator;
  private readonly logoutButton: Locator;
  private readonly navigationMenu: Locator;
  private readonly welcomeMessage: Locator;
  private readonly userProfile: Locator;
  private readonly notificationBell: Locator;
  private readonly searchBox: Locator;
  private readonly mainContent: Locator;
  private readonly sidebar: Locator;

  constructor(page: Page) {
    super(page);

    // Updated selectors for the-internet.herokuapp.com secure page
    this.pageHeader = page.locator("h2").filter({ hasText: /secure/i });
    this.userMenu = page
      .locator('[data-testid="user-menu"], .user-menu, .dropdown-toggle')
      .filter({ visible: true });
    this.logoutButton = page.locator(
      'a[href*="logout"].button.secondary.radius',
    );
    this.navigationMenu = page.locator(
      '[data-testid="nav-menu"], .navigation, .main-nav',
    );
    this.welcomeMessage = page
      .locator("p")
      .filter({ hasText: /welcome|login/i });
    this.userProfile = page.locator(
      '[data-testid="user-profile"], .user-profile, .profile-link',
    );
    this.notificationBell = page.locator(
      '[data-testid="notifications"], .notification-bell, .notifications',
    );
    this.searchBox = page.locator(
      '[data-testid="search"], input[type="search"], .search-input',
    );
    this.mainContent = page.locator("#content .example");
    this.sidebar = page.locator('[data-testid="sidebar"], .sidebar, .side-nav');
  }

  async navigateToDashboard(): Promise<void> {
    await this.goto("/dashboard");
    await this.waitForDashboardLoad();
  }

  async waitForDashboardLoad(): Promise<void> {
    await this.waitForElement(this.pageHeader);
    await this.waitForElement(this.mainContent);
  }

  async isDashboardVisible(): Promise<boolean> {
    const headerVisible = await this.isVisible(this.pageHeader);
    const contentVisible = await this.isVisible(this.mainContent);
    return headerVisible && contentVisible;
  }

  async isNavigationMenuVisible(): Promise<boolean> {
    return await this.isVisible(this.navigationMenu);
  }

  async getWelcomeMessage(): Promise<string> {
    if (await this.isVisible(this.welcomeMessage)) {
      return await this.getText(this.welcomeMessage);
    }
    return await this.getText(this.pageHeader);
  }

  async logout(): Promise<void> {
    if (await this.isVisible(this.userMenu)) {
      await this.clickElement(this.userMenu);
    }
    await this.clickElement(this.logoutButton);
  }

  async openUserProfile(): Promise<void> {
    await this.clickElement(this.userProfile);
  }

  async search(searchTerm: string): Promise<void> {
    await this.fillInput(this.searchBox, searchTerm);
    await this.searchBox.press("Enter");
  }

  async hasNotifications(): Promise<boolean> {
    if (await this.isVisible(this.notificationBell)) {
      const notificationCount = await this.notificationBell
        .locator(".notification-count, .badge")
        .textContent();
      return notificationCount !== null && notificationCount !== "0";
    }
    return false;
  }

  async navigateToMenuItem(menuItem: string): Promise<void> {
    const menuLink = this.navigationMenu
      .locator("a, button")
      .filter({ hasText: new RegExp(menuItem, "i") });
    await this.clickElement(menuLink);
  }

  async getCurrentUserInfo(): Promise<string> {
    const userInfoSelectors = [
      '[data-testid="current-user"]',
      ".current-user",
      ".user-name",
      ".username",
      ".user-info",
    ];

    for (const selector of userInfoSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible()) {
        return (await element.textContent()) || "";
      }
    }

    return "";
  }

  async isSidebarExpanded(): Promise<boolean> {
    if (await this.isVisible(this.sidebar)) {
      const sidebarClass = (await this.sidebar.getAttribute("class")) || "";
      return (
        !sidebarClass.includes("collapsed") &&
        !sidebarClass.includes("minimized")
      );
    }
    return false;
  }

  async toggleSidebar(): Promise<void> {
    const toggleButton = this.page
      .locator('[data-testid="sidebar-toggle"], .sidebar-toggle, .menu-toggle')
      .first();
    await this.clickElement(toggleButton);
  }

  async verifySuccessfulLogin(): Promise<boolean> {
    try {
      await this.waitForDashboardLoad();

      const currentUrl = this.getCurrentUrl();
      const urlCheck =
        currentUrl.includes("/secure") ||
        currentUrl.includes("/dashboard") ||
        currentUrl.includes("/home");

      const dashboardVisible = await this.isDashboardVisible();

      return urlCheck && dashboardVisible;
    } catch {
      return false;
    }
  }
}
