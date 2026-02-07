// Example: Bad Error Handling - Anti-patterns to Avoid
import { test, expect } from '@playwright/test';

test('bad: empty catch block hides failures', async ({ page }) => {
  // ANTI-PATTERN: Wrapping assertions in try-catch
  // This test will ALWAYS pass, even if the page is broken!
  try {
    await page.goto('https://example.com/products');
    await expect(page.getByText('Products')).toBeVisible();
  } catch {
    // ANTI-PATTERN: Silently swallowing errors
    // The test "passes" but nothing was actually verified
    console.log('Something failed, but who cares?');
  }
});

test('bad: massive timeout hides real problems', async ({ page }) => {
  // ANTI-PATTERN: 5-minute timeout masks slow/broken features
  test.setTimeout(300000);

  await page.goto('https://example.com/dashboard');

  // ANTI-PATTERN: Huge assertion timeout instead of fixing the root cause
  await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 120000 });

  // If your test needs 2 minutes to find an element,
  // the app has a performance bug - fix the app, not the timeout!
});

test('bad: using waitForTimeout as error handling', async ({ page }) => {
  await page.goto('https://example.com/products');

  // ANTI-PATTERN: Hard-coded wait instead of proper error detection
  await page.waitForTimeout(5000);

  // ANTI-PATTERN: Checking for error AFTER an arbitrary wait
  const errorVisible = await page.locator('.error-message').isVisible();
  if (errorVisible) {
    console.log('There was an error, retrying...');
    // ANTI-PATTERN: Manual reload as retry logic
    await page.reload();
    await page.waitForTimeout(5000); // More waiting!
  }

  // ANTI-PATTERN: Weak assertion after all that waiting
  const items = await page.$$('.product-item');
  expect(items.length).toBeGreaterThan(0);
});

test('bad: useless try-catch that adds nothing', async ({ page }) => {
  // ANTI-PATTERN: Catching and re-throwing without context
  try {
    await page.goto('https://example.com/checkout');
    await page.locator('#email').fill('test@example.com');
    await page.locator('button.submit').click();
  } catch (error) {
    // ANTI-PATTERN: Just re-throwing the same error
    // This try-catch block adds zero value
    throw error;
  }
});

test('bad: no error messages in assertions', async ({ page }) => {
  await page.goto('https://example.com/cart');

  // ANTI-PATTERN: No context in assertions
  // When this fails, you just get: "Expected '$79.99' to be '$71.99'"
  // But WHY should it be $71.99? Was a coupon applied? A sale active?
  await expect(page.locator('.total')).toHaveText('$71.99');

  // ANTI-PATTERN: Checking multiple things without identifying which failed
  const isVisible = await page.locator('.cart-item').isVisible();
  const hasText = (await page.locator('.cart-item').textContent())?.includes('Laptop');
  expect(isVisible && hasText).toBeTruthy(); // Which condition failed?
});

test('bad: retrying everything instead of fixing the issue', async ({ page }) => {
  // ANTI-PATTERN: Retry loop wrapping the entire test
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await page.goto('https://example.com/search');
      await page.locator('#search').fill('laptop');
      await page.locator('#search-btn').click();
      await page.waitForTimeout(3000);

      const results = await page.$$('.result-item');
      if (results.length > 0) {
        break; // "Success"
      }
    } catch {
      console.log(`Attempt ${attempt + 1} failed, retrying...`);
      if (attempt === 4) {
        throw new Error('Test failed after 5 attempts');
      }
    }
  }
  // ANTI-PATTERN: This hides flaky selectors, timing issues,
  // and real application bugs. Use Playwright's built-in retries instead!
});

test('bad: testing error handling without simulating errors', async ({ page }) => {
  await page.goto('https://example.com/products');

  // ANTI-PATTERN: Just checking if error element doesn't exist
  // This doesn't test that errors are HANDLED properly
  const errorExists = await page.locator('.error').isVisible();
  expect(errorExists).toBeFalsy();

  // INSTEAD: Use route interception to simulate actual failures
  // and verify the app responds correctly
});

test('bad: cleanup that can break the test', async ({ page }) => {
  await page.goto('https://example.com/products');

  // Do some test actions...
  await page.getByRole('button', { name: 'Add to Cart' }).click();

  // ANTI-PATTERN: Cleanup without error handling
  // If this fails, the test fails even though the actual test passed!
  await page.request.delete('/api/cart/clear');
  // Use try-catch in afterEach instead, and don't let cleanup fail the test
});

/**
 * Problems with these error handling patterns:
 *
 * - Empty catch blocks hide real failures
 * - Massive timeouts mask performance issues
 * - Hard-coded waits are unreliable
 * - Useless try-catch adds complexity without value
 * - Missing assertion messages make debugging harder
 * - Manual retry loops duplicate Playwright's built-in retry feature
 * - Not testing actual error scenarios (just checking errors don't exist)
 * - Cleanup without error handling can cause false test failures
 *
 * All of these make tests:
 * - Unreliable (false positives - tests pass when app is broken)
 * - Hard to debug (no context on what went wrong)
 * - Slow (unnecessary waits and retries)
 * - Noisy (lots of code that doesn't add value)
 */
