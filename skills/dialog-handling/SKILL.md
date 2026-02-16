# Dialog and Alert Handling Skill

## Overview
This skill teaches you how to handle browser dialogs (alerts, confirms, prompts), modal dialogs, and other dialog types in Playwright tests. Proper dialog handling is essential for testing user interactions that require user confirmation or input.

## When to Use
- Testing alert boxes (`window.alert()`)
- Handling confirmation dialogs (`window.confirm()`)
- Working with prompt dialogs (`window.prompt()`)
- Testing beforeunload dialogs (navigation warnings)
- Handling modal dialogs and custom dialog components
- Testing file chooser dialogs

## Core Concepts

### Browser Dialog Types

1. **Alert**: Simple notification dialog with OK button
2. **Confirm**: Dialog with OK and Cancel buttons
3. **Prompt**: Dialog requesting text input with OK and Cancel
4. **BeforeUnload**: Warning when leaving page with unsaved changes

### Playwright Dialog API

Playwright automatically dismisses dialogs unless you set up a listener. This prevents tests from hanging when unexpected dialogs appear.

## Implementation Patterns

### 1. Basic Alert Handling

```typescript
import { test, expect } from '@playwright/test';

test('handle alert dialog', async ({ page }) => {
  // Set up dialog listener BEFORE triggering action
  page.on('dialog', async dialog => {
    console.log(`Alert message: ${dialog.message()}`);
    expect(dialog.type()).toBe('alert');
    await dialog.accept(); // Click OK
  });

  await page.goto('https://example.com');
  await page.getByRole('button', { name: 'Show Alert' }).click();

  // Dialog is automatically handled by the listener
});
```

### 2. Confirm Dialog (Accept/Dismiss)

```typescript
test('accept confirmation dialog', async ({ page }) => {
  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toBe('Are you sure you want to delete?');
    await dialog.accept(); // Click OK
  });

  await page.goto('https://example.com/delete');
  await page.getByRole('button', { name: 'Delete Item' }).click();

  // Verify deletion happened
  await expect(page.getByText('Item deleted')).toBeVisible();
});

test('dismiss confirmation dialog', async ({ page }) => {
  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('confirm');
    await dialog.dismiss(); // Click Cancel
  });

  await page.goto('https://example.com/delete');
  await page.getByRole('button', { name: 'Delete Item' }).click();

  // Verify item still exists
  await expect(page.getByText('Item deleted')).not.toBeVisible();
});
```

### 3. Prompt Dialog (Text Input)

```typescript
test('handle prompt dialog with input', async ({ page }) => {
  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('prompt');
    expect(dialog.message()).toBe('Enter your name:');
    expect(dialog.defaultValue()).toBe(''); // Check default value

    await dialog.accept('John Doe'); // Provide input and click OK
  });

  await page.goto('https://example.com');
  await page.getByRole('button', { name: 'Enter Name' }).click();

  // Verify the name was used
  await expect(page.getByText('Hello, John Doe!')).toBeVisible();
});

test('dismiss prompt dialog', async ({ page }) => {
  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('prompt');
    await dialog.dismiss(); // Click Cancel - no text provided
  });

  await page.goto('https://example.com');
  await page.getByRole('button', { name: 'Enter Name' }).click();

  // Verify prompt was cancelled
  await expect(page.getByText('Name not provided')).toBeVisible();
});
```

### 4. Handling Multiple Dialog Types

```typescript
test('handle all dialog types', async ({ page }) => {
  page.on('dialog', async dialog => {
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
```

### 5. BeforeUnload Dialog

```typescript
test('handle beforeunload dialog', async ({ page }) => {
  await page.goto('https://example.com/form');

  // Fill form to trigger unsaved changes warning
  await page.getByLabel('Name').fill('John Doe');

  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('beforeunload');
    await dialog.accept(); // Proceed with navigation
  });

  // Attempt to navigate away
  await page.goto('https://example.com/other-page');
});
```

### 6. One-Time Dialog Handler

```typescript
test('handle dialog once', async ({ page }) => {
  // Handle only the next dialog
  page.once('dialog', async dialog => {
    await dialog.accept();
  });

  await page.goto('https://example.com');
  await page.getByRole('button', { name: 'Show Alert' }).click();

  // Subsequent dialogs would fail the test (Playwright auto-dismisses)
});
```

### 7. Conditional Dialog Handling

```typescript
test('conditional dialog handling', async ({ page }) => {
  let dialogCount = 0;

  page.on('dialog', async dialog => {
    dialogCount++;

    if (dialog.message().includes('error')) {
      console.error('Error dialog detected:', dialog.message());
      await dialog.accept();
    } else if (dialog.message().includes('confirm')) {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  });

  await page.goto('https://example.com');
  await page.getByRole('button', { name: 'Trigger Multiple Dialogs' }).click();

  expect(dialogCount).toBeGreaterThan(0);
});
```

## Modal Dialogs (Custom HTML Dialogs)

### 1. HTML Dialog Element

```typescript
test('interact with native dialog element', async ({ page }) => {
  await page.goto('https://example.com');

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
```

### 2. Custom Modal Dialog Components

```typescript
test('handle custom modal dialog', async ({ page }) => {
  await page.goto('https://example.com');

  // Trigger modal
  await page.getByRole('button', { name: 'Open Modal' }).click();

  // Wait for modal to appear
  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();

  // Interact with modal content
  await modal.getByLabel('Username').fill('testuser');
  await modal.getByLabel('Password').fill('password123');

  // Submit or close modal
  await modal.getByRole('button', { name: 'Login' }).click();

  // Verify modal is closed
  await expect(modal).not.toBeVisible();
});
```

### 3. Modal with Backdrop Click

```typescript
test('close modal by clicking backdrop', async ({ page }) => {
  await page.goto('https://example.com');

  await page.getByRole('button', { name: 'Open Modal' }).click();

  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();

  // Click outside modal (backdrop)
  const backdrop = page.locator('.modal-backdrop');
  await backdrop.click();

  // Modal should close
  await expect(modal).not.toBeVisible();
});
```

## File Chooser Dialog

```typescript
test('handle file upload dialog', async ({ page }) => {
  await page.goto('https://example.com/upload');

  // Set up file chooser listener
  const fileChooserPromise = page.waitForEvent('filechooser');

  // Trigger file input
  await page.getByRole('button', { name: 'Choose File' }).click();

  const fileChooser = await fileChooserPromise;

  // Upload file(s)
  await fileChooser.setFiles('/path/to/file.pdf');

  // Verify file was selected
  await expect(page.getByText('file.pdf')).toBeVisible();
});

test('upload multiple files', async ({ page }) => {
  await page.goto('https://example.com/upload');

  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByLabel('Upload Files').click();

  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles([
    '/path/to/file1.pdf',
    '/path/to/file2.jpg',
  ]);

  await expect(page.getByText('2 files selected')).toBeVisible();
});
```

## Page Object Pattern for Dialogs

### Dialog Handler Utility

```typescript
// utils/DialogHandler.ts
import { Page, Dialog } from '@playwright/test';

export class DialogHandler {
  private dialogPromise: Promise<Dialog> | null = null;

  constructor(private page: Page) {}

  async expectAndAccept(expectedMessage?: string): Promise<void> {
    this.dialogPromise = this.page.waitForEvent('dialog');

    const dialog = await this.dialogPromise;

    if (expectedMessage) {
      expect(dialog.message()).toBe(expectedMessage);
    }

    await dialog.accept();
  }

  async expectAndAcceptWithInput(input: string, expectedMessage?: string): Promise<void> {
    this.dialogPromise = this.page.waitForEvent('dialog');

    const dialog = await this.dialogPromise;

    if (expectedMessage) {
      expect(dialog.message()).toBe(expectedMessage);
    }

    expect(dialog.type()).toBe('prompt');
    await dialog.accept(input);
  }

  async expectAndDismiss(expectedMessage?: string): Promise<void> {
    this.dialogPromise = this.page.waitForEvent('dialog');

    const dialog = await this.dialogPromise;

    if (expectedMessage) {
      expect(dialog.message()).toBe(expectedMessage);
    }

    await dialog.dismiss();
  }

  setupAutoAccept(): void {
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });
  }

  setupAutoDismiss(): void {
    this.page.on('dialog', async dialog => {
      await dialog.dismiss();
    });
  }
}

// Usage in test
import { DialogHandler } from './utils/DialogHandler';

test('use dialog handler utility', async ({ page }) => {
  const dialogHandler = new DialogHandler(page);

  await page.goto('https://example.com');

  // Setup expectation before triggering action
  const acceptPromise = dialogHandler.expectAndAccept('Are you sure?');
  await page.getByRole('button', { name: 'Delete' }).click();
  await acceptPromise;
});
```

### Modal Component Object

```typescript
// components/ModalDialog.ts
import { Page, Locator } from '@playwright/test';

export class ModalDialog {
  private readonly modal: Locator;

  constructor(private page: Page, modalSelector: string = '[role="dialog"]') {
    this.modal = page.locator(modalSelector);
  }

  async waitForOpen(): Promise<void> {
    await expect(this.modal).toBeVisible();
  }

  async waitForClose(): Promise<void> {
    await expect(this.modal).not.toBeVisible();
  }

  async close(): Promise<void> {
    const closeButton = this.modal.getByRole('button', { name: /close/i });
    await closeButton.click();
    await this.waitForClose();
  }

  async clickBackdrop(): Promise<void> {
    // Click outside the modal content
    await this.page.locator('.modal-backdrop').click();
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  getContent(): Locator {
    return this.modal.locator('.modal-content, .modal-body');
  }

  async getTitle(): Promise<string> {
    return await this.modal.getByRole('heading').textContent() || '';
  }
}

// Specific modal implementations
export class ConfirmationModal extends ModalDialog {
  async confirm(): Promise<void> {
    await this.modal.getByRole('button', { name: /confirm|yes|ok/i }).click();
    await this.waitForClose();
  }

  async cancel(): Promise<void> {
    await this.modal.getByRole('button', { name: /cancel|no/i }).click();
    await this.waitForClose();
  }
}

export class FormModal extends ModalDialog {
  async fillField(label: string, value: string): Promise<void> {
    await this.modal.getByLabel(label).fill(value);
  }

  async submit(): Promise<void> {
    await this.modal.getByRole('button', { name: /submit|save/i }).click();
  }
}

// Usage in test
test('use modal components', async ({ page }) => {
  await page.goto('https://example.com');

  await page.getByRole('button', { name: 'Delete Item' }).click();

  const confirmModal = new ConfirmationModal(page);
  await confirmModal.waitForOpen();
  expect(await confirmModal.getTitle()).toBe('Confirm Deletion');
  await confirmModal.confirm();

  await expect(page.getByText('Item deleted')).toBeVisible();
});
```

## Common Pitfalls & Solutions

### ❌ Not Setting Up Listener Before Action

```typescript
// Bad - listener set up after action
await page.getByRole('button', { name: 'Alert' }).click();
page.on('dialog', async dialog => {
  await dialog.accept(); // Too late!
});

// Good - listener set up before action
page.on('dialog', async dialog => {
  await dialog.accept();
});
await page.getByRole('button', { name: 'Alert' }).click();
```

### ❌ Forgetting to Accept/Dismiss Dialog

```typescript
// Bad - dialog not handled, test hangs
page.on('dialog', async dialog => {
  console.log(dialog.message());
  // Missing dialog.accept() or dialog.dismiss()
});

// Good - always handle dialog
page.on('dialog', async dialog => {
  console.log(dialog.message());
  await dialog.accept();
});
```

### ❌ Using Multiple Conflicting Listeners

```typescript
// Bad - multiple listeners cause confusion
page.on('dialog', async dialog => {
  await dialog.accept();
});

page.on('dialog', async dialog => {
  await dialog.dismiss(); // Which one runs?
});

// Good - use single listener with logic
page.on('dialog', async dialog => {
  if (dialog.type() === 'confirm') {
    await dialog.accept();
  } else {
    await dialog.dismiss();
  }
});
```

### ❌ Confusing Browser Dialogs with HTML Modals

```typescript
// Browser alert - use page.on('dialog')
page.on('dialog', async dialog => {
  await dialog.accept();
});

// HTML modal - use regular locators
const modal = page.locator('[role="dialog"]');
await modal.getByRole('button', { name: 'OK' }).click();
```

## Best Practices

### ✅ Set Up Listener Before Triggering Action

```typescript
// Always register listener first
page.on('dialog', async dialog => {
  await dialog.accept();
});

// Then trigger the action
await page.getByRole('button', { name: 'Show Alert' }).click();
```

### ✅ Validate Dialog Properties

```typescript
page.on('dialog', async dialog => {
  // Validate type, message, default value
  expect(dialog.type()).toBe('confirm');
  expect(dialog.message()).toContain('Are you sure');

  await dialog.accept();
});
```

### ✅ Use waitForEvent for One-Time Dialogs

```typescript
test('wait for specific dialog', async ({ page }) => {
  await page.goto('https://example.com');

  // Better control with waitForEvent
  const dialogPromise = page.waitForEvent('dialog');

  await page.getByRole('button', { name: 'Delete' }).click();

  const dialog = await dialogPromise;
  expect(dialog.message()).toBe('Delete this item?');
  await dialog.accept();
});
```

### ✅ Clean Up Listeners in Fixtures

```typescript
// fixtures/dialogFixture.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  autoAcceptDialogs: async ({ page }, use) => {
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await use(page);

    // Cleanup handled automatically by Playwright
  },
});

// Usage
test('test with auto-accept', async ({ autoAcceptDialogs }) => {
  await autoAcceptDialogs.goto('https://example.com');
  // All dialogs automatically accepted
});
```

## Testing Strategies

### Strategy 1: Explicit Dialog Testing

```typescript
test.describe('Dialog Interactions', () => {
  test('accepts alert', async ({ page }) => {
    let dialogShown = false;

    page.on('dialog', async dialog => {
      dialogShown = true;
      expect(dialog.type()).toBe('alert');
      await dialog.accept();
    });

    await page.goto('https://example.com');
    await page.getByRole('button', { name: 'Show Alert' }).click();

    expect(dialogShown).toBe(true);
  });

  test('provides input to prompt', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept('Test Input');
    });

    await page.goto('https://example.com');
    await page.getByRole('button', { name: 'Enter Name' }).click();

    await expect(page.getByText('Test Input')).toBeVisible();
  });
});
```

### Strategy 2: Dialog as Part of Flow

```typescript
test('complete checkout with confirmation', async ({ page }) => {
  await page.goto('https://example.com/cart');

  // Add items
  await page.getByRole('button', { name: 'Add to Cart' }).click();

  // Proceed to checkout
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Handle confirmation dialog
  const dialogPromise = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Place Order' }).click();

  const dialog = await dialogPromise;
  expect(dialog.message()).toContain('Confirm order');
  await dialog.accept();

  // Verify order placed
  await expect(page.getByText('Order confirmed')).toBeVisible();
});
```

## Debugging Dialogs

```typescript
test('debug dialog interactions', async ({ page }) => {
  page.on('dialog', async dialog => {
    console.log('Dialog appeared:');
    console.log('  Type:', dialog.type());
    console.log('  Message:', dialog.message());
    console.log('  Default value:', dialog.defaultValue());

    await dialog.accept();
  });

  await page.goto('https://example.com');
  await page.getByRole('button', { name: 'Show Dialog' }).click();
});
```

## Related Skills
- [Action Utilities](../action-utilities/SKILL.md) - Advanced interaction patterns
- [Error Handling](../error-handling/SKILL.md) - Handling dialog errors
- [Page Object Model](../page-object-model/SKILL.md) - Structuring dialog components

## External Resources
- [Playwright Dialog API](https://playwright.dev/docs/api/class-dialog)
- [Playwright Events](https://playwright.dev/docs/events)
- [MDN: Dialog Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
