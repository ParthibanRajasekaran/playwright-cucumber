import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly url: string;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly successMessage: Locator;
  private readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    // For the-internet.herokuapp.com login page
    this.url = '/login';
    
    // Updated selectors for the-internet.herokuapp.com login page
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"].radius');
    this.errorMessage = page.locator('#flash, .flash.error, .flash');
    this.successMessage = page.locator('#flash, .flash.success, .flash');
    this.pageTitle = page.locator('h1, h2, .example');
  }

  async navigateToLoginPage(): Promise<void> {
    await this.goto(this.url);
    await this.waitForPageLoad();
  }

  override async waitForPageLoad(): Promise<void> {
    await this.waitForElement(this.usernameInput);
    await this.waitForElement(this.passwordInput);
    await this.waitForElement(this.loginButton);
  }

  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  async enterUsername(username: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.fillInput(this.passwordInput, password);
  }

  async clickLoginButton(): Promise<void> {
    await this.clickElement(this.loginButton);
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage);
    return await this.getText(this.errorMessage);
  }

  async getSuccessMessage(): Promise<string> {
    await this.waitForElement(this.successMessage);
    return await this.getText(this.successMessage);
  }

  async isErrorMessageDisplayed(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }

  async isSuccessMessageDisplayed(): Promise<boolean> {
    return await this.isVisible(this.successMessage);
  }

  async clearUsername(): Promise<void> {
    await this.usernameInput.clear();
  }

  async clearPassword(): Promise<void> {
    await this.passwordInput.clear();
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

  async clickForgotPasswordLink(): Promise<void> {
    // the-internet.herokuapp.com doesn't have forgot password functionality
    // This is a no-op for this test site
    console.log('⚠️ Forgot password functionality not available on this test site');
  }

  async clickSignUpLink(): Promise<void> {
    // the-internet.herokuapp.com doesn't have sign up functionality
    // This is a no-op for this test site
    console.log('⚠️ Sign up functionality not available on this test site');
  }

  async checkRememberMe(): Promise<void> {
    // the-internet.herokuapp.com doesn't have a remember me checkbox
    // This is a no-op for this test site
    console.log('⚠️ Remember me functionality not available on this test site');
  }

  async getPageTitleText(): Promise<string> {
    return await this.getText(this.pageTitle);
  }

  async isLoginFormVisible(): Promise<boolean> {
    const usernameVisible = await this.isVisible(this.usernameInput);
    const passwordVisible = await this.isVisible(this.passwordInput);
    const buttonVisible = await this.isVisible(this.loginButton);
    return usernameVisible && passwordVisible && buttonVisible;
  }

  async waitForLoginRedirect(): Promise<void> {
    await this.page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
  }
}