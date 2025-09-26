import { Page, BrowserContext, Locator } from "@playwright/test";
/** * Base Page Object Model class * All page objects should extend this class to inherit common functionality */ export abstract class BasePage {
  protected readonly page: Page;
  protected readonly context: BrowserContext;
  constructor(page: Page) {
    this.page = page;
    this.context = page.context();
  }
  /**   * Navigate to a specific URL   * @param url - URL to navigate to   * @param options - Navigation options   */ async goto(
    url: string,
    options?: Parameters<Page["goto"]>[1],
  ): Promise<void> {
    await this.page.goto(url, { waitUntil: "domcontentloaded", ...options });
  }
  /**   * Wait for the page to be loaded   */ async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForLoadState("networkidle");
  }
  /**   * Get the page title   */ async getPageTitle(): Promise<string> {
    return await this.page.title();
  }
  /**   * Get the current URL   */ getCurrentUrl(): string {
    return this.page.url();
  }
  /**   * Take a screenshot   * @param name - Screenshot name   */ async takeScreenshot(
    name: string,
  ): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }
  /**   * Wait for an element to be visible   * @param locator - Element locator   * @param timeout - Timeout in milliseconds   */ async waitForElement(
    locator: Locator,
    timeout?: number,
  ): Promise<void> {
    await locator.waitFor({ state: "visible", timeout: timeout || 30000 });
  }
  /**   * Click on an element   * @param locator - Element locator   * @param options - Click options   */ async clickElement(
    locator: Locator,
    options?: Parameters<Locator["click"]>[0],
  ): Promise<void> {
    await locator.click({ timeout: 30000, ...options });
  }
  /**   * Fill an input field   * @param locator - Input field locator   * @param value - Value to fill   */ async fillInput(
    locator: Locator,
    value: string,
  ): Promise<void> {
    await locator.fill(value, { timeout: 30000 });
  }
  /**   * Get text content of an element   * @param locator - Element locator   */ async getText(
    locator: Locator,
  ): Promise<string> {
    return (await locator.textContent()) || "";
  }
  /**   * Check if an element is visible   * @param locator - Element locator   */ async isVisible(
    locator: Locator,
  ): Promise<boolean> {
    return await locator.isVisible();
  }
  /**   * Scroll to an element   * @param locator - Element locator   */ async scrollToElement(
    locator: Locator,
  ): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }
  /**   * Wait for a specific amount of time   * @param milliseconds - Time to wait in milliseconds   */ async wait(
    milliseconds: number,
  ): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }
  /**   * Reload the current page   */ async reload(): Promise<void> {
    await this.page.reload({ waitUntil: "domcontentloaded" });
  }
  /**   * Execute JavaScript in the page context   * @param script - JavaScript code to execute   * @param args - Arguments to pass to the script   */ async executeScript<
    T,
  >(script: string, ...args: any[]): Promise<T> {
    return await this.page.evaluate(script, ...args);
  }
  /**   * Handle page dialogs   * @param accept - Whether to accept the dialog   * @param promptText - Text to enter in prompt dialogs   */ async handleDialog(
    accept: boolean,
    promptText?: string,
  ): Promise<void> {
    this.page.on("dialog", async (dialog) => {
      if (promptText && dialog.type() === "prompt") {
        await dialog.accept(promptText);
      } else if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }
  /**   * Get the page source   */ async getPageSource(): Promise<string> {
    return await this.page.content();
  }
}
