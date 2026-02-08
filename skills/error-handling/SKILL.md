---
name: error-handling
description: >
  Error handling patterns for Playwright tests including network failures, timeouts, and retries. Use when testing app error states, implementing retry logic, handling flaky elements, configuring timeouts, or adding graceful degradation tests.
---

# Error Handling Skill

Patterns and strategies for handling errors gracefully in Playwright tests — network failures, timeouts, flaky elements, and retry logic.

## Core Principles

1. **Expect failures** - Tests should handle expected error scenarios gracefully
2. **Fail fast with clarity** - Provide meaningful error messages when tests fail
3. **Retry intelligently** - Use retries for genuine flakiness, not to mask real bugs
4. **Isolate failure points** - One assertion per concern, clear error boundaries
5. **Log contextually** - Capture useful diagnostics on failure

## Table of Contents

- [Network Error Handling](#network-error-handling)
- [Timeout Strategies](#timeout-strategies)
- [Retry Patterns](#retry-patterns)
- [Graceful Degradation](#graceful-degradation)
- [Custom Error Messages](#custom-error-messages)
- [Try-Catch Patterns](#try-catch-patterns)
- [Error Boundary Testing](#error-boundary-testing)
- [Handling Flaky Elements](#handling-flaky-elements)
- [Screenshot on Failure](#screenshot-on-failure)
- [Common Anti-Patterns](#common-anti-patterns)

---

## Network Error Handling

### Testing Offline / Network Failure Scenarios

```typescript
import { test, expect } from '@playwright/test';

test.describe('Network Error Handling', () => {
  test('should display error message when API is unreachable', async ({ page }) => {
    // Simulate network failure for API calls
    await page.route('**/api/products', (route) => {
      route.abort('connectionrefused');
    });

    await page.goto('/products');

    // Verify the UI shows a user-friendly error
    await expect(page.getByRole('alert')).toHaveText('Unable to load products. Please try again.');
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // Simulate 500 Internal Server Error
    await page.route('**/api/orders', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/orders');

    await expect(page.getByText('Something went wrong')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('should handle 404 responses', async ({ page }) => {
    await page.route('**/api/products/999', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Product not found' }),
      });
    });

    await page.goto('/products/999');

    await expect(page.getByText('Product not found')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to Products' })).toBeVisible();
  });

  test('should handle timeout on slow API responses', async ({ page }) => {
    // Simulate slow response
    await page.route('**/api/search', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 30000));
      route.fulfill({ status: 200, body: '[]' });
    });

    await page.goto('/search?q=laptop');

    // App should show a loading timeout message
    await expect(page.getByText('Request timed out')).toBeVisible({ timeout: 15000 });
  });
});
```

### Intercepting and Validating Error Responses

```typescript
test('should log failed API requests for debugging', async ({ page }) => {
  const failedRequests: string[] = [];

  // Monitor failed network requests
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });

  // Simulate intermittent failures
  let requestCount = 0;
  await page.route('**/api/data', (route) => {
    requestCount++;
    if (requestCount === 1) {
      route.abort('connectionreset');
    } else {
      route.fulfill({ status: 200, body: JSON.stringify({ data: 'success' }) });
    }
  });

  await page.goto('/dashboard');

  // Verify app recovered from the first failure
  await expect(page.getByText('Dashboard loaded')).toBeVisible();

  // Verify our monitoring captured the failure
  expect(failedRequests.length).toBe(1);
  expect(failedRequests[0]).toContain('connectionreset');
});
```

---

## Timeout Strategies

### Configuring Timeouts Properly

```typescript
// ✅ Good - Set appropriate timeouts at different levels
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Global timeout for each test (default: 30s)
  timeout: 60000,

  // Global expect timeout (default: 5s)
  expect: {
    timeout: 10000,
  },

  use: {
    // Navigation timeout
    navigationTimeout: 30000,

    // Action timeout (click, fill, etc.)
    actionTimeout: 15000,
  },
});
```

### Per-Test Timeout Overrides

```typescript
// ✅ Good - Override timeout for slow tests
test('should complete large file upload', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes for this specific test

  await page.goto('/upload');
  await page.getByLabel('File').setInputFiles('large-file.zip');
  await page.getByRole('button', { name: 'Upload' }).click();

  await expect(page.getByText('Upload complete')).toBeVisible({ timeout: 90000 });
});

// ❌ Bad - Setting huge global timeout to avoid fixing real issues
// timeout: 300000 in config - masks slow tests and real problems
```

### Assertion-Level Timeouts

```typescript
test('should load dashboard widgets', async ({ page }) => {
  await page.goto('/dashboard');

  // ✅ Good - Different timeouts for different expectations
  // Fast elements should appear quickly
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 5000 });

  // Async-loaded data may take longer
  await expect(page.getByTestId('analytics-widget')).toBeVisible({ timeout: 15000 });

  // Charts that render after data loads
  await expect(page.getByTestId('revenue-chart')).toBeVisible({ timeout: 20000 });
});
```

---

## Retry Patterns

### Playwright Built-in Retries

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // ✅ Good - Use retries for CI, but not locally
  retries: process.env.CI ? 2 : 0,

  // ✅ Good - Categorize test results
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
});
```

### Custom Retry Logic for Specific Operations

```typescript
// utils/retry-helpers.ts

/**
 * Retry an async operation with exponential backoff.
 * Use for genuinely flaky operations (network calls, external services).
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, onRetry } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) break;

      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      onRetry?.(attempt, lastError);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

### Using Retry Helper in Tests

```typescript
import { test, expect } from '@playwright/test';
import { retryOperation } from '../utils/retry-helpers';

test('should create order via API with retry', async ({ page }) => {
  // Retry API call that may fail due to external service
  const order = await retryOperation(
    async () => {
      const response = await page.request.post('/api/orders', {
        data: { productId: '123', quantity: 1 },
      });
      expect(response.ok()).toBeTruthy();
      return response.json();
    },
    {
      maxRetries: 3,
      baseDelay: 2000,
      onRetry: (attempt, error) => {
        console.log(`Order creation attempt ${attempt} failed: ${error.message}`);
      },
    }
  );

  expect(order.id).toBeDefined();
});
```

### Retry vs Fix - Decision Guide

```typescript
// ✅ Appropriate for retry:
// - External API calls that have transient failures
// - Database operations during high load
// - File system operations on CI

// ❌ Should NOT be retried (fix the root cause instead):
// - Element not found (fix the selector)
// - Assertion failure (fix the logic)
// - Navigation timeout (investigate the app)
// - Test depends on another test (fix isolation)
```

---

## Graceful Degradation

### Testing App Behavior When Features Fail

```typescript
test.describe('Graceful Degradation', () => {
  test('should show cached data when API fails', async ({ page }) => {
    // First, load the page normally to populate cache
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // Now simulate API failure
    await page.route('**/api/products', (route) => route.abort('connectionrefused'));

    // Reload the page
    await page.reload();

    // App should show cached data with a warning
    await expect(page.getByText('Showing cached data')).toBeVisible();
    await expect(page.getByRole('list')).not.toBeEmpty();
  });

  test('should disable dependent features when service is down', async ({ page }) => {
    // Block the recommendation service
    await page.route('**/api/recommendations', (route) => {
      route.fulfill({ status: 503 });
    });

    await page.goto('/products/123');

    // Product page should still work
    await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible();

    // But recommendations section shows fallback
    await expect(page.getByText('Recommendations unavailable')).toBeVisible();
  });

  test('should handle partial API response', async ({ page }) => {
    await page.route('**/api/user/profile', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          // avatar and preferences are missing
        }),
      });
    });

    await page.goto('/profile');

    // Available fields should display
    await expect(page.getByText('John Doe')).toBeVisible();

    // Missing fields should show defaults, not crash
    await expect(page.getByTestId('avatar')).toHaveAttribute('src', /default-avatar/);
  });
});
```

---

## Custom Error Messages

### Providing Context in Assertions

```typescript
test('should display correct product pricing', async ({ page }) => {
  await page.goto('/products/wireless-headphones');

  const price = page.getByTestId('product-price');

  // ✅ Good - Custom error message provides context
  await expect(price, 'Product price should show discounted amount after coupon').toHaveText(
    '$71.99'
  );

  // ✅ Good - Describe what you expected
  await expect(
    page.getByRole('alert'),
    'Discount success notification should appear after applying coupon'
  ).toBeVisible();
});

// ❌ Bad - No custom message, Playwright's default error is vague
test('bad example', async ({ page }) => {
  await page.goto('/products/wireless-headphones');
  await expect(page.getByTestId('product-price')).toHaveText('$71.99');
  // Error: "Expected '$79.99' to be '$71.99'" - but WHY?
});
```

### Custom Error Helper

```typescript
// utils/error-helpers.ts

/**
 * Create descriptive assertion messages for common scenarios.
 */
export function assertionMessage(context: {
  component: string;
  expected: string;
  scenario?: string;
}): string {
  const base = `${context.component} should ${context.expected}`;
  return context.scenario ? `${base} when ${context.scenario}` : base;
}

// Usage in tests:
await expect(
  cartPage.cartTotal,
  assertionMessage({
    component: 'Cart total',
    expected: 'reflect discounted price',
    scenario: 'SAVE10 coupon is applied',
  })
).toHaveText('$71.99');
```

---

## Try-Catch Patterns

### When to Use Try-Catch in Tests

```typescript
// ✅ Good - Try-catch for setup/cleanup, NOT for assertions
test.describe('Order Management', () => {
  let orderId: string;

  test.beforeEach(async ({ page }) => {
    try {
      const response = await page.request.post('/api/orders', {
        data: { productId: '123', quantity: 1 },
      });
      const order = await response.json();
      orderId = order.id;
    } catch (error) {
      console.error('Failed to create test order:', error);
      throw new Error(`Test setup failed: Could not create order. ${error}`);
    }
  });

  test.afterEach(async ({ page }) => {
    // ✅ Good - Cleanup should not fail the test
    try {
      if (orderId) {
        await page.request.delete(`/api/orders/${orderId}`);
      }
    } catch (error) {
      console.warn(`Cleanup warning: Could not delete order ${orderId}:`, error);
      // Don't re-throw - cleanup failures shouldn't fail the test
    }
  });

  test('should display order details', async ({ page }) => {
    await page.goto(`/orders/${orderId}`);

    // ✅ Good - Direct assertions, no try-catch wrapping
    await expect(page.getByRole('heading', { name: 'Order Details' })).toBeVisible();
    await expect(page.getByTestId('order-id')).toHaveText(orderId);
  });
});

// ❌ Bad - Wrapping assertions in try-catch swallows failures
test('bad example', async ({ page }) => {
  try {
    await page.goto('/products');
    await expect(page.getByText('Products')).toBeVisible();
  } catch {
    console.log('Test failed but continuing...'); // NEVER do this
  }
});
```

---

## Error Boundary Testing

### Testing React/Vue/Angular Error Boundaries

```typescript
test.describe('Error Boundary Testing', () => {
  test('should show error boundary when component crashes', async ({ page }) => {
    // Inject an error into a component via the app's error simulation
    await page.goto('/products?simulateError=true');

    // Verify the error boundary renders a fallback UI
    await expect(page.getByText('Something went wrong')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();

    // Verify the rest of the page still works
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should recover after error boundary retry', async ({ page }) => {
    await page.goto('/products?simulateError=once');

    // Error boundary shows
    await expect(page.getByText('Something went wrong')).toBeVisible();

    // Click retry
    await page.getByRole('button', { name: 'Try Again' }).click();

    // Component recovers
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });
});
```

---

## Handling Flaky Elements

### Waiting for Stable State

```typescript
test('should handle element that appears after animation', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).click();

  // ✅ Good - Wait for the notification to be stable
  const notification = page.getByRole('alert');
  await expect(notification).toBeVisible();
  await expect(notification).toHaveText('Item added to cart');

  // ✅ Good - Wait for animation to complete before next action
  await notification.waitFor({ state: 'hidden' });
});

// ❌ Bad - Don't use arbitrary delays for animations
test('bad: hard-coded wait for animation', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await page.waitForTimeout(2000); // Don't do this!
  // ... assertions
});
```

### Handling Modals and Overlays

```typescript
test('should handle loading overlay before interacting', async ({ page }) => {
  await page.goto('/dashboard');

  // ✅ Good - Wait for loading overlay to disappear
  await page.getByTestId('loading-overlay').waitFor({ state: 'hidden' });

  // Now safely interact with elements
  await page.getByRole('button', { name: 'Export Data' }).click();
});
```

---

## Screenshot on Failure

### Automatic Screenshot Capture

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // ✅ Capture screenshot on failure
    screenshot: 'only-on-failure',

    // ✅ Capture trace for debugging
    trace: 'on-first-retry',

    // ✅ Record video on failure
    video: 'on-first-retry',
  },
});
```

### Custom Screenshot Helper

```typescript
// utils/screenshot-helpers.ts
import { Page } from '@playwright/test';

export async function captureDebugInfo(page: Page, testName: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const prefix = `debug-${testName}-${timestamp}`;

  // Capture full page screenshot
  await page.screenshot({
    path: `test-results/screenshots/${prefix}.png`,
    fullPage: true,
  });

  // Capture console logs
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));

  // Capture network errors
  const networkErrors: string[] = [];
  page.on('requestfailed', (req) => {
    networkErrors.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
  });
}
```

---

## Common Anti-Patterns

### What NOT to Do

```typescript
// ❌ ANTI-PATTERN 1: Empty catch blocks
test('bad: swallowed error', async ({ page }) => {
  try {
    await page.goto('/products');
    await expect(page.getByText('Products')).toBeVisible();
  } catch {
    // Silently ignoring failures - test always "passes"
  }
});

// ❌ ANTI-PATTERN 2: Using retries to mask real bugs
// Don't set retries: 5 just because your test is flaky
// Fix the root cause instead!

// ❌ ANTI-PATTERN 3: Overly broad timeouts
test('bad: massive timeout', async ({ page }) => {
  test.setTimeout(300000); // 5 minutes is way too long
  // If a test needs this, something is wrong
});

// ❌ ANTI-PATTERN 4: Catching and re-throwing without context
test('bad: useless try-catch', async ({ page }) => {
  try {
    await page.goto('/checkout');
  } catch (error) {
    throw error; // This adds nothing - just let it throw naturally
  }
});

// ❌ ANTI-PATTERN 5: Testing error handling with page.waitForTimeout
test('bad: timeout as error simulation', async ({ page }) => {
  await page.goto('/products');
  await page.waitForTimeout(60000); // Waiting for "timeout error"
  // Use route interception instead!
});
```

### What TO Do Instead

```typescript
// ✅ GOOD PATTERN 1: Let assertions fail naturally with context
test('good: clear assertion', async ({ page }) => {
  await page.goto('/products');
  await expect(
    page.getByText('Products'),
    'Products heading should be visible after page load'
  ).toBeVisible();
});

// ✅ GOOD PATTERN 2: Fix flaky tests, use retries only in CI
// retries: process.env.CI ? 2 : 0

// ✅ GOOD PATTERN 3: Appropriate timeouts per operation
test('good: scoped timeouts', async ({ page }) => {
  test.setTimeout(60000); // Reasonable for this complex flow
  await expect(page.getByTestId('chart')).toBeVisible({ timeout: 15000 });
});

// ✅ GOOD PATTERN 4: Add context when re-throwing
test('good: contextual error', async ({ page }) => {
  const response = await page.request.get('/api/products');
  if (!response.ok()) {
    throw new Error(
      `Failed to fetch products: ${response.status()} ${response.statusText()}`
    );
  }
});

// ✅ GOOD PATTERN 5: Use route interception for error testing
test('good: simulated error', async ({ page }) => {
  await page.route('**/api/products', (route) => route.abort('connectionrefused'));
  await page.goto('/products');
  await expect(page.getByRole('alert')).toHaveText('Unable to load products');
});
```

---

## Error Handling Checklist

- [ ] Network failures show user-friendly messages
- [ ] API errors (4xx, 5xx) are handled gracefully
- [ ] Timeouts are configured at appropriate levels
- [ ] Retries used only for genuinely transient failures
- [ ] Custom error messages provide context in assertions
- [ ] Try-catch used for setup/cleanup, not around assertions
- [ ] Error boundaries are tested for component crashes
- [ ] Screenshots and traces captured on failure
- [ ] No empty catch blocks swallowing errors
- [ ] No hard-coded waits masking timing issues
- [ ] Cleanup code handles its own errors gracefully
- [ ] Flaky elements use proper wait strategies

## Related Resources

- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
- [Assertion Utilities](../assertion-utilities/SKILL.md)
- [Debugging & Troubleshooting](../debugging-troubleshooting/SKILL.md)
- [Playwright Docs: Auto-waiting](https://playwright.dev/docs/actionability)
- [Playwright Docs: Test Retries](https://playwright.dev/docs/test-retries)
