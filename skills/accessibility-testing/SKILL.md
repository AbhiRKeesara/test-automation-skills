# Accessibility Testing Skill

Comprehensive guide for integrating accessibility (a11y) testing into your Playwright test automation.

## Why Accessibility Testing Matters

- ✅ Ensures your app is usable by everyone
- ✅ Catches issues early in development
- ✅ Compliance with WCAG 2.1 standards
- ✅ Better user experience for all users
- ✅ Legal requirement in many jurisdictions

## Quick Start

### Install axe-core

```bash
npm install --save-dev @axe-core/playwright
```

### Basic Usage

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage should not have accessibility violations', async ({ page }) => {
  await page.goto('https://your-app.com');
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Comprehensive Accessibility Testing

### 1. Automated Accessibility Scans

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Checks', () => {
  test('prescription search page should be accessible', async ({ page }) => {
    await page.goto('/prescriptions/search');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('refill confirmation page should be accessible', async ({ page }) => {
    await page.goto('/prescriptions/refill/confirm');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#third-party-widget') // Exclude elements you don't control
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

### 2. Keyboard Navigation Testing

```typescript
test('user can navigate prescription list with keyboard', async ({ page }) => {
  await page.goto('/prescriptions');
  
  // Tab to first prescription
  await page.keyboard.press('Tab');
  const firstPrescription = page.getByRole('article').first();
  await expect(firstPrescription).toBeFocused();
  
  // Navigate with arrow keys
  await page.keyboard.press('ArrowDown');
  const secondPrescription = page.getByRole('article').nth(1);
  await expect(secondPrescription).toBeFocused();
  
  // Activate with Enter
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/.*prescription\/[0-9]+/);
});

test('modal can be closed with Escape key', async ({ page }) => {
  await page.goto('/prescriptions');
  
  // Open modal
  await page.getByRole('button', { name: 'Refill' }).click();
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  
  // Close with Escape
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});
```

### 3. Screen Reader Compatibility

```typescript
test('images have alt text', async ({ page }) => {
  await page.goto('/prescriptions');
  
  const images = page.getByRole('img');
  const count = await images.count();
  
  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    await expect(img).toHaveAttribute('alt');
  }
});

test('form inputs have accessible labels', async ({ page }) => {
  await page.goto('/patient/registration');
  
  // All inputs should be accessible by label
  await expect(page.getByLabel('First name')).toBeVisible();
  await expect(page.getByLabel('Last name')).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Phone')).toBeVisible();
});

test('buttons have accessible names', async ({ page }) => {
  await page.goto('/prescriptions');
  
  // Verify all buttons have accessible names
  const buttons = page.getByRole('button');
  const count = await buttons.count();
  
  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    const accessibleName = await button.getAttribute('aria-label') || await button.textContent();
    expect(accessibleName).toBeTruthy();
  }
});
```

### 4. Color Contrast Testing

```typescript
test('text has sufficient color contrast', async ({ page }) => {
  await page.goto('/dashboard');
  
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2aa'])
    .analyze();
  
  // Check for color contrast violations
  const contrastViolations = accessibilityScanResults.violations.filter(
    v => v.id === 'color-contrast'
  );
  
  expect(contrastViolations).toEqual([]);
});
```

### 5. Focus Management

```typescript
test('focus moves to error message after validation failure', async ({ page }) => {
  await page.goto('/prescriptions/refill');
  
  // Submit form without filling required fields
  await page.getByRole('button', { name: 'Submit' }).click();
  
  // Focus should move to error message or first invalid field
  const errorMessage = page.getByRole('alert');
  await expect(errorMessage).toBeFocused();
});

test('focus is trapped in modal dialog', async ({ page }) => {
  await page.goto('/prescriptions');
  await page.getByRole('button', { name: 'Delete' }).click();
  
  const modal = page.getByRole('dialog');
  const confirmButton = modal.getByRole('button', { name: 'Confirm' });
  const cancelButton = modal.getByRole('button', { name: 'Cancel' });
  
  // Tab through modal elements
  await page.keyboard.press('Tab');
  await expect(confirmButton).toBeFocused();
  
  await page.keyboard.press('Tab');
  await expect(cancelButton).toBeFocused();
  
  // Tab again should cycle back to first element (focus trap)
  await page.keyboard.press('Tab');
  await expect(confirmButton).toBeFocused();
});
```

## WCAG 2.1 Level AA Checklist

### Perceivable
- [ ] All images have alt text
- [ ] Text has sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- [ ] Content is accessible without relying on color alone
- [ ] Audio/video has captions or transcripts

### Operable
- [ ] All functionality is keyboard accessible
- [ ] No keyboard traps
- [ ] Skip navigation links are present
- [ ] Page titles are descriptive
- [ ] Focus order is logical
- [ ] Focus is visible

### Understandable
- [ ] Page language is specified
- [ ] Labels and instructions are clear
- [ ] Error messages are descriptive
- [ ] Form validation provides suggestions

### Robust
- [ ] Valid HTML
- [ ] ARIA attributes used correctly
- [ ] Compatible with assistive technologies

## Accessibility Test Suite Template

```typescript
// accessibility-suite.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Compliance - Prescription Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prescriptions');
  });
  
  test('automated accessibility scan', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });
  
  test('keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Prescriptions' })).toBeFocused();
  });
  
  test('screen reader landmarks', async ({ page }) => {
    await expect(page.getByRole('banner')).toBeVisible(); // Header
    await expect(page.getByRole('navigation')).toBeVisible(); // Nav
    await expect(page.getByRole('main')).toBeVisible(); // Main content
    await expect(page.getByRole('contentinfo')).toBeVisible(); // Footer
  });
  
  test('form accessibility', async ({ page }) => {
    await page.getByRole('button', { name: 'Search' }).click();
    
    // All form fields should be accessible by label
    await expect(page.getByLabel('Medication name')).toBeVisible();
    await expect(page.getByLabel('Prescription number')).toBeVisible();
  });
});
```

## Common Accessibility Issues & Fixes

### Issue 1: Missing Alt Text

```html
<!-- ❌ Bad -->
<img src="prescription.jpg">

<!-- ✅ Good -->
<img src="prescription.jpg" alt="Lisinopril 10mg prescription">
```

### Issue 2: Poor Color Contrast

```css
/* ❌ Bad - Low contrast */
.text {
  color: #999999;
  background: #ffffff;
}

/* ✅ Good - High contrast */
.text {
  color: #333333;
  background: #ffffff;
}
```

### Issue 3: Non-Accessible Buttons

```html
<!-- ❌ Bad - Div as button -->
<div onclick="submit()">Submit</div>

<!-- ✅ Good - Semantic button -->
<button type="submit">Submit</button>
```

### Issue 4: Missing Form Labels

```html
<!-- ❌ Bad - No label -->
<input type="text" name="email" placeholder="Email">

<!-- ✅ Good - Proper label -->
<label for="email">Email</label>
<input type="text" id="email" name="email">
```

## Related Resources

- [Selector Strategies](../selector-strategies/SKILL.md)
- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Playwright](https://www.npmjs.com/package/@axe-core/playwright)
