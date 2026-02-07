# Debugging & Troubleshooting Skill

Comprehensive guide to debugging Playwright tests — using Playwright Inspector, debug mode, trace viewer, video analysis, and systematic troubleshooting techniques.

## Core Principles

1. **Reproduce first** - Confirm the failure is consistent before debugging
2. **Use built-in tools** - Playwright has excellent debugging tools; use them
3. **Narrow the scope** - Isolate the failing step before investigating
4. **Capture evidence** - Screenshots, traces, and videos are your best friends
5. **Fix root causes** - Don't add workarounds without understanding the failure

## Table of Contents

- [Playwright Inspector](#playwright-inspector)
- [Debug Mode](#debug-mode)
- [Trace Viewer](#trace-viewer)
- [Video Recording & Analysis](#video-recording--analysis)
- [Screenshot Debugging](#screenshot-debugging)
- [Console & Network Debugging](#console--network-debugging)
- [Common Failure Patterns](#common-failure-patterns)
- [CI/CD Debugging](#cicd-debugging)
- [Debugging Selectors](#debugging-selectors)
- [Systematic Troubleshooting Checklist](#systematic-troubleshooting-checklist)

---

## Playwright Inspector

### Launching the Inspector

```bash
# Run a specific test with the inspector
npx playwright test tests/checkout.spec.ts --debug

# Run all tests in debug mode
npx playwright test --debug

# Debug a specific test by title
npx playwright test -g "should complete checkout" --debug
```

### Using the Inspector Effectively

```typescript
test('debug this test with inspector', async ({ page }) => {
  await page.goto('/products');

  // Add page.pause() to stop execution and open inspector
  await page.pause();

  // Inspector opens here - you can:
  // 1. Step through actions one at a time
  // 2. Inspect the page's DOM
  // 3. Try selectors in the Locator tab
  // 4. View the action log
  // 5. Resume or step over

  await page.getByRole('button', { name: 'Add to Cart' }).click();

  // Add another pause to inspect state after the click
  await page.pause();

  await expect(page.getByRole('alert')).toBeVisible();
});
```

### Inspector Tips

```typescript
// TIP 1: Use PWDEBUG environment variable
// PWDEBUG=1 npx playwright test
// This auto-opens inspector for ALL tests

// TIP 2: Use console mode in inspector
// PWDEBUG=console npx playwright test
// Opens browser DevTools console with Playwright helpers

// TIP 3: Pick locators interactively
// In the Inspector, click "Pick locator" then click any element
// on the page to get the recommended selector
```

---

## Debug Mode

### Headed Mode for Debugging

```bash
# Run tests in headed mode (see the browser)
npx playwright test --headed

# Slow down actions for visual debugging
npx playwright test --headed --slow-mo=500

# Combine with specific test
npx playwright test tests/login.spec.ts --headed --slow-mo=1000
```

### Debug Configuration in Code

```typescript
// playwright.config.ts - Debug-friendly config
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // Slow down actions by 200ms (useful for visual debugging)
    launchOptions: {
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    },

    // Keep browser open after test failure
    headless: process.env.HEADED ? false : true,
  },
});
```

### Debugging a Single Test

```typescript
// Temporarily focus on one test for debugging
test.only('debug: should add item to cart', async ({ page }) => {
  // Set a longer timeout while debugging
  test.setTimeout(0); // No timeout during debugging

  await page.goto('/products');

  // Log page URL for verification
  console.log('Current URL:', page.url());

  // Take a screenshot at a specific point
  await page.screenshot({ path: 'debug-screenshot.png' });

  await page.getByRole('button', { name: 'Add to Cart' }).click();

  // Check what's on the page
  const content = await page.textContent('body');
  console.log('Page contains:', content?.substring(0, 500));
});

// IMPORTANT: Remove test.only before committing!
```

---

## Trace Viewer

### Configuring Trace Collection

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // ✅ Recommended: Record trace on first retry
    trace: 'on-first-retry',

    // Other options:
    // trace: 'on'          - Always record (slower, more storage)
    // trace: 'off'         - Never record
    // trace: 'retain-on-failure' - Keep only for failures
  },
});
```

### Viewing Traces

```bash
# Open the trace viewer with a trace file
npx playwright show-trace test-results/checkout-should-complete/trace.zip

# Open trace from HTML report
npx playwright show-report
# Then click on a failed test → "Traces" tab
```

### What the Trace Viewer Shows

```typescript
// The trace viewer provides:
// 1. Timeline    - Visual timeline of all test actions
// 2. Actions     - Each step with before/after screenshots
// 3. Metadata    - Test name, duration, status
// 4. Source      - The test source code with current line highlighted
// 5. Network     - All network requests and responses
// 6. Console     - Browser console output
// 7. DOM         - Snapshot of DOM at each step
// 8. Call        - Detailed info about each Playwright call

// You can:
// - Click any action to see the page state
// - Filter network requests
// - Search the DOM snapshot
// - View request/response bodies
```

### Programmatic Trace Control

```typescript
test('trace specific operations', async ({ page, context }) => {
  // Start tracing for a specific section
  await context.tracing.start({ screenshots: true, snapshots: true });

  await page.goto('/checkout');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByRole('button', { name: 'Place Order' }).click();

  // Stop and save trace
  await context.tracing.stop({ path: 'traces/checkout-trace.zip' });
});
```

---

## Video Recording & Analysis

### Configuring Video Recording

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // ✅ Record video only on failure (recommended)
    video: 'on-first-retry',

    // Video size configuration
    video: {
      mode: 'on-first-retry',
      size: { width: 1280, height: 720 },
    },
  },
});
```

### Accessing Recorded Videos

```typescript
test('video will be saved on failure', async ({ page }, testInfo) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).click();

  // After test completes, video is available at:
  // test-results/<test-name>/video.webm

  // You can also access video path programmatically
  const video = page.video();
  if (video) {
    const path = await video.path();
    console.log('Video saved at:', path);

    // Attach video to test report
    await testInfo.attach('test-video', {
      path: path,
      contentType: 'video/webm',
    });
  }
});
```

### When to Use Video vs Trace

```typescript
// Use VIDEO when:
// - You need to see the full visual flow
// - Animations or transitions are involved
// - You want to share with non-technical stakeholders
// - CI/CD failure investigation

// Use TRACE when:
// - You need to inspect DOM state at each step
// - You need network request/response details
// - You need console output
// - You need step-by-step debugging
// - Trace is more detailed but larger files

// ✅ Best practice: Use both on first retry
// video: 'on-first-retry',
// trace: 'on-first-retry',
```

---

## Screenshot Debugging

### Strategic Screenshot Placement

```typescript
test('debug with screenshots', async ({ page }, testInfo) => {
  await page.goto('/checkout');

  // Capture state at key points
  await page.screenshot({
    path: 'debug/step-1-page-loaded.png',
    fullPage: true,
  });

  await page.getByLabel('Email').fill('user@example.com');

  // Capture after form fill
  await page.screenshot({
    path: 'debug/step-2-form-filled.png',
  });

  await page.getByRole('button', { name: 'Submit' }).click();

  // Capture result
  await page.screenshot({
    path: 'debug/step-3-after-submit.png',
    fullPage: true,
  });

  // Attach to report for easy access
  await testInfo.attach('after-submit', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
});
```

### Element-Specific Screenshots

```typescript
test('capture specific element state', async ({ page }) => {
  await page.goto('/dashboard');

  // Screenshot just the problematic component
  const widget = page.getByTestId('revenue-widget');
  await widget.screenshot({ path: 'debug/revenue-widget.png' });

  // Screenshot with element highlighted
  await page.evaluate(() => {
    const el = document.querySelector('[data-testid="revenue-widget"]');
    if (el) {
      (el as HTMLElement).style.border = '3px solid red';
    }
  });
  await page.screenshot({ path: 'debug/highlighted-widget.png' });
});
```

---

## Console & Network Debugging

### Capturing Console Output

```typescript
test('monitor console for errors', async ({ page }) => {
  const consoleMessages: string[] = [];
  const consoleErrors: string[] = [];

  // Capture all console messages
  page.on('console', (msg) => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  // Capture uncaught exceptions
  page.on('pageerror', (error) => {
    consoleErrors.push(`[uncaught] ${error.message}`);
  });

  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Load Data' }).click();

  // Assert no unexpected console errors
  const unexpectedErrors = consoleErrors.filter(
    (err) => !err.includes('Expected warning') // Filter known warnings
  );
  expect(unexpectedErrors, `Unexpected console errors: ${unexpectedErrors.join('\n')}`).toHaveLength(0);
});
```

### Monitoring Network Requests

```typescript
test('debug API calls', async ({ page }) => {
  const apiCalls: Array<{ method: string; url: string; status: number }> = [];

  // Log all API responses
  page.on('response', (response) => {
    if (response.url().includes('/api/')) {
      apiCalls.push({
        method: response.request().method(),
        url: response.url(),
        status: response.status(),
      });
    }
  });

  // Log failed requests
  page.on('requestfailed', (request) => {
    console.error(`Request failed: ${request.method()} ${request.url()}`);
    console.error(`Reason: ${request.failure()?.errorText}`);
  });

  await page.goto('/products');

  // Verify expected API calls were made
  console.log('API calls made:', JSON.stringify(apiCalls, null, 2));
  expect(apiCalls.some((call) => call.url.includes('/api/products'))).toBeTruthy();
});
```

### Waiting for Specific Network Requests

```typescript
test('wait for API before asserting', async ({ page }) => {
  await page.goto('/dashboard');

  // ✅ Good - Wait for specific API response before asserting
  const [response] = await Promise.all([
    page.waitForResponse('**/api/analytics'),
    page.getByRole('button', { name: 'Refresh' }).click(),
  ]);

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.totalRevenue).toBeGreaterThan(0);
});
```

---

## Common Failure Patterns

### Pattern 1: Element Not Found

```typescript
// SYMPTOM: "Timeout waiting for selector"
// CAUSE: Selector doesn't match any element

// Debugging steps:
test('debug element not found', async ({ page }) => {
  await page.goto('/products');

  // Step 1: Check if page loaded correctly
  console.log('Page URL:', page.url());
  console.log('Page title:', await page.title());

  // Step 2: Check if element exists at all
  const count = await page.getByRole('button', { name: 'Add to Cart' }).count();
  console.log('Matching elements:', count);

  // Step 3: Check what's actually on the page
  const buttons = await page.getByRole('button').allTextContents();
  console.log('All buttons:', buttons);

  // Step 4: Try a broader selector
  const allText = await page.textContent('body');
  console.log('Page text includes "Add":', allText?.includes('Add'));
});
```

### Pattern 2: Timing / Race Condition

```typescript
// SYMPTOM: Test passes locally but fails in CI
// CAUSE: Race condition between UI update and assertion

// ✅ Fix: Use proper Playwright waiting
test('fix race condition', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).click();

  // ✅ Wait for the specific response that triggers UI update
  await page.waitForResponse('**/api/cart');

  // ✅ Then assert with auto-waiting
  await expect(page.getByRole('alert')).toHaveText('Added to cart');
});
```

### Pattern 3: Stale Element

```typescript
// SYMPTOM: "Element is not attached to the DOM"
// CAUSE: Page re-rendered and element reference is stale

// ✅ Fix: Use locators (not element handles)
test('avoid stale element', async ({ page }) => {
  await page.goto('/products');

  // ✅ Locators always re-query the DOM
  const addButton = page.getByRole('button', { name: 'Add to Cart' });
  await addButton.click(); // Always finds the latest element

  // ❌ Element handles can become stale
  // const handle = await page.$('button.add-to-cart');
  // await handle.click(); // May fail if DOM re-rendered
});
```

### Pattern 4: Navigation Not Complete

```typescript
// SYMPTOM: "Target page, context or browser has been closed"
// CAUSE: Navigation triggered but test didn't wait for it

// ✅ Fix: Wait for navigation explicitly
test('handle navigation', async ({ page }) => {
  await page.goto('/login');

  // ✅ Wait for navigation triggered by form submit
  await Promise.all([
    page.waitForURL('**/dashboard'),
    page.getByRole('button', { name: 'Login' }).click(),
  ]);

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

---

## CI/CD Debugging

### Getting Debug Info from CI

```typescript
// playwright.config.ts - CI-specific configuration
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,

  use: {
    // Capture artifacts on failure in CI
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },

  // Output directory for artifacts
  outputDir: 'test-results/',

  // HTML report
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],
});
```

### CI Debugging Commands

```bash
# Download CI artifacts and view the HTML report
npx playwright show-report path/to/downloaded/report

# View trace from CI artifacts
npx playwright show-trace path/to/trace.zip

# Run specific failing test locally with CI-like settings
CI=true npx playwright test tests/failing-test.spec.ts --retries=0 --headed
```

### Comparing Local vs CI

```typescript
// Add environment info to test output for comparison
test.beforeAll(async () => {
  console.log('Environment:', {
    ci: process.env.CI,
    os: process.platform,
    nodeVersion: process.version,
    pwVersion: require('@playwright/test/package.json').version,
  });
});
```

---

## Debugging Selectors

### Testing Selectors Interactively

```bash
# Open a browser to test selectors
npx playwright open https://your-app.com

# Use the Locator picker in the toolbar to find selectors
# Type selectors in the console to test them:
# > page.getByRole('button', { name: 'Submit' })
# > page.getByLabel('Email')
```

### Selector Debugging in Code

```typescript
test('debug selectors', async ({ page }) => {
  await page.goto('/products');

  // List all role-based matches
  const buttons = page.getByRole('button');
  console.log('Total buttons:', await buttons.count());

  for (let i = 0; i < await buttons.count(); i++) {
    console.log(`Button ${i}:`, await buttons.nth(i).textContent());
  }

  // Check if element is hidden vs missing
  const submitBtn = page.getByRole('button', { name: 'Submit' });
  const isVisible = await submitBtn.isVisible();
  const count = await submitBtn.count();
  console.log(`Submit button - count: ${count}, visible: ${isVisible}`);

  // Use evaluate to inspect element properties
  const element = page.getByTestId('product-card');
  if (await element.count() > 0) {
    const classes = await element.first().getAttribute('class');
    console.log('Element classes:', classes);
  }
});
```

### Playwright Codegen for Selectors

```bash
# Generate test code by interacting with the app
npx playwright codegen https://your-app.com

# Codegen will:
# 1. Open a browser with your app
# 2. Record your interactions
# 3. Generate Playwright test code with recommended selectors
# 4. You can copy selectors directly into your tests
```

---

## Systematic Troubleshooting Checklist

### Step-by-Step Debugging Process

1. **Reproduce the failure**
   - [ ] Run the failing test in isolation
   - [ ] Run it multiple times (is it flaky?)
   - [ ] Run in headed mode: `npx playwright test --headed`

2. **Gather evidence**
   - [ ] Check screenshots in `test-results/`
   - [ ] View trace: `npx playwright show-trace <trace.zip>`
   - [ ] Check video recording
   - [ ] Review console output

3. **Narrow the scope**
   - [ ] Add `page.pause()` before the failing step
   - [ ] Use Playwright Inspector to step through
   - [ ] Check the selector matches elements
   - [ ] Verify the page state is correct

4. **Identify root cause**
   - [ ] Is it a selector issue? (element not found)
   - [ ] Is it a timing issue? (race condition)
   - [ ] Is it a data issue? (missing test data)
   - [ ] Is it an environment issue? (CI vs local)
   - [ ] Is it a dependency issue? (test order dependent)

5. **Apply the fix**
   - [ ] Fix the root cause (not a workaround)
   - [ ] Add a descriptive error message
   - [ ] Verify the fix works in CI
   - [ ] Remove any `test.only`, `page.pause()`, or `console.log`

### Quick Reference Commands

```bash
# Debug a specific test
npx playwright test tests/my-test.spec.ts --debug

# Run headed with slow motion
npx playwright test --headed --slow-mo=500

# Generate test with codegen
npx playwright codegen http://localhost:3000

# View HTML report
npx playwright show-report

# View trace file
npx playwright show-trace test-results/trace.zip

# Run with full trace
npx playwright test --trace on

# List available tests
npx playwright test --list
```

## Related Resources

- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
- [Error Handling](../error-handling/SKILL.md)
- [Selector Strategies](../selector-strategies/SKILL.md)
- [Troubleshooting Guide](../../docs/TROUBLESHOOTING.md)
- [Playwright Docs: Debugging](https://playwright.dev/docs/debug)
- [Playwright Docs: Trace Viewer](https://playwright.dev/docs/trace-viewer)
