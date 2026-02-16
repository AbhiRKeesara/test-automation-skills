# Dialog and Alert Handling

Learn how to handle browser dialogs (alert, confirm, prompt) and modal dialogs in Playwright tests.

## What You'll Learn
- Handling browser alert dialogs
- Working with confirmation and prompt dialogs
- Managing file chooser dialogs
- Testing custom modal dialogs
- Building dialog handler utilities

## Quick Example

```typescript
// Browser alert/confirm/prompt
page.on('dialog', async dialog => {
  console.log(`Dialog: ${dialog.type()} - ${dialog.message()}`);

  if (dialog.type() === 'prompt') {
    await dialog.accept('user input');
  } else if (dialog.type() === 'confirm') {
    await dialog.accept();
  } else {
    await dialog.dismiss();
  }
});

// HTML modal dialog
const modal = page.locator('[role="dialog"]');
await modal.getByRole('button', { name: 'OK' }).click();
```

## See Full Documentation
[View SKILL.md](./SKILL.md) for comprehensive patterns and examples.
