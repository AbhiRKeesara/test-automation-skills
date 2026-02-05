// Good Practice Example: Authentication Flow
// This demonstrates best practices for a login test

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/auth/login-page';

test.describe('User Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('user can login with valid credentials', async ({ page }) => {
    // Arrange - Setup test data
    const email = 'user@test.com';
    const password = 'Test123!';

    // Act - Perform login
    await loginPage.login(email, password);

    // Assert - Verify successful login
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText(`Welcome, ${email}`)).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    // Arrange
    const email = 'invalid@test.com';
    const password = 'wrongpassword';

    // Act
    await loginPage.login(email, password);

    // Assert - Verify error message
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('Invalid credentials');
    
    // Verify still on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('validates email format', async ({ page }) => {
    // Arrange
    const invalidEmail = 'notanemail';
    const password = 'Test123!';

    // Act
    await loginPage.fillEmail(invalidEmail);
    await loginPage.fillPassword(password);
    await loginPage.clickSubmit();

    // Assert - Verify validation error
    const emailInput = page.getByLabel('Email');
    const errorMessage = await emailInput.getAttribute('aria-describedby');
    expect(errorMessage).toBeTruthy();
    
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('can navigate using keyboard', async ({ page }) => {
    // Tab to email field
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email')).toBeFocused();

    // Tab to password field
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();

    // Tab to submit button
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeFocused();

    // Submit with Enter
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('Test123!');
    await page.getByLabel('Password').press('Enter');

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
