---
name: accessibility-testing
description: >
  Accessibility (a11y) testing patterns with Playwright and axe-core. Use when adding WCAG 2.1 compliance checks, keyboard navigation testing, screen reader compatibility, or color contrast validation to your test suite.
---

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

## Playwright Native Accessibility Assertions

Playwright provides built-in matchers for element-level accessibility checks — no axe-core needed. Use these for targeted regression testing alongside full-page scans.

### toHaveAccessibleName()

Verifies an element's accessible name (what screen readers announce).

```typescript
test('buttons have correct accessible names', async ({ page }) => {
  await page.goto('/prescriptions');

  // Verify accessible names on interactive elements
  await expect(page.getByRole('button', { name: 'Refill' }))
    .toHaveAccessibleName('Refill prescription');

  await expect(page.getByRole('link', { name: 'View details' }))
    .toHaveAccessibleName('View details for Lisinopril 10mg');

  // Icon-only button should have an accessible name via aria-label
  await expect(page.getByTestId('close-btn'))
    .toHaveAccessibleName('Close dialog');
});

test('form inputs have proper accessible names', async ({ page }) => {
  await page.goto('/patient/registration');

  await expect(page.getByRole('textbox', { name: 'First name' }))
    .toHaveAccessibleName('First name');

  await expect(page.getByRole('textbox', { name: 'Email address' }))
    .toHaveAccessibleName('Email address');

  // Supports regex matching
  await expect(page.getByRole('combobox').first())
    .toHaveAccessibleName(/state|province/i);
});
```

### toHaveAccessibleDescription()

Verifies the element's accessible description (additional context for screen readers, often from `aria-describedby`).

```typescript
test('form fields have helpful descriptions', async ({ page }) => {
  await page.goto('/patient/registration');

  // Password field should describe requirements
  await expect(page.getByLabel('Password'))
    .toHaveAccessibleDescription('Must be at least 8 characters with one number');

  // Date field should describe format
  await expect(page.getByLabel('Date of birth'))
    .toHaveAccessibleDescription(/MM\/DD\/YYYY/);
});
```

### toHaveAccessibleErrorMessage()

Verifies error messages are properly associated with form inputs via `aria-errormessage`.

```typescript
test('form validation shows accessible error messages', async ({ page }) => {
  await page.goto('/patient/registration');

  // Submit empty form to trigger validation
  await page.getByRole('button', { name: 'Register' }).click();

  // Verify error messages are programmatically associated with inputs
  await expect(page.getByLabel('Email address'))
    .toHaveAccessibleErrorMessage('Email is required');

  await expect(page.getByLabel('Password'))
    .toHaveAccessibleErrorMessage('Password must be at least 8 characters');

  // After fixing the error, error message should clear
  await page.getByLabel('Email address').fill('user@example.com');
  await page.getByLabel('Email address').blur();
  await expect(page.getByLabel('Email address'))
    .not.toHaveAccessibleErrorMessage();
});
```

### Combining Native Assertions with axe-core

```typescript
test.describe('Comprehensive A11y: Scan + Element Assertions', () => {
  test('login form is fully accessible', async ({ page }) => {
    await page.goto('/login');

    // 1. Full page scan with axe-core
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);

    // 2. Element-level assertions for regression safety
    await expect(page.getByRole('textbox', { name: 'Email' }))
      .toHaveAccessibleName('Email');
    await expect(page.getByLabel('Password'))
      .toHaveAccessibleDescription(/at least 8 characters/);
    await expect(page.getByRole('button', { name: 'Sign in' }))
      .toHaveAccessibleName('Sign in');
  });
});
```

## Alternative: axe-playwright (Community Library)

`axe-playwright` offers a simpler API than `@axe-core/playwright`. Good for teams that want minimal setup.

### Install

```bash
npm install --save-dev axe-playwright
```

### Usage

```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

test.describe('A11y with axe-playwright', () => {
  test('homepage is accessible', async ({ page }) => {
    await page.goto('/');

    // Step 1: Inject axe-core into the page
    await injectAxe(page);

    // Step 2: Run accessibility check (auto-fails on violations)
    await checkA11y(page);
  });

  test('scoped scan on specific element', async ({ page }) => {
    await page.goto('/prescriptions');
    await injectAxe(page);

    // Check only the main content area
    await checkA11y(page, '#main-content', {
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      },
    });
  });

  test('get violations for custom reporting', async ({ page }) => {
    await page.goto('/dashboard');
    await injectAxe(page);

    // Get violations without auto-failing (for custom handling)
    const violations = await getViolations(page);

    // Custom assertion with detailed reporting
    if (violations.length > 0) {
      const report = violations.map(v => ({
        rule: v.id,
        impact: v.impact,
        description: v.description,
        elements: v.nodes.length,
      }));
      console.table(report);
    }
    expect(violations).toHaveLength(0);
  });
});
```

### @axe-core/playwright vs axe-playwright

| Feature | `@axe-core/playwright` | `axe-playwright` |
|---------|----------------------|------------------|
| Maintainer | Deque Systems (official) | Community |
| API style | Builder pattern (`new AxeBuilder()`) | Function calls (`injectAxe` + `checkA11y`) |
| Setup | Import and use directly | Inject into page first |
| Flexibility | High (include/exclude, tags, rules) | Moderate |
| Auto-fail on violations | No (you assert manually) | Yes (configurable) |
| **Recommendation** | ✅ Use for production projects | Good for quick checks |

## Accessibility Regression Testing in CI

Track a11y violations over time and prevent regressions in your pipeline.

### A11y Fixture for Every Page

```typescript
// fixtures/a11y-fixture.ts
import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type A11yFixtures = {
  makeAxeBuilder: () => AxeBuilder;
};

export const test = base.extend<A11yFixtures>({
  makeAxeBuilder: async ({ page }, use) => {
    await use(() =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    );
  },
});

export { expect };
```

### Run A11y Scans on Every Critical Page

```typescript
// tests/a11y-regression.spec.ts
import { test, expect } from '../fixtures/a11y-fixture';

const criticalPages = [
  { name: 'Home', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Prescriptions', path: '/prescriptions' },
  { name: 'Profile', path: '/profile' },
  { name: 'Settings', path: '/settings' },
];

for (const { name, path } of criticalPages) {
  test(`a11y regression: ${name} page`, async ({ page, makeAxeBuilder }) => {
    await page.goto(path);
    const results = await makeAxeBuilder().analyze();

    // Attach violations to test report for debugging
    if (results.violations.length > 0) {
      const violationSummary = results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      }));
      console.log(`A11y violations on ${name}:`, JSON.stringify(violationSummary, null, 2));
    }

    expect(results.violations).toEqual([]);
  });
}
```

### Tag A11y Tests for Selective CI Runs

```typescript
test('full a11y audit @a11y @regression', async ({ page, makeAxeBuilder }) => {
  await page.goto('/');
  const results = await makeAxeBuilder().analyze();
  expect(results.violations).toEqual([]);
});
```

```bash
# Run only a11y tests in CI
npx playwright test --grep @a11y

# Run a11y tests nightly (not on every PR)
npx playwright test --grep @a11y --project=chromium
```

## Related Resources

- [Selector Strategies](../selector-strategies/SKILL.md)
- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
- [Test Fixtures & Setup](../test-fixtures-setup/SKILL.md) — A11y fixture pattern
- [CI/CD Integration](../ci-cd-integration/SKILL.md) — Running a11y tests in pipelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Playwright](https://www.npmjs.com/package/@axe-core/playwright)
- [axe-playwright](https://www.npmjs.com/package/axe-playwright)
- [Automated-Accessibility-Example-Lib](https://github.com/Steady5063/Automated-Accessibility-Example-Lib) — Multi-framework a11y examples
