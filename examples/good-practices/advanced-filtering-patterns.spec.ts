import { test, expect } from '@playwright/test';

/**
 * Example: Advanced Filtering and Locator Combination Patterns
 *
 * Demonstrates comprehensive filtering techniques including:
 * - filter({ hasText }), filter({ hasNotText })
 * - filter({ has }), filter({ hasNot })
 * - .and() for combining locators (AND logic)
 * - .or() for alternative locators (OR logic)
 * - List operations (.first(), .last(), .nth(), .all())
 * - Real-world filtering scenarios
 *
 * Source: Based on Playwright documentation best practices
 */

test.describe('Text-Based Filtering', () => {
  test('filter by having specific text', async ({ page }) => {
    await page.goto('https://example.com/products');

    // Find products that contain "In Stock"
    const inStockProducts = page
      .getByRole('article')
      .filter({ hasText: 'In Stock' });

    await expect(inStockProducts).toHaveCount(12);

    // Click first in-stock product
    await inStockProducts.first().click();
  });

  test('filter by NOT having specific text', async ({ page }) => {
    await page.goto('https://example.com/products');

    // Find products that DON'T say "Out of stock"
    const availableProducts = page
      .getByRole('listitem')
      .filter({ hasNotText: 'Out of stock' });

    await expect(availableProducts).toHaveCount(8);

    // Further filter to exclude pre-orders
    const immediatelyAvailable = availableProducts.filter({
      hasNotText: 'Pre-order',
    });

    await expect(immediatelyAvailable).toHaveCount(6);
  });

  test('filter with regex patterns', async ({ page }) => {
    await page.goto('https://example.com/products');

    // Find products in specific price range using regex
    const expensiveProducts = page
      .getByRole('article')
      .filter({ hasText: /\$[1-9][0-9]{2,}/ }); // $100+

    const affordableProducts = page
      .getByRole('article')
      .filter({ hasText: /\$[1-9][0-9](?:\.\d{2})?/ }); // Under $100

    console.log(`Expensive: ${await expensiveProducts.count()}`);
    console.log(`Affordable: ${await affordableProducts.count()}`);
  });
});

test.describe('Child/Descendant Filtering', () => {
  test('filter by having specific child element', async ({ page }) => {
    await page.goto('https://example.com/products');

    // Find products that have "Add to cart" button
    const purchasableProducts = page
      .getByRole('article')
      .filter({ has: page.getByRole('button', { name: 'Add to cart' }) });

    await expect(purchasableProducts).toHaveCount(15);

    // Click "Add to cart" on first one
    await purchasableProducts
      .first()
      .getByRole('button', { name: 'Add to cart' })
      .click();
  });

  test('filter by NOT having specific child element', async ({ page }) => {
    await page.goto('https://example.com/users');

    // Find users that DON'T have delete button (protected users)
    const protectedUsers = page
      .getByRole('row')
      .filter({ hasNot: page.getByRole('button', { name: 'Delete' }) });

    await expect(protectedUsers).toHaveCount(3);

    // Find users that don't have error badges
    const validUsers = page
      .getByRole('row')
      .filter({ hasNot: page.locator('.error-badge') });

    await expect(validUsers.count()).toBeGreaterThan(0);
  });

  test('filter by multiple children', async ({ page }) => {
    await page.goto('https://example.com/products');

    // Find products with both heading and button
    const completeProducts = page
      .getByRole('article')
      .filter({ has: page.getByRole('heading') })
      .filter({ has: page.getByRole('button', { name: 'Add to cart' }) })
      .filter({ has: page.locator('img') });

    await expect(completeProducts.count()).toBeGreaterThan(0);
  });
});

test.describe('Combining Locators (AND Logic)', () => {
  test('combine with .and() for strict matching', async ({ page }) => {
    await page.goto('https://example.com/settings');

    // Button must match BOTH role and title
    const subscribeButton = page
      .getByRole('button')
      .and(page.getByTitle('Subscribe to newsletter'));

    await subscribeButton.click();

    // Combine role and CSS class for specificity
    const primaryDeleteButton = page
      .getByRole('button', { name: 'Delete' })
      .and(page.locator('.primary-action'));

    await expect(primaryDeleteButton).toBeVisible();
  });

  test('combine role and test ID', async ({ page }) => {
    await page.goto('https://example.com/form');

    // Ensure correct button even if multiple "Submit" buttons exist
    const mainSubmit = page
      .getByRole('button', { name: 'Submit' })
      .and(page.getByTestId('main-submit'));

    await mainSubmit.click();
  });
});

test.describe('Alternative Locators (OR Logic)', () => {
  test('handle conditional UI with .or()', async ({ page }) => {
    await page.goto('https://example.com/dashboard');

    // Either modal or inline notification might appear
    const notification = page
      .getByRole('dialog', { name: 'Success' })
      .or(page.getByRole('status', { name: 'Success' }));

    await expect(notification).toBeVisible();
  });

  test('fallback for varying button text', async ({ page }) => {
    await page.goto('https://example.com/form');

    // Button text might vary
    const submitButton = page
      .getByRole('button', { name: 'Submit' })
      .or(page.getByRole('button', { name: 'Send' }))
      .or(page.getByRole('button', { name: 'Confirm' }));

    await submitButton.click();
  });

  test('handle close button variations', async ({ page }) => {
    await page.goto('https://example.com/modal');

    await page.getByRole('button', { name: 'Open' }).click();

    // Close button might be labeled differently
    const closeButton = page
      .getByRole('button', { name: 'Close' })
      .or(page.getByRole('button', { name: 'X' }))
      .or(page.getByRole('button', { name: 'Dismiss' }));

    await closeButton.click();
  });
});

test.describe('Chaining Multiple Filters', () => {
  test('complex product filtering', async ({ page }) => {
    await page.goto('https://example.com/products');

    // Find expensive, available products with free shipping
    const premiumProducts = page
      .getByRole('article')
      .filter({ hasNotText: 'Out of stock' })
      .filter({ hasNotText: 'Coming Soon' })
      .filter({ hasText: /\$[1-9][0-9]{2,}/ }) // $100+
      .filter({ hasText: 'Free Shipping' })
      .filter({ has: page.getByRole('button', { name: 'Add to cart' }) });

    console.log(`Found ${await premiumProducts.count()} premium products`);

    await premiumProducts
      .first()
      .getByRole('button', { name: 'Add to cart' })
      .click();
  });

  test('filter dashboard widgets by health', async ({ page }) => {
    await page.goto('https://example.com/dashboard');

    // Find active, non-error widgets with data
    const healthyWidgets = page
      .locator('.dashboard-widget')
      .filter({ hasText: 'Active' })
      .filter({ hasNotText: 'Error' })
      .filter({ hasNotText: 'Offline' })
      .filter({ hasNot: page.locator('.error-badge') })
      .filter({ has: page.locator('.data-display') });

    const count = await healthyWidgets.count();
    expect(count).toBeGreaterThan(0);

    // Verify all have refresh button
    for (const widget of await healthyWidgets.all()) {
      await expect(widget.locator('button.refresh')).toBeVisible();
    }
  });
});

test.describe('List Operations', () => {
  test('select specific items', async ({ page }) => {
    await page.goto('https://example.com/list');

    // Get first item
    await page.getByRole('listitem').first().click();

    // Get last item
    const lastItemText = await page.getByRole('listitem').last().textContent();
    console.log(`Last item: ${lastItemText}`);

    // Get by index (zero-based)
    await page.getByRole('listitem').nth(2).click(); // Third item

    // Negative indices
    await page.getByRole('listitem').nth(-1).click(); // Last item
  });

  test('count and assert lists', async ({ page }) => {
    await page.goto('https://example.com/products');

    // Get count
    const productCount = await page.getByRole('article').count();
    expect(productCount).toBeGreaterThan(0);

    // Assert exact count
    await expect(page.getByRole('listitem')).toHaveCount(10);

    // Assert text content in order
    await expect(page.getByRole('listitem')).toHaveText([
      'Item 1',
      'Item 2',
      'Item 3',
    ]);
  });

  test('iterate through elements', async ({ page }) => {
    await page.goto('https://example.com/products');

    // Get all items
    const products = await page.getByRole('article').all();

    const productNames: string[] = [];

    for (const product of products) {
      const name = await product.getByRole('heading').textContent();
      if (name) productNames.push(name);
    }

    console.log('All products:', productNames);

    // Find and click specific item
    for (const product of products) {
      const hasFreeShipping = await product
        .getByText('Free Shipping')
        .isVisible();

      if (hasFreeShipping) {
        await product.getByRole('button', { name: 'Add to cart' }).click();
        break;
      }
    }
  });

  test('filter and iterate', async ({ page }) => {
    await page.goto('https://example.com/products');

    // Get filtered list
    const availableProducts = page
      .getByRole('article')
      .filter({ hasNotText: 'Out of stock' });

    // Iterate through filtered results
    const items = await availableProducts.all();

    for (const item of items) {
      const price = await item.locator('.price').textContent();
      const title = await item.getByRole('heading').textContent();
      console.log(`${title}: ${price}`);
    }
  });
});

test.describe('Real-World Scenarios', () => {
  test('e-commerce product selection', async ({ page }) => {
    await page.goto('https://example.com/shop');

    // Find affordable, in-stock items with free shipping
    const deals = page
      .getByRole('article')
      .filter({ hasNotText: 'Out of stock' })
      .filter({ hasNotText: 'Pre-order' })
      .filter({ hasText: /\$[1-5][0-9]/ }) // $10-$59
      .filter({ hasText: 'Free Shipping' });

    console.log(`Found ${await deals.count()} deals`);

    // Add first 3 to cart
    const items = await deals.all();
    for (let i = 0; i < Math.min(3, items.length); i++) {
      await items[i].getByRole('button', { name: 'Add to cart' }).click();
    }
  });

  test('table row filtering and selection', async ({ page }) => {
    await page.goto('https://example.com/users');

    // Find user row by email
    const userRow = page
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'john@example.com' }) });

    await userRow.getByRole('button', { name: 'Edit' }).click();

    // Find active users without errors
    const activeUsers = page
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'Active' }) })
      .filter({ hasNot: page.locator('.error-icon') });

    console.log(`Active users: ${await activeUsers.count()}`);

    // System users (no delete button)
    const systemUsers = page
      .getByRole('row')
      .filter({ hasNot: page.getByRole('button', { name: 'Delete' }) });

    await expect(systemUsers).toHaveCount(3);
  });

  test('dashboard widget management', async ({ page }) => {
    await page.goto('https://example.com/dashboard');

    // Categorize widgets
    const errorWidgets = page.locator('.widget').filter({ hasText: 'Error' });
    const loadingWidgets = page.locator('.widget').filter({ hasText: 'Loading' });
    const activeWidgets = page
      .locator('.widget')
      .filter({ hasText: 'Active' })
      .filter({ hasNotText: 'Error' });

    console.log(`Error: ${await errorWidgets.count()}`);
    console.log(`Loading: ${await loadingWidgets.count()}`);
    console.log(`Active: ${await activeWidgets.count()}`);

    // Refresh all error widgets
    const errorRefreshButtons = await errorWidgets.locator('button.refresh').all();

    for (const button of errorRefreshButtons) {
      await button.click();
      await page.waitForTimeout(500); // Wait for refresh
    }

    // Verify errors cleared
    await expect(errorWidgets).toHaveCount(0);
  });

  test('form validation state filtering', async ({ page }) => {
    await page.goto('https://example.com/form');

    // Find fields with errors
    const invalidFields = page
      .locator('input')
      .filter({ has: page.locator('.error-message') });

    console.log(`Invalid fields: ${await invalidFields.count()}`);

    // Find valid required fields
    const validRequired = page
      .locator('input[required]')
      .filter({ hasNot: page.locator('.error-message') });

    // Count empty required fields
    const emptyRequired = await page.locator('input[required]').all();
    let emptyCount = 0;

    for (const field of emptyRequired) {
      const value = await field.inputValue();
      if (!value) emptyCount++;
    }

    console.log(`Empty required fields: ${emptyCount}`);
  });

  test('conditional notification handling', async ({ page }) => {
    await page.goto('https://example.com/action');

    await page.getByRole('button', { name: 'Submit' }).click();

    // Handle either modal or toast notification
    const successNotification = page
      .getByRole('dialog', { name: /success/i })
      .or(page.getByRole('status', { name: /success/i }))
      .or(page.locator('.toast-success'));

    await expect(successNotification).toBeVisible();

    // Close using any available close button
    const closeButton = successNotification
      .getByRole('button', { name: 'Close' })
      .or(successNotification.getByRole('button', { name: 'X' }))
      .or(successNotification.getByRole('button', { name: 'OK' }));

    await closeButton.click();

    await expect(successNotification).not.toBeVisible();
  });
});

/**
 * Best Practices Demonstrated:
 *
 * ✅ Use filter({ hasText }) for presence of text
 * ✅ Use filter({ hasNotText }) for absence of text
 * ✅ Use filter({ has }) for child element presence
 * ✅ Use filter({ hasNot }) for child element absence
 * ✅ Use .and() to combine multiple conditions (AND logic)
 * ✅ Use .or() for alternative selectors (OR logic)
 * ✅ Chain multiple filters for precise targeting
 * ✅ Use .first(), .last(), .nth() for specific items
 * ✅ Use .all() for iteration
 * ✅ Combine filtering with semantic selectors
 *
 * Common Pitfalls Avoided:
 *
 * ❌ Overly specific CSS selectors
 * ❌ Hard-coded indices without filtering
 * ❌ Not handling conditional UI states
 * ❌ Assuming element order is stable
 * ❌ Not using semantic selectors with filters
 *
 * When to Use Which:
 *
 * - hasText: "Find products containing 'Free Shipping'"
 * - hasNotText: "Find products NOT saying 'Out of stock'"
 * - has: "Find rows containing a delete button"
 * - hasNot: "Find rows without error icons"
 * - and(): "Button must be both primary AND enabled"
 * - or(): "Accept either modal OR toast notification"
 * - Chain filters: "Multiple conditions must all be true"
 */
