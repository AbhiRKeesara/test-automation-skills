---
name: visual-regression-testing
description: >
  Screenshot comparison patterns for catching unintended UI changes with Playwright. Use when setting up visual regression tests, configuring screenshot thresholds, handling dynamic content, or integrating visual checks into CI/CD pipelines.
---

# Visual Regression Testing Skill

Best practices for visual regression testing with Playwright to catch unintended UI changes.

## Why Visual Regression Testing

- **Catch UI bugs** - Detect unexpected layout shifts, styling changes
- **Cross-browser consistency** - Ensure UI looks correct across browsers
- **Design system compliance** - Verify components match design specs
- **Regression prevention** - Prevent CSS changes from breaking existing pages

## Table of Contents

- [Screenshot Comparisons](#screenshot-comparisons)
- [Configuration](#configuration)
- [Testing Strategies](#testing-strategies)
- [Handling Dynamic Content](#handling-dynamic-content)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

---

## Screenshot Comparisons

### Full Page Screenshots

```typescript
import { test, expect } from '@playwright/test';

test('homepage visual regression', async ({ page }) => {
  await page.goto('/');

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Take full page screenshot and compare
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
  });
});
```

### Component Screenshots

```typescript
test('product card visual regression', async ({ page }) => {
  await page.goto('/products');

  // Screenshot specific component
  const productCard = page.getByTestId('product-card').first();
  await expect(productCard).toHaveScreenshot('product-card.png');
});

test('navigation menu visual regression', async ({ page }) => {
  await page.goto('/');

  const navbar = page.getByRole('navigation');
  await expect(navbar).toHaveScreenshot('navigation.png');
});
```

### Multiple Viewport Sizes

```typescript
const viewports = [
  { width: 1920, height: 1080, name: 'desktop' },
  { width: 1024, height: 768, name: 'tablet' },
  { width: 375, height: 667, name: 'mobile' },
];

for (const viewport of viewports) {
  test(`homepage at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`, {
      fullPage: true,
    });
  });
}
```

---

## Configuration

### Playwright Config for Visual Testing

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Snapshot settings
  expect: {
    toHaveScreenshot: {
      // Maximum allowed pixel difference
      maxDiffPixels: 100,

      // Maximum allowed ratio of different pixels (0-1)
      maxDiffPixelRatio: 0.01,

      // Threshold for comparing colors (0-1)
      threshold: 0.2,

      // Animation handling
      animations: 'disabled',

      // Caret blinking
      caret: 'hide',

      // Scale
      scale: 'css',
    },
  },

  // Update snapshots mode
  updateSnapshots: process.env.UPDATE_SNAPSHOTS ? 'all' : 'missing',

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Consistent screenshots across runs
        launchOptions: {
          args: ['--font-render-hinting=none'],
        },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

### Screenshot Options

```typescript
test('configurable screenshot options', async ({ page }) => {
  await page.goto('/products');

  await expect(page).toHaveScreenshot('products-page.png', {
    // Full page vs viewport
    fullPage: true,

    // Pixel difference threshold
    maxDiffPixels: 50,

    // Percentage difference threshold
    maxDiffPixelRatio: 0.005,

    // Color comparison threshold
    threshold: 0.1,

    // Disable animations
    animations: 'disabled',

    // Hide caret in inputs
    caret: 'hide',

    // Mask dynamic elements
    mask: [
      page.getByTestId('timestamp'),
      page.getByTestId('user-avatar'),
    ],

    // Mask color
    maskColor: '#FF00FF',

    // Omit background
    omitBackground: false,

    // Scale factor
    scale: 'css',

    // Timeout
    timeout: 10000,
  });
});
```

---

## Testing Strategies

### Component Library Testing

```typescript
test.describe('Button Component Visual Tests', () => {
  test('primary button states', async ({ page }) => {
    await page.goto('/storybook/buttons');

    const primaryButton = page.getByRole('button', { name: 'Primary' });

    // Default state
    await expect(primaryButton).toHaveScreenshot('button-primary-default.png');

    // Hover state
    await primaryButton.hover();
    await expect(primaryButton).toHaveScreenshot('button-primary-hover.png');

    // Focus state
    await primaryButton.focus();
    await expect(primaryButton).toHaveScreenshot('button-primary-focus.png');

    // Disabled state
    const disabledButton = page.getByRole('button', { name: 'Disabled' });
    await expect(disabledButton).toHaveScreenshot('button-primary-disabled.png');
  });
});
```

### Form Validation States

```typescript
test.describe('Form Visual States', () => {
  test('input field states', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByLabel('Email');

    // Empty state
    await expect(emailInput).toHaveScreenshot('input-empty.png');

    // Filled state
    await emailInput.fill('user@example.com');
    await expect(emailInput).toHaveScreenshot('input-filled.png');

    // Error state
    await emailInput.fill('invalid-email');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(emailInput).toHaveScreenshot('input-error.png');
  });
});
```

### Dark Mode Testing

```typescript
test.describe('Dark Mode Visual Tests', () => {
  test('homepage in dark mode', async ({ page }) => {
    // Enable dark mode via media query emulation
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
    });
  });

  test('homepage in light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    await expect(page).toHaveScreenshot('homepage-light.png', {
      fullPage: true,
    });
  });
});
```

### Responsive Design Testing

```typescript
test.describe('Responsive Design', () => {
  const breakpoints = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1440, height: 900 },
  };

  for (const [name, size] of Object.entries(breakpoints)) {
    test(`navigation at ${name} breakpoint`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto('/');

      const nav = page.getByRole('navigation');
      await expect(nav).toHaveScreenshot(`nav-${name}.png`);
    });
  }
});
```

---

## Handling Dynamic Content

### Masking Dynamic Elements

```typescript
test('page with dynamic content', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveScreenshot('dashboard.png', {
    mask: [
      // Mask timestamps
      page.locator('[data-testid="timestamp"]'),
      // Mask user-specific data
      page.locator('[data-testid="user-name"]'),
      // Mask random images
      page.locator('img[src*="avatar"]'),
      // Mask charts with live data
      page.locator('[data-testid="live-chart"]'),
    ],
  });
});
```

### Waiting for Stability

```typescript
test('page with lazy loaded content', async ({ page }) => {
  await page.goto('/products');

  // Wait for images to load
  await page.waitForFunction(() => {
    const images = document.querySelectorAll('img');
    return Array.from(images).every(img => img.complete);
  });

  // Wait for animations to complete
  await page.waitForTimeout(500); // Allow CSS animations to settle

  await expect(page).toHaveScreenshot('products-loaded.png', {
    fullPage: true,
  });
});
```

### Freezing Animations

```typescript
test('page with animations', async ({ page }) => {
  await page.goto('/');

  // Disable all animations and transitions
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });

  await expect(page).toHaveScreenshot('homepage-no-animations.png');
});
```

### Handling Date/Time

```typescript
test('page with dates', async ({ page }) => {
  // Mock the date to ensure consistent screenshots
  await page.addInitScript(() => {
    const fixedDate = new Date('2026-01-15T10:00:00Z');
    Date.now = () => fixedDate.getTime();
  });

  await page.goto('/dashboard');

  await expect(page).toHaveScreenshot('dashboard-fixed-date.png');
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/visual-tests.yml
name: Visual Regression Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run visual tests
        run: npx playwright test --project=chromium

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-test-results
          path: |
            test-results/
            playwright-report/
```

### Updating Snapshots

```bash
# Update all snapshots
npx playwright test --update-snapshots

# Update snapshots for specific test
npx playwright test homepage.spec.ts --update-snapshots

# Update snapshots in CI (via env variable)
UPDATE_SNAPSHOTS=1 npx playwright test
```

### Snapshot Storage

```typescript
// playwright.config.ts
export default defineConfig({
  snapshotDir: './snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{arg}{ext}',
});
```

---

## Best Practices

### 1. Organize Screenshots by Feature

```
snapshots/
├── auth/
│   ├── login-page.png
│   ├── register-page.png
│   └── forgot-password.png
├── products/
│   ├── catalog-desktop.png
│   ├── catalog-mobile.png
│   └── product-details.png
└── checkout/
    ├── cart.png
    ├── shipping.png
    └── payment.png
```

### 2. Use Descriptive Screenshot Names

```typescript
// Good - Descriptive names
await expect(page).toHaveScreenshot('checkout-cart-with-items.png');
await expect(page).toHaveScreenshot('checkout-cart-empty-state.png');
await expect(page).toHaveScreenshot('product-card-out-of-stock.png');

// Bad - Generic names
await expect(page).toHaveScreenshot('screenshot1.png');
await expect(page).toHaveScreenshot('page.png');
```

### 3. Test Meaningful States

```typescript
test.describe('Product Card Visual States', () => {
  test('in stock state', async ({ page }) => {
    await page.goto('/products/in-stock-item');
    await expect(page.getByTestId('product-card')).toHaveScreenshot('product-in-stock.png');
  });

  test('out of stock state', async ({ page }) => {
    await page.goto('/products/out-of-stock-item');
    await expect(page.getByTestId('product-card')).toHaveScreenshot('product-out-of-stock.png');
  });

  test('on sale state', async ({ page }) => {
    await page.goto('/products/sale-item');
    await expect(page.getByTestId('product-card')).toHaveScreenshot('product-on-sale.png');
  });
});
```

### 4. Keep Snapshots in Version Control

```gitignore
# .gitignore
# Ignore test results, but keep snapshots
test-results/
playwright-report/

# Keep snapshots in version control
# !snapshots/
```

### 5. Review Snapshot Changes Carefully

```typescript
// Add comments explaining what should be in the screenshot
test('checkout summary', async ({ page }) => {
  await page.goto('/checkout');

  // Expected: Order summary with item list, subtotal, tax, and total
  // Should include: Shipping address form, payment method selection
  await expect(page).toHaveScreenshot('checkout-summary.png', {
    fullPage: true,
  });
});
```

---

## Quick Reference

### Screenshot Methods

```typescript
// Full page
await expect(page).toHaveScreenshot('name.png', { fullPage: true });

// Viewport only
await expect(page).toHaveScreenshot('name.png');

// Specific element
await expect(locator).toHaveScreenshot('name.png');

// With options
await expect(page).toHaveScreenshot('name.png', {
  maxDiffPixels: 100,
  threshold: 0.2,
  animations: 'disabled',
  mask: [locator1, locator2],
});
```

### Update Commands

```bash
# Update all snapshots
npx playwright test --update-snapshots

# Update specific file
npx playwright test file.spec.ts --update-snapshots

# Interactive mode
npx playwright test --ui
```

---

## Related Resources

- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
- [Playwright Visual Comparisons Docs](https://playwright.dev/docs/test-snapshots)
