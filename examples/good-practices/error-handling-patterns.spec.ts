// Example: Good Error Handling Patterns in Playwright Tests
import { test, expect } from '@playwright/test';
import { ProductPage } from '../page-objects/products/ProductPage';
import { CartPage } from '../page-objects/checkout/CartPage';

test.describe('Error Handling - Network Failures', () => {
  test('should display friendly error when products API fails', async ({ page }) => {
    // Arrange - Simulate API failure
    await page.route('**/api/products', (route) => {
      route.abort('connectionrefused');
    });

    // Act
    await page.goto('/products');

    // Assert - User sees a helpful error, not a blank page
    await expect(page.getByRole('alert')).toHaveText('Unable to load products. Please try again.');
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('should handle 500 server error gracefully', async ({ page }) => {
    // Arrange - Simulate server error
    await page.route('**/api/orders', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    // Act
    await page.goto('/orders');

    // Assert - App shows error state, not crash
    await expect(page.getByText('Something went wrong')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();

    // Navigation should still work
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should recover when API returns after initial failure', async ({ page }) => {
    let requestCount = 0;

    // Arrange - First request fails, second succeeds
    await page.route('**/api/products', (route) => {
      requestCount++;
      if (requestCount === 1) {
        route.abort('connectionreset');
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ id: '1', name: 'Laptop', price: 999.99 }]),
        });
      }
    });

    // Act - Load page (will fail)
    await page.goto('/products');
    await expect(page.getByRole('alert')).toBeVisible();

    // Act - Click retry
    await page.getByRole('button', { name: 'Retry' }).click();

    // Assert - Products load successfully on retry
    await expect(page.getByText('Laptop')).toBeVisible();
  });
});

test.describe('Error Handling - Form Validation', () => {
  test('should show validation errors for empty required fields', async ({ page }) => {
    await page.goto('/checkout');

    // Act - Submit without filling required fields
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Assert - Individual field errors are shown
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Shipping address is required')).toBeVisible();

    // Assert - Form was NOT submitted (still on checkout page)
    await expect(page).toHaveURL(/.*checkout/);
  });

  test('should show inline error for invalid email format', async ({ page }) => {
    await page.goto('/checkout');

    // Act - Enter invalid email
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Email').blur(); // Trigger validation

    // Assert - Inline error appears
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();

    // Act - Fix the email
    await page.getByLabel('Email').clear();
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Email').blur();

    // Assert - Error disappears
    await expect(page.getByText('Please enter a valid email address')).not.toBeVisible();
  });
});

test.describe('Error Handling - Proper Setup & Cleanup', () => {
  let productId: string;

  test.beforeEach(async ({ page }) => {
    // Setup with error handling - provides clear failure message
    try {
      const response = await page.request.post('/api/products', {
        data: { name: 'Test Product', price: 29.99 },
      });
      const product = await response.json();
      productId = product.id;
    } catch (error) {
      throw new Error(`Test setup failed: Could not create test product. ${error}`);
    }
  });

  test.afterEach(async ({ page }) => {
    // Cleanup with error handling - never fails the test
    try {
      if (productId) {
        await page.request.delete(`/api/products/${productId}`);
      }
    } catch (error) {
      console.warn(`Cleanup warning: Could not delete product ${productId}:`, error);
      // Intentionally not re-throwing - cleanup failures are non-fatal
    }
  });

  test('should display product details correctly', async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.navigate(productId);

    // Use custom error messages for context
    await expect(
      productPage.productName,
      'Product name should be visible on the product detail page'
    ).toHaveText('Test Product');

    await expect(
      productPage.productPrice,
      'Product price should show the correct amount'
    ).toHaveText('$29.99');
  });
});

test.describe('Error Handling - Timeout & Loading States', () => {
  test('should show loading spinner during slow requests', async ({ page }) => {
    // Arrange - Simulate slow API response
    await page.route('**/api/search', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: '1', name: 'Result' }]),
      });
    });

    // Act
    await page.goto('/search?q=laptop');

    // Assert - Loading indicator appears during the wait
    await expect(page.getByRole('progressbar')).toBeVisible();

    // Assert - Results eventually load
    await expect(page.getByText('Result')).toBeVisible({ timeout: 10000 });

    // Assert - Loading indicator disappears
    await expect(page.getByRole('progressbar')).not.toBeVisible();
  });
});

/**
 * Why these are good error handling examples:
 *
 * - Uses route interception to simulate failures (no real network issues needed)
 * - Tests user-visible behavior, not implementation details
 * - Verifies the app degrades gracefully (shows errors, doesn't crash)
 * - Tests recovery paths (retry buttons, error correction)
 * - Setup/cleanup have proper try-catch with meaningful messages
 * - Assertions use custom error messages for debugging context
 * - No hard-coded waits
 * - No empty catch blocks
 * - Tests are isolated and don't depend on each other
 */
