import { Page, Locator, expect } from '@playwright/test';

/**
 * Enhanced assertion utilities for Playwright tests
 * Provides custom assertions with better error messages and debugging
 */
export class AssertionUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Assert that an element is visible with custom timeout
   * @param locator - Element locator
   * @param timeout - Custom timeout (optional)
   * @param message - Custom error message (optional)
   */
  async assertVisible(locator: Locator, timeout?: number, message?: string): Promise<void> {
    await expect(locator, message || `Element should be visible`).toBeVisible({
      timeout: timeout || 30000
    });
  }

  /**
   * Assert that an element is hidden
   * @param locator - Element locator
   * @param timeout - Custom timeout (optional)
   * @param message - Custom error message (optional)
   */
  async assertHidden(locator: Locator, timeout?: number, message?: string): Promise<void> {
    await expect(locator, message || `Element should be hidden`).toBeHidden({
      timeout: timeout || 30000
    });
  }

  /**
   * Assert element text content
   * @param locator - Element locator
   * @param expectedText - Expected text (string or regex)
   * @param message - Custom error message (optional)
   */
  async assertText(locator: Locator, expectedText: string | RegExp, message?: string): Promise<void> {
    await expect(locator, message || `Text should match expected value`).toHaveText(expectedText);
  }

  /**
   * Assert element contains text
   * @param locator - Element locator
   * @param expectedText - Expected text to contain
   * @param message - Custom error message (optional)
   */
  async assertContainsText(locator: Locator, expectedText: string, message?: string): Promise<void> {
    await expect(locator, message || `Element should contain text: ${expectedText}`).toContainText(expectedText);
  }

  /**
   * Assert element attribute value
   * @param locator - Element locator
   * @param attribute - Attribute name
   * @param expectedValue - Expected attribute value
   * @param message - Custom error message (optional)
   */
  async assertAttribute(locator: Locator, attribute: string, expectedValue: string | RegExp, message?: string): Promise<void> {
    await expect(locator, message || `Attribute ${attribute} should have expected value`).toHaveAttribute(attribute, expectedValue);
  }

  /**
   * Assert element has specific class
   * @param locator - Element locator
   * @param className - Expected class name
   * @param message - Custom error message (optional)
   */
  async assertHasClass(locator: Locator, className: string, message?: string): Promise<void> {
    await expect(locator, message || `Element should have class: ${className}`).toHaveClass(new RegExp(className));
  }

  /**
   * Assert input field value
   * @param locator - Input element locator
   * @param expectedValue - Expected input value
   * @param message - Custom error message (optional)
   */
  async assertInputValue(locator: Locator, expectedValue: string, message?: string): Promise<void> {
    await expect(locator, message || `Input should have expected value`).toHaveValue(expectedValue);
  }

  /**
   * Assert element is enabled
   * @param locator - Element locator
   * @param message - Custom error message (optional)
   */
  async assertEnabled(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message || `Element should be enabled`).toBeEnabled();
  }

  /**
   * Assert element is disabled
   * @param locator - Element locator
   * @param message - Custom error message (optional)
   */
  async assertDisabled(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message || `Element should be disabled`).toBeDisabled();
  }

  /**
   * Assert element count
   * @param locator - Element locator
   * @param expectedCount - Expected number of elements
   * @param message - Custom error message (optional)
   */
  async assertCount(locator: Locator, expectedCount: number, message?: string): Promise<void> {
    await expect(locator, message || `Should have ${expectedCount} elements`).toHaveCount(expectedCount);
  }

  /**
   * Assert page title
   * @param expectedTitle - Expected page title (string or regex)
   * @param message - Custom error message (optional)
   */
  async assertPageTitle(expectedTitle: string | RegExp, message?: string): Promise<void> {
    await expect(this.page, message || `Page title should match expected value`).toHaveTitle(expectedTitle);
  }

  /**
   * Assert page URL
   * @param expectedUrl - Expected URL (string or regex)
   * @param message - Custom error message (optional)
   */
  async assertPageUrl(expectedUrl: string | RegExp, message?: string): Promise<void> {
    await expect(this.page, message || `Page URL should match expected value`).toHaveURL(expectedUrl);
  }

  /**
   * Assert checkbox is checked
   * @param locator - Checkbox locator
   * @param message - Custom error message (optional)
   */
  async assertChecked(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message || `Checkbox should be checked`).toBeChecked();
  }

  /**
   * Assert checkbox is unchecked
   * @param locator - Checkbox locator
   * @param message - Custom error message (optional)
   */
  async assertUnchecked(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message || `Checkbox should be unchecked`).not.toBeChecked();
  }

  /**
   * Assert element is focused
   * @param locator - Element locator
   * @param message - Custom error message (optional)
   */
  async assertFocused(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message || `Element should be focused`).toBeFocused();
  }

  /**
   * Soft assertion that doesn't stop test execution on failure
   * @param locator - Element locator
   * @param assertion - Assertion function
   * @param message - Custom error message (optional)
   */
  async softAssert(locator: Locator, assertion: (locator: Locator) => Promise<void>, message?: string): Promise<void> {
    try {
      await assertion(locator);
    } catch (error) {
      console.warn(`Soft assertion failed: ${message || 'Unknown assertion'}`, error);
      // Continue test execution instead of failing
    }
  }

  /**
   * Assert element screenshot matches baseline
   * @param locator - Element locator
   * @param screenshotName - Screenshot name for comparison
   * @param options - Screenshot options
   */
  async assertScreenshot(
    locator: Locator, 
    screenshotName: string, 
    options?: { 
      threshold?: number; 
      maxDiffPixels?: number; 
      animations?: 'disabled' | 'allow';
    }
  ): Promise<void> {
    await expect(locator).toHaveScreenshot(`${screenshotName}.png`, {
      threshold: options?.threshold || 0.2,
      maxDiffPixels: options?.maxDiffPixels || 100,
      animations: options?.animations || 'disabled'
    });
  }

  /**
   * Assert page screenshot matches baseline
   * @param screenshotName - Screenshot name for comparison
   * @param options - Screenshot options
   */
  async assertPageScreenshot(
    screenshotName: string, 
    options?: { 
      threshold?: number; 
      maxDiffPixels?: number; 
      fullPage?: boolean;
      animations?: 'disabled' | 'allow';
    }
  ): Promise<void> {
    await expect(this.page).toHaveScreenshot(`${screenshotName}.png`, {
      threshold: options?.threshold || 0.2,
      maxDiffPixels: options?.maxDiffPixels || 100,
      fullPage: options?.fullPage || true,
      animations: options?.animations || 'disabled'
    });
  }

  /**
   * Wait for and assert element appears
   * @param locator - Element locator
   * @param timeout - Wait timeout
   * @param message - Custom error message (optional)
   */
  async waitAndAssertVisible(locator: Locator, timeout: number = 30000, message?: string): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await this.assertVisible(locator, timeout, message);
  }

  /**
   * Wait for and assert element disappears
   * @param locator - Element locator
   * @param timeout - Wait timeout
   * @param message - Custom error message (optional)
   */
  async waitAndAssertHidden(locator: Locator, timeout: number = 30000, message?: string): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
    await this.assertHidden(locator, timeout, message);
  }
}

/**
 * Utility functions for common test operations
 */
export class TestUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for network to be idle
   * @param timeout - Wait timeout
   */
  async waitForNetworkIdle(timeout: number = 30000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Scroll to element smoothly
   * @param locator - Element to scroll to
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500); // Small delay for smooth scrolling
  }

  /**
   * Retry action with specified attempts
   * @param action - Action function to retry
   * @param maxAttempts - Maximum retry attempts
   * @param delay - Delay between retries in milliseconds
   */
  async retryAction<T>(
    action: () => Promise<T>, 
    maxAttempts: number = 3, 
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        console.log(`Attempt ${attempt} failed: ${error}`);
        
        if (attempt < maxAttempts) {
          await this.page.waitForTimeout(delay);
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Get random number within range
   * @param min - Minimum value
   * @param max - Maximum value
   */
  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Format date for display
   * @param date - Date to format
   * @param format - Date format (optional)
   */
  formatDate(date: Date = new Date(), format: string = 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }
}
