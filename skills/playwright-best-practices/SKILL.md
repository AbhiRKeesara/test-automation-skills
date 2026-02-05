# Playwright Best Practices Skill

This skill contains comprehensive best practices for writing maintainable, reliable Playwright tests with TypeScript.

## Core Principles

1. **Tests should be reliable** - No flaky tests
2. **Tests should be fast** - Parallel execution, efficient waits
3. **Tests should be maintainable** - Clear structure, reusable code
4. **Tests should be readable** - Self-documenting, clear intent
5. **Tests should be isolated** - No dependencies between tests

## Table of Contents

- [Test Structure](#test-structure)
- [Selectors](#selectors)
- [Waits and Timing](#waits-and-timing)
- [Assertions](#assertions)
- [Page Objects](#page-objects)
- [Fixtures](#fixtures)
- [Test Organization](#test-organization)
- [Error Handling](#error-handling)
- [Common Anti-Patterns](#common-anti-patterns)

---

## Test Structure

### ✅ Good Practice

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';

test.describe('User Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await loginPage.login('user@example.com', 'SecurePass123');
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await loginPage.login('user@example.com', 'WrongPassword');
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Invalid credentials');
  });
});
```

### ❌ Bad Practice

```typescript
// Vague test name, no page object, poor structure
test('test 1', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.waitForTimeout(2000); // Hard-coded wait
  await page.locator('#user').fill('user@example.com'); // CSS selector
  await page.locator('#pass').type('password');
  await page.locator('button').click(); // Ambiguous selector
  await page.waitForTimeout(3000); // Another hard-coded wait
});
```

**Why the good practice is better:**
- ✅ Descriptive test names explain what's being tested
- ✅ Uses page objects for reusability
- ✅ Proper assertions verify expected outcomes
- ✅ No hard-coded waits
- ✅ Tests are grouped logically in `describe` blocks

---

## Selectors

### Priority Order (Use in this order)

1. **getByRole** - Accessibility-first, semantic
2. **getByLabel** - Form elements with labels
3. **getByPlaceholder** - Form elements with placeholders
4. **getByText** - Text content (use sparingly)
5. **getByTestId** - Last resort for complex elements

### ✅ Good Practice

```typescript
// 1. Best - Role-based (accessible)
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
await page.getByRole('heading', { name: 'Dashboard' }).waitFor();

// 2. Good - Label-based (forms)
await page.getByLabel('Password').fill('SecurePass123');
await page.getByLabel('Remember me').check();

// 3. Acceptable - Placeholder (when no label)
await page.getByPlaceholder('Enter your email').fill('user@example.com');

// 4. Last resort - Test ID (for complex elements)
await page.getByTestId('prescription-card-123').click();
```

### ❌ Bad Practice

```typescript
// CSS selectors - brittle, not accessible
await page.locator('#submit-btn').click();
await page.locator('.form-input[name="email"]').fill('user@example.com');
await page.locator('div > div > button:nth-child(2)').click();

// XPath - even worse
await page.locator('//div[@class="container"]/button[1]').click();

// Ambiguous selectors
await page.locator('button').click(); // Which button?
await page.locator('input').fill('text'); // Which input?
```

**Why the good practice is better:**
- ✅ Accessible selectors work with screen readers
- ✅ Resilient to CSS/structure changes
- ✅ Self-documenting (you know what element you're targeting)
- ✅ Follows web accessibility standards

### Selector Patterns

```typescript
// ✅ Chaining for specificity
await page
  .getByRole('main')
  .getByRole('button', { name: 'Add to Cart' })
  .click();

// ✅ Filter for dynamic lists
await page
  .getByRole('listitem')
  .filter({ hasText: 'Prescription #123' })
  .getByRole('button', { name: 'Refill' })
  .click();

// ✅ Nth element (when necessary)
const firstPrescription = page.getByRole('article').first();
const lastPrescription = page.getByRole('article').last();
const thirdPrescription = page.getByRole('article').nth(2);
```

---

## Waits and Timing

### ✅ Good Practice

```typescript
// Auto-waiting (preferred) - Playwright waits automatically
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByText('Success')).toBeVisible();

// Explicit wait for specific conditions
await page.getByRole('progressbar').waitFor({ state: 'hidden' });
await page.getByRole('alert').waitFor({ state: 'visible', timeout: 10000 });

// Wait for network to be idle (for SPAs)
await page.waitForLoadState('networkidle');

// Wait for specific response
await page.waitForResponse(resp => 
  resp.url().includes('/api/prescriptions') && resp.status() === 200
);
```

### ❌ Bad Practice

```typescript
// Hard-coded timeouts
await page.waitForTimeout(2000); // Never use this
await page.waitForTimeout(5000); // Seriously, don't

// Arbitrary waits
await page.click('button');
await new Promise(resolve => setTimeout(resolve, 3000)); // NO!
```

**Why the good practice is better:**
- ✅ Playwright has built-in auto-waiting
- ✅ Tests run as fast as possible
- ✅ No unnecessary delays
- ✅ Clear intent (waiting for what?)

---

## Assertions

### ✅ Good Practice

```typescript
// Visibility assertions
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
await expect(page.getByRole('alert')).toBeHidden();

// Text assertions
await expect(page.getByRole('status')).toHaveText('Order confirmed');
await expect(page.getByRole('heading')).toContainText('Welcome');

// URL assertions
await expect(page).toHaveURL(/.*dashboard/);
await expect(page).toHaveURL('https://example.com/prescriptions');

// Attribute assertions
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
await expect(page.getByRole('button', { name: 'Delete' })).toBeDisabled();
await expect(page.getByRole('checkbox')).toBeChecked();

// Count assertions
await expect(page.getByRole('listitem')).toHaveCount(5);

// Accessibility assertions
await expect(page.getByRole('img', { name: 'Logo' })).toHaveAttribute('alt', 'Company Logo');
```

### ❌ Bad Practice

```typescript
// No assertions
await page.click('button');
// What happened? Did it work?

// Weak assertions
const text = await page.locator('.message').textContent();
expect(text).toBe('Success'); // Not using Playwright's assertions

// Checking existence instead of visibility
const button = await page.$('button');
expect(button).not.toBeNull(); // Element might exist but be hidden
```

**Why the good practice is better:**
- ✅ Auto-retrying assertions (handles timing issues)
- ✅ Clear, readable intent
- ✅ Better error messages
- ✅ Verifies actual user-visible behavior

---

## Page Objects

### ✅ Good Practice

```typescript
// page-objects/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign In' });
    this.errorMessage = page.getByRole('alert');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginWithEnter(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.passwordInput.press('Enter');
  }

  async getErrorText(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }
}
```

### Using the Page Object

```typescript
// tests/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';

test('successful login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.navigate();
  await loginPage.login('user@example.com', 'SecurePass123');
  
  await expect(page).toHaveURL(/.*dashboard/);
});
```

### ❌ Bad Practice

```typescript
// No page object - duplicated selectors everywhere
test('login test 1', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('user@example.com');
  await page.locator('#password').fill('pass');
  await page.locator('button').click();
});

test('login test 2', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('other@example.com'); // Duplicated!
  await page.locator('#password').fill('pass');
  await page.locator('button').click();
});
```

**Why the good practice is better:**
- ✅ Single source of truth for selectors
- ✅ Reusable across tests
- ✅ Easy to maintain (change in one place)
- ✅ Type-safe with TypeScript
- ✅ Encapsulates page-specific logic

---

## Fixtures

### ✅ Good Practice

```typescript
// fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';

type AuthFixtures = {
  loginPage: LoginPage;
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  authenticatedPage: async ({ page }, use) => {
    // Auto-login for tests that need authenticated state
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('user@example.com', 'SecurePass123');
    await page.waitForURL(/.*dashboard/);
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

### Using Fixtures

```typescript
import { test, expect } from '../fixtures/auth.fixture';

test('user can view prescriptions', async ({ authenticatedPage }) => {
  // Already logged in!
  await authenticatedPage.getByRole('link', { name: 'Prescriptions' }).click();
  await expect(authenticatedPage).toHaveURL(/.*prescriptions/);
});
```

**Benefits:**
- ✅ Shared setup/teardown logic
- ✅ Better test isolation
- ✅ Composable and reusable
- ✅ Automatic cleanup

---

## Test Organization

### ✅ Good Practice

```
tests/
├── auth/
│   ├── login.spec.ts
│   ├── logout.spec.ts
│   ├── password-reset.spec.ts
│   └── registration.spec.ts
├── pharmacy/
│   ├── prescription-flow/
│   │   ├── create-prescription.spec.ts
│   │   ├── refill-prescription.spec.ts
│   │   └── cancel-prescription.spec.ts
│   └── medication-search.spec.ts
├── patient-portal/
│   ├── appointments.spec.ts
│   └── medical-records.spec.ts
└── billing/
    ├── payment-methods.spec.ts
    └── invoices.spec.ts
```

### File Naming

- ✅ `feature-name.spec.ts` - Descriptive, lowercase with dashes
- ❌ `test1.ts` - Not descriptive
- ❌ `TestLoginFeature.spec.ts` - Not using kebab-case

### Test Naming

```typescript
// ✅ Good - Descriptive, follows pattern
test('should display error when email is invalid', async ({ page }) => {});
test('should allow user to refill prescription with one click', async ({ page }) => {});

// ❌ Bad - Not descriptive
test('test1', async ({ page }) => {});
test('it works', async ({ page }) => {});
```

---

## Error Handling

### ✅ Good Practice

```typescript
test('should handle network errors gracefully', async ({ page }) => {
  // Simulate network failure
  await page.route('**/api/prescriptions', route => route.abort());
  
  await page.getByRole('button', { name: 'Load Prescriptions' }).click();
  
  await expect(page.getByRole('alert')).toHaveText(
    'Unable to load prescriptions. Please try again.'
  );
});

test('should retry failed API calls', async ({ page }) => {
  let attemptCount = 0;
  
  await page.route('**/api/data', route => {
    attemptCount++;
    if (attemptCount < 3) {
      route.abort();
    } else {
      route.continue();
    }
  });
  
  // Test should succeed after retries
  await page.goto('/dashboard');
  await expect(page.getByRole('main')).toBeVisible();
});
```

---

## Common Anti-Patterns

### ❌ Anti-Pattern 1: Hard-Coded Waits

```typescript
await page.click('button');
await page.waitForTimeout(5000); // DON'T DO THIS
```

**Fix:** Use auto-waiting or explicit waits
```typescript
await page.getByRole('button').click();
await expect(page.getByText('Success')).toBeVisible();
```

---

### ❌ Anti-Pattern 2: Brittle CSS Selectors

```typescript
await page.locator('div.container > div:nth-child(3) > button').click();
```

**Fix:** Use accessible selectors
```typescript
await page.getByRole('button', { name: 'Submit' }).click();
```

---

### ❌ Anti-Pattern 3: No Page Objects

```typescript
// Selectors duplicated in every test
test('test1', async ({ page }) => {
  await page.locator('#email').fill('test@example.com');
  await page.locator('#password').fill('pass');
});

test('test2', async ({ page }) => {
  await page.locator('#email').fill('other@example.com');
  await page.locator('#password').fill('pass');
});
```

**Fix:** Create page objects
```typescript
const loginPage = new LoginPage(page);
await loginPage.login('test@example.com', 'pass');
```

---

### ❌ Anti-Pattern 4: Tests Depend on Each Other

```typescript
let userId: string;

test('create user', async ({ request }) => {
  const response = await request.post('/users', { data: {...} });
  userId = (await response.json()).id; // Stored for next test
});

test('update user', async ({ request }) => {
  await request.patch(`/users/${userId}`, { data: {...} }); // Depends on previous test
});
```

**Fix:** Each test should be independent
```typescript
test('update user', async ({ request }) => {
  // Create user in this test
  const createResponse = await request.post('/users', { data: {...} });
  const userId = (await createResponse.json()).id;
  
  // Now update it
  await request.patch(`/users/${userId}`, { data: {...} });
});
```

---

### ❌ Anti-Pattern 5: Testing Implementation Details

```typescript
test('state is set correctly', async ({ page }) => {
  await page.evaluate(() => {
    // Checking internal state - BAD
    return window.__app__.state.isLoggedIn === true;
  });
});
```

**Fix:** Test user-visible behavior
```typescript
test('user sees dashboard after login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('user@example.com', 'pass');
  
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

---

## Quick Reference Checklist

Before committing a test, verify:

- [ ] Test name clearly describes what's being tested
- [ ] Uses accessible selectors (getByRole, getByLabel)
- [ ] No hard-coded `waitForTimeout`
- [ ] Includes proper assertions
- [ ] Uses page objects for reusable code
- [ ] Test is isolated (doesn't depend on other tests)
- [ ] Error cases are handled
- [ ] Test is in the correct folder (organized by domain)
- [ ] TypeScript types are properly defined
- [ ] Comments explain business logic (not implementation)

---

## Related Resources

- [Selector Strategies Skill](../selector-strategies/SKILL.md)
- [Code Organization Skill](../code-organization/SKILL.md)
- [Migration Patterns Skill](../migration-patterns/SKILL.md)
- [Official Playwright Docs](https://playwright.dev/docs/best-practices)
