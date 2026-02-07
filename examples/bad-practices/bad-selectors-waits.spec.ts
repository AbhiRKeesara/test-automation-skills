// Example: Bad Selector and Wait Patterns - Anti-patterns to Avoid
import { test, expect } from '@playwright/test';

test('bad: fragile selectors that break on any CSS change', async ({ page }) => {
  await page.goto('https://example.com/products');

  // ANTI-PATTERN: Deeply nested CSS selectors
  await page.locator('div.main-content > div.product-grid > div:nth-child(1) > div.card-body > h3.title').click();

  // ANTI-PATTERN: Auto-generated class names (CSS modules, Tailwind, styled-components)
  await page.locator('.sc-bdnylx.fNqERu').click(); // styled-components hash
  await page.locator('.css-1a2b3c4').click(); // CSS modules hash
  await page.locator('._3FhRq').click(); // minified class name

  // ANTI-PATTERN: XPath - brittle and hard to read
  await page.locator('//div[@class="products"]//ul/li[3]//button[contains(@class, "add")]').click();

  // ANTI-PATTERN: Selector based on element index only
  await page.locator('button >> nth=2').click(); // Which button? Why the 3rd one?
});

test('bad: waitForTimeout everywhere', async ({ page }) => {
  await page.goto('https://example.com/checkout');

  // ANTI-PATTERN: Wait for page to "settle"
  await page.waitForTimeout(3000);

  await page.locator('#email').fill('user@test.com');

  // ANTI-PATTERN: Wait for "animation to finish"
  await page.waitForTimeout(1000);

  await page.locator('#address').fill('123 Main St');

  // ANTI-PATTERN: Wait for "API response"
  await page.waitForTimeout(5000);

  // ANTI-PATTERN: Wait before assertion
  await page.waitForTimeout(2000);
  const total = await page.locator('.total').textContent();
  expect(total).toBe('$99.99');

  // This test takes 11+ seconds of pure waiting!
  // Proper approach: use auto-waiting assertions and waitForResponse
});

test('bad: page.$ and page.$$ instead of locators', async ({ page }) => {
  await page.goto('https://example.com/products');

  // ANTI-PATTERN: Using page.$ returns ElementHandle (can go stale)
  const button = await page.$('.add-to-cart');
  await button?.click(); // May throw "element detached from DOM"

  // ANTI-PATTERN: Using page.$$ for counting
  const items = await page.$$('.product-card');
  expect(items.length).toBe(10); // Stale count if DOM changes

  // ANTI-PATTERN: Using page.$eval
  const text = await page.$eval('.price', (el) => el.textContent);
  expect(text).toBe('$29.99');

  // Locators are ALWAYS better - they auto-wait and auto-retry
});

test('bad: text selectors without role context', async ({ page }) => {
  await page.goto('https://example.com/settings');

  // ANTI-PATTERN: Matching text that appears multiple times
  await page.locator('text=Save').click(); // Which "Save"? There could be many!

  // ANTI-PATTERN: Partial text match is too broad
  await page.locator('text=Pro').click(); // Matches "Products", "Profile", "Promotions"...

  // ANTI-PATTERN: Case-sensitive text that breaks with copy changes
  await page.locator('text=ADD TO CART').click(); // Breaks if casing changes

  // Better: Use getByRole with name for specificity
  // page.getByRole('button', { name: 'Save Changes' })
});

/**
 * Problems with these selector and wait patterns:
 *
 * - CSS selectors break when designers change classes
 * - Auto-generated class names change on every build
 * - XPath is fragile and hard to maintain
 * - Index-based selectors break when elements are added/removed
 * - waitForTimeout wastes time and is unreliable
 * - ElementHandle ($) can become stale, locators cannot
 * - Text selectors without role context match too broadly
 *
 * Better alternatives:
 * - getByRole() - most resilient, accessibility-based
 * - getByLabel() - great for form elements
 * - getByText() with exact option - for specific text
 * - getByTestId() - when semantic selectors won't work
 * - expect().toBeVisible() - auto-waits instead of waitForTimeout
 * - waitForResponse() - for API-dependent assertions
 */
