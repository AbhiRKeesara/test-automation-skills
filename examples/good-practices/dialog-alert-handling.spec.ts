import { test, expect } from '@playwright/test';

/**
 * Example: Handling Browser Dialogs and Alerts
 *
 * Demonstrates proper techniques for handling:
 * - Alert dialogs (window.alert)
 * - Confirm dialogs (window.confirm)
 * - Prompt dialogs (window.prompt)
 * - Custom modal components
 *
 * Source: Adapted from Playwright best practices
 */

test.describe('Dialog Handling Examples', () => {
  test('handle alert dialog', async ({ page }) => {
    // Set up dialog listener BEFORE triggering action
    page.on('dialog', async (dialog) => {
      console.log(`Alert message: ${dialog.message()}`);
      expect(dialog.type()).toBe('alert');
      await dialog.accept(); // Click OK
    });

    await page.goto('https://testpages.eviltester.com/styled/alerts/alert-test.html');
    await page.getByRole('button', { name: 'Show alert box' }).click();

    // Dialog is automatically handled by the listener
  });

  test('handle confirmation dialog - accept', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toBe('Are you sure you want to delete?');
      await dialog.accept(); // Click OK
    });

    await page.goto('https://example.com/delete');
    await page.getByRole('button', { name: 'Delete Item' }).click();

    // Verify deletion happened
    await expect(page.getByText('Item deleted')).toBeVisible();
  });

  test('handle confirmation dialog - dismiss', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss(); // Click Cancel
    });

    await page.goto('https://example.com/delete');
    await page.getByRole('button', { name: 'Delete Item' }).click();

    // Verify item still exists (deletion cancelled)
    await expect(page.getByText('Item deleted')).not.toBeVisible();
  });

  test('handle prompt dialog with input', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      expect(dialog.message()).toBe('Enter your name:');
      expect(dialog.defaultValue()).toBe(''); // Check default value

      await dialog.accept('John Doe'); // Provide input and click OK
    });

    await page.goto('https://example.com/prompt');
    await page.getByRole('button', { name: 'Enter Name' }).click();

    // Verify the name was used
    await expect(page.getByText('Hello, John Doe!')).toBeVisible();
  });

  test('handle all dialog types', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      console.log(`Dialog type: ${dialog.type()}, message: ${dialog.message()}`);

      if (dialog.type() === 'prompt') {
        await dialog.accept('user input');
      } else if (dialog.type() === 'confirm') {
        await dialog.accept(); // Click OK
      } else {
        await dialog.dismiss(); // Dismiss alerts
      }
    });

    await page.goto('https://testpages.eviltester.com/styled/alerts/alert-test.html');

    await page.getByRole('button', { name: 'Show alert box' }).click();
    await page.getByRole('button', { name: 'Show confirm box' }).click();
    await page.getByRole('button', { name: 'Show prompt box' }).click();
  });

  test('use waitForEvent for one-time dialog', async ({ page }) => {
    await page.goto('https://example.com');

    // Better control with waitForEvent
    const dialogPromise = page.waitForEvent('dialog');

    await page.getByRole('button', { name: 'Delete' }).click();

    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Delete this item?');
    await dialog.accept();

    await expect(page.getByText('Item deleted')).toBeVisible();
  });
});

test.describe('Custom Modal Dialog Examples', () => {
  test('interact with HTML dialog element', async ({ page }) => {
    await page.goto('https://example.com/dialog');

    // Open dialog
    await page.getByRole('button', { name: 'Open Dialog' }).click();

    // Dialog is now visible in DOM
    const dialog = page.locator('dialog[open]');
    await expect(dialog).toBeVisible();

    // Interact with dialog content
    await dialog.getByLabel('Email').fill('test@example.com');
    await dialog.getByRole('button', { name: 'Submit' }).click();

    // Dialog should be closed
    await expect(dialog).not.toBeVisible();
  });

  test('handle custom modal dialog', async ({ page }) => {
    await page.goto('https://example.com/modal');

    // Trigger modal
    await page.getByRole('button', { name: 'Open Modal' }).click();

    // Wait for modal to appear
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Interact with modal content
    await modal.getByLabel('Username').fill('testuser');
    await modal.getByLabel('Password').fill('password123');

    // Submit modal
    await modal.getByRole('button', { name: 'Login' }).click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
    await expect(page.getByText('Login successful')).toBeVisible();
  });

  test('close modal by clicking backdrop', async ({ page }) => {
    await page.goto('https://example.com/modal');

    await page.getByRole('button', { name: 'Open Modal' }).click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Click outside modal (backdrop)
    const backdrop = page.locator('.modal-backdrop');
    await backdrop.click();

    // Modal should close
    await expect(modal).not.toBeVisible();
  });

  test('close modal with escape key', async ({ page }) => {
    await page.goto('https://example.com/modal');

    await page.getByRole('button', { name: 'Open Modal' }).click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');

    await expect(modal).not.toBeVisible();
  });
});

/**
 * Best Practices Demonstrated:
 *
 * ✅ Set up dialog listener BEFORE triggering action
 * ✅ Validate dialog type and message
 * ✅ Always accept() or dismiss() dialogs
 * ✅ Use waitForEvent for one-time dialogs
 * ✅ Distinguish between browser dialogs and HTML modals
 *
 * Common Pitfalls Avoided:
 *
 * ❌ Setting up listener after triggering action (race condition)
 * ❌ Not handling dialog (test hangs)
 * ❌ Confusing browser alerts with HTML modal components
 * ❌ Using multiple conflicting dialog listeners
 * ❌ Forgetting to verify dialog message/type
 *
 * Important Notes:
 *
 * 1. Browser dialogs (alert/confirm/prompt):
 *    - Use page.on('dialog') or page.waitForEvent('dialog')
 *    - Must accept() or dismiss() to prevent test hanging
 *    - Cannot be inspected with DevTools
 *
 * 2. HTML modals (dialog element, custom modals):
 *    - Use regular locators (page.locator, getByRole)
 *    - Can be styled and interact like regular elements
 *    - Inspectable in DevTools
 */
