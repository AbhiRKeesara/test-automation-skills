import { test, expect } from '@playwright/test';

/**
 * Example: Working with Shadow DOM and Web Components
 *
 * Demonstrates proper techniques for testing web components
 * that use Shadow DOM encapsulation.
 *
 * Source: Adapted from Playwright best practices
 */

test.describe('Shadow DOM Examples', () => {
  test('interact with shadow dom component', async ({ page }) => {
    // Navigate to page with web components
    await page.goto('https://example.com/web-components');

    // Locate the host element (custom element)
    const widget = page.locator('my-widget');

    // Playwright automatically pierces shadow DOM
    const internalButton = widget.locator('.internal-button');

    // Interact with shadow DOM element
    await internalButton.click();

    // Get text from shadow DOM element
    const buttonText = await internalButton.innerText();
    console.log(`Button text: ${buttonText}`);

    // Assertions work normally
    await expect(internalButton).toHaveText('Clicked!');
  });

  test('work with nested shadow components', async ({ page }) => {
    await page.goto('https://example.com/nested-components');

    // Chain locators to traverse nested shadow trees
    const outerComponent = page.locator('outer-widget');
    const innerComponent = outerComponent.locator('inner-widget');
    const deepButton = innerComponent.locator('button.deep-action');

    // Interact with deeply nested element
    await deepButton.click();

    // Verify state change
    await expect(deepButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('use semantic selectors with shadow dom', async ({ page }) => {
    await page.goto('https://example.com/accessible-components');

    const widget = page.locator('accessible-widget');

    // Role selectors work through shadow boundaries
    await widget.getByRole('button', { name: 'Submit' }).click();
    await widget.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
    await widget.getByLabel('Accept Terms').check();

    // Verify result
    await expect(widget.getByRole('alert')).toContainText('Success');
  });

  test('handle multiple shadow components', async ({ page }) => {
    await page.goto('https://example.com/dashboard');

    // Access first card component
    const firstCard = page.locator('custom-card').first();
    await firstCard.locator('button.action').click();

    // Access specific card by data attribute
    const profileCard = page.locator('custom-card[data-type="profile"]');
    await profileCard.locator('button.edit').click();

    // Iterate through all cards
    const allCards = page.locator('custom-card');
    const count = await allCards.count();

    for (let i = 0; i < count; i++) {
      const card = allCards.nth(i);
      const title = await card.locator('.card-title').textContent();
      console.log(`Card ${i}: ${title}`);
    }
  });

  test('test with mixed regular and shadow dom', async ({ page }) => {
    await page.goto('https://example.com/mixed-page');

    // Regular DOM element
    await page.getByRole('button', { name: 'Open Modal' }).click();

    // Shadow DOM in modal
    const modal = page.locator('custom-modal');
    const modalContent = modal.locator('.modal-content');

    await modalContent.getByRole('textbox', { name: 'Name' }).fill('John');

    // Back to regular DOM
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Saved successfully')).toBeVisible();
  });
});

/**
 * Best Practices Demonstrated:
 *
 * ✅ Locate host element first, then access shadow content
 * ✅ Playwright auto-pierces shadow DOM (no special syntax needed)
 * ✅ Use semantic selectors (getByRole, getByLabel) when possible
 * ✅ Chain locators for nested shadow components
 * ✅ Treat shadow DOM elements like regular DOM for interactions
 *
 * Common Pitfalls Avoided:
 *
 * ❌ Using deprecated >>> pierce combinator
 * ❌ Trying to find shadow elements globally
 * ❌ Not locating through host element
 * ❌ Assuming CSS selectors work across shadow boundaries
 * ❌ Not waiting for shadow content to be ready
 *
 * Modern Approach:
 * Playwright's latest API automatically handles shadow DOM piercing
 * when you chain locators from host to shadow child. No special
 * syntax or workarounds needed!
 */
