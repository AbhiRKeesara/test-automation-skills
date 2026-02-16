import { test, expect } from '@playwright/test';

/**
 * Example: Advanced Wait Patterns
 *
 * Demonstrates proper wait strategies for different scenarios:
 * - Network-based waits (API requests/responses)
 * - Custom condition waits
 * - Load state waits
 * - Combining actions with waits
 *
 * Source: Adapted from Playwright best practices
 */

test.describe('Network-Based Wait Patterns', () => {
  test('wait for API request', async ({ page }) => {
    await page.goto('https://example.com/dashboard');

    // Set up request listener before triggering action
    const requestPromise = page.waitForRequest('**/api/analytics');

    await page.getByRole('button', { name: 'Load Data' }).click();

    // Wait for the API request to be made
    await requestPromise;

    // Now safe to proceed
    await expect(page.getByText('Data loaded')).toBeVisible();
  });

  test('wait for API response with validation', async ({ page }) => {
    await page.goto('https://example.com/orders');

    // Wait for specific response with conditions
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('api/orders') && response.status() === 200
    );

    await page.getByRole('button', { name: 'Refresh' }).click();

    const response = await responsePromise;

    // Validate response data
    const data = await response.json();
    expect(data.orders).toBeDefined();
  });

  test('wait for multiple API responses', async ({ page }) => {
    await page.goto('https://example.com/complex-dashboard');

    // Wait for multiple APIs to complete
    const responsesPromise = Promise.all([
      page.waitForResponse('**/api/user-profile'),
      page.waitForResponse('**/api/notifications'),
      page.waitForResponse('**/api/recent-activity'),
    ]);

    await page.getByRole('button', { name: 'Load Dashboard' }).click();

    const responses = await responsesPromise;

    // All responses received
    expect(responses).toHaveLength(3);
    responses.forEach((response) => {
      expect(response.ok()).toBeTruthy();
    });
  });
});

test.describe('Custom Condition Wait Patterns', () => {
  test('wait for specific element count', async ({ page }) => {
    await page.goto('https://example.com/products');

    await page.getByRole('button', { name: 'Load More' }).click();

    // Wait until at least 10 products are visible
    await page.waitForFunction(
      () => document.querySelectorAll('.product-card').length >= 10
    );

    const productCards = page.locator('.product-card');
    expect(await productCards.count()).toBeGreaterThanOrEqual(10);
  });

  test('wait for dynamic content to appear', async ({ page }) => {
    await page.goto('https://example.com/search');

    await page.getByLabel('Search').fill('laptop');

    // Wait for autocomplete suggestions to appear
    await page.waitForFunction(
      () => document.querySelector('.autocomplete-results') !== null
    );

    const suggestions = page.locator('.autocomplete-results li');
    expect(await suggestions.count()).toBeGreaterThan(0);
  });

  test('wait for attribute change', async ({ page }) => {
    await page.goto('https://example.com/dashboard');

    await page.getByRole('button', { name: 'Refresh' }).click();

    // Wait for loading attribute to be removed
    await page.waitForFunction(
      () => document.querySelector('[data-loading]') === null,
      { timeout: 15000 }
    );

    expect(await page.locator('[data-loading]').count()).toBe(0);
  });
});

test.describe('Load State Wait Patterns', () => {
  test('wait for network idle', async ({ page }) => {
    await page.goto('https://example.com/heavy-page', {
      waitUntil: 'networkidle',
    });

    // Page and all network requests are complete
    await expect(page.getByText('Page Loaded')).toBeVisible();
  });

  test('explicit network idle after action', async ({ page }) => {
    await page.goto('https://example.com/dashboard');

    await page.getByRole('button', { name: 'Load Widgets' }).click();

    // Wait for all network requests to complete
    await page.waitForLoadState('networkidle');

    // Now safe to take measurements or verify content
    const widgets = page.locator('.widget');
    expect(await widgets.count()).toBeGreaterThan(0);
  });

  test('wait for DOM content loaded', async ({ page }) => {
    await page.goto('https://example.com/fast-page');

    await page.waitForLoadState('domcontentloaded');

    // DOM is parsed, but images/stylesheets might still be loading
    const heading = page.getByRole('heading', { name: 'Welcome' });
    await expect(heading).toBeVisible();
  });
});

test.describe('Combined Action and Wait Patterns', () => {
  test('click button and wait for API call', async ({ page }) => {
    await page.goto('https://example.com/submit-form');

    await page.getByLabel('Name').fill('John Doe');

    // Set up response listener before clicking
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('api/submit') && response.status() === 200
    );

    await page.getByRole('button', { name: 'Submit' }).click();

    const response = await responsePromise;
    const data = await response.json();

    expect(data.success).toBe(true);
  });

  test('fill form and wait for validation API', async ({ page }) => {
    await page.goto('https://example.com/registration');

    // Set up listener before typing
    const validationPromise = page.waitForResponse('**/api/validate-email');

    await page.getByLabel('Email').fill('user@example.com');

    const response = await validationPromise;
    expect(response.status()).toBe(200);

    await expect(page.getByText('Email is available')).toBeVisible();
  });
});

test.describe('Real-World Wait Scenarios', () => {
  test('e-commerce checkout flow with multiple wait points', async ({ page }) => {
    await page.goto('https://example.com/checkout');

    // Step 1: Fill shipping info and wait for validation
    await page.getByLabel('Address').fill('123 Main St');
    await page.getByLabel('Zip Code').fill('12345');

    const validationPromise = page.waitForResponse(
      (response) =>
        response.url().includes('api/validate-address') &&
        response.status() === 200
    );

    await page.getByRole('button', { name: 'Continue' }).click();
    await validationPromise;

    // Step 2: Fill payment and wait for payment processor
    await page.getByLabel('Card Number').fill('4242424242424242');

    const paymentPromise = page.waitForResponse(/payment-gateway/);
    await page.getByRole('button', { name: 'Place Order' }).click();
    await paymentPromise;

    // Step 3: Wait for confirmation page to load
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Order Confirmed')).toBeVisible();
  });

  test('dynamic dashboard loading', async ({ page }) => {
    await page.goto('https://example.com/dashboard');

    // Wait for initial page load
    await page.waitForLoadState('load');

    // Wait for all widget APIs to complete
    await Promise.all([
      page.waitForResponse('**/api/sales-data'),
      page.waitForResponse('**/api/customer-data'),
      page.waitForResponse('**/api/inventory-data'),
    ]);

    // Wait for network to be idle
    await page.waitForLoadState('networkidle');

    // Wait for specific chart to render
    await page.waitForFunction(
      () => document.querySelector('canvas.sales-chart') !== null
    );

    // Dashboard is fully loaded
    const charts = page.locator('canvas.chart');
    expect(await charts.count()).toBe(3);
  });
});

/**
 * Best Practices Demonstrated:
 *
 * ✅ Set up listeners before triggering actions
 * ✅ Use specific waits over generic timeouts
 * ✅ Validate responses when waiting for API calls
 * ✅ Combine multiple wait strategies for complex scenarios
 * ✅ Use waitForFunction for custom conditions
 * ✅ Prefer networkidle for heavy pages with many requests
 *
 * Common Pitfalls Avoided:
 *
 * ❌ Using page.waitForTimeout() for arbitrary delays
 * ❌ Setting up listeners after triggering actions (race condition)
 * ❌ Not validating API responses after waiting
 * ❌ Using overly broad wait conditions
 * ❌ Waiting for conditions that never happen
 *
 * Wait Strategy Selection Guide:
 *
 * 1. Element appears/disappears → locator.waitFor()
 * 2. API request made → page.waitForRequest()
 * 3. API response received → page.waitForResponse()
 * 4. Page navigation → page.waitForNavigation() or waitForURL()
 * 5. Network settles → page.waitForLoadState('networkidle')
 * 6. DOM ready → page.waitForLoadState('domcontentloaded')
 * 7. Custom condition → page.waitForFunction()
 * 8. Avoid → page.waitForTimeout() (use only as last resort)
 */
