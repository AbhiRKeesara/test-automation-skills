---
name: assertion-utilities
description: >
  AssertUtils and ExpectUtils patterns for centralized test validation in Playwright. Use when implementing reusable assertions, soft assertions, or building a consistent validation layer across your test suite.
---

# Assertion Utilities Skill

A comprehensive guide to implementing centralized assertion utilities (AssertUtils & ExpectUtils) in Playwright for consistent, reusable, and maintainable test validation.

## Why Centralized Assertions?

As test suites grow, scattered and inconsistent assertions become a maintenance nightmare:

| Problem | Solution with Assertion Utilities |
|---------|----------------------------------|
| Inconsistent assertion messages | Standardized, descriptive error messages |
| Duplicate assertion logic | Reusable assertion methods |
| No soft assertion support | Built-in soft assertion mode |
| Hard to add custom validations | Extensible assertion classes |
| Mixed assertion styles | Unified API for all validations |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Test Files                          │
│              (use AssertUtils & ExpectUtils)             │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌─────────────────────┐   ┌─────────────────────┐
│    AssertUtils      │   │    ExpectUtils       │
│  (Value-based)      │   │  (DOM-based)         │
│                     │   │                       │
│ • String equality   │   │ • Element visible    │
│ • Number comparison │   │ • Text content       │
│ • Array contains    │   │ • URL matching       │
│ • Object matching   │   │ • Attribute values   │
│ • Type checking     │   │ • Element state      │
└─────────────────────┘   └─────────────────────┘
          │                       │
          └───────────┬───────────┘
                      ▼
          ┌─────────────────────┐
          │  SoftAssertContext  │
          │  (Fail-later mode)  │
          └─────────────────────┘
```

## Implementation

### 1. AssertUtils - Value-Based Assertions

```typescript
// assertions/AssertUtils.ts

/**
 * AssertUtils - Generic value-based assertions
 *
 * Use for non-DOM validations:
 * - String comparisons
 * - Number validations
 * - Array/Object checks
 * - API response validations
 */
export class AssertUtils {
  private softMode: boolean = false;
  private softErrors: Error[] = [];

  /**
   * Enable soft assertion mode
   * In soft mode, failures are collected but don't stop the test
   */
  enableSoftMode(): void {
    this.softMode = true;
    this.softErrors = [];
  }

  /**
   * Disable soft assertion mode and throw if there are errors
   */
  disableSoftModeAndValidate(): void {
    this.softMode = false;
    if (this.softErrors.length > 0) {
      const messages = this.softErrors.map((e, i) => `${i + 1}. ${e.message}`).join('\n');
      this.softErrors = [];
      throw new Error(`Soft assertions failed:\n${messages}`);
    }
  }

  /**
   * Get all soft assertion errors
   */
  getSoftErrors(): Error[] {
    return [...this.softErrors];
  }

  /**
   * Handle assertion failure
   */
  private handleFailure(message: string): void {
    const error = new Error(message);
    if (this.softMode) {
      this.softErrors.push(error);
      console.warn(`[Soft Assertion Failed] ${message}`);
    } else {
      throw error;
    }
  }

  // ==================== Equality Assertions ====================

  /**
   * Assert two values are equal
   */
  assertEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      this.handleFailure(
        message ?? `Expected "${expected}" but got "${actual}"`
      );
    }
  }

  /**
   * Assert two values are NOT equal
   */
  assertNotEqual<T>(actual: T, notExpected: T, message?: string): void {
    if (actual === notExpected) {
      this.handleFailure(
        message ?? `Expected value to NOT be "${notExpected}"`
      );
    }
  }

  /**
   * Assert values are strictly equal (===)
   */
  assertStrictEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      this.handleFailure(
        message ?? `Expected strict equality: "${expected}" === "${actual}"`
      );
    }
  }

  /**
   * Assert objects are deeply equal
   */
  assertDeepEqual<T>(actual: T, expected: T, message?: string): void {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      this.handleFailure(
        message ?? `Objects not deeply equal.\nExpected: ${expectedStr}\nActual: ${actualStr}`
      );
    }
  }

  // ==================== Boolean Assertions ====================

  /**
   * Assert value is true
   */
  assertTrue(actual: boolean, message?: string): void {
    if (actual !== true) {
      this.handleFailure(message ?? `Expected true but got ${actual}`);
    }
  }

  /**
   * Assert value is false
   */
  assertFalse(actual: boolean, message?: string): void {
    if (actual !== false) {
      this.handleFailure(message ?? `Expected false but got ${actual}`);
    }
  }

  // ==================== Null/Undefined Assertions ====================

  /**
   * Assert value is null
   */
  assertNull(actual: unknown, message?: string): void {
    if (actual !== null) {
      this.handleFailure(message ?? `Expected null but got ${actual}`);
    }
  }

  /**
   * Assert value is not null
   */
  assertNotNull(actual: unknown, message?: string): void {
    if (actual === null) {
      this.handleFailure(message ?? `Expected value to NOT be null`);
    }
  }

  /**
   * Assert value is undefined
   */
  assertUndefined(actual: unknown, message?: string): void {
    if (actual !== undefined) {
      this.handleFailure(message ?? `Expected undefined but got ${actual}`);
    }
  }

  /**
   * Assert value is defined (not null and not undefined)
   */
  assertDefined(actual: unknown, message?: string): void {
    if (actual === null || actual === undefined) {
      this.handleFailure(message ?? `Expected value to be defined`);
    }
  }

  // ==================== Number Assertions ====================

  /**
   * Assert number is greater than expected
   */
  assertGreaterThan(actual: number, expected: number, message?: string): void {
    if (actual <= expected) {
      this.handleFailure(
        message ?? `Expected ${actual} to be greater than ${expected}`
      );
    }
  }

  /**
   * Assert number is greater than or equal to expected
   */
  assertGreaterThanOrEqual(actual: number, expected: number, message?: string): void {
    if (actual < expected) {
      this.handleFailure(
        message ?? `Expected ${actual} to be greater than or equal to ${expected}`
      );
    }
  }

  /**
   * Assert number is less than expected
   */
  assertLessThan(actual: number, expected: number, message?: string): void {
    if (actual >= expected) {
      this.handleFailure(
        message ?? `Expected ${actual} to be less than ${expected}`
      );
    }
  }

  /**
   * Assert number is less than or equal to expected
   */
  assertLessThanOrEqual(actual: number, expected: number, message?: string): void {
    if (actual > expected) {
      this.handleFailure(
        message ?? `Expected ${actual} to be less than or equal to ${expected}`
      );
    }
  }

  /**
   * Assert number is within range
   */
  assertInRange(actual: number, min: number, max: number, message?: string): void {
    if (actual < min || actual > max) {
      this.handleFailure(
        message ?? `Expected ${actual} to be between ${min} and ${max}`
      );
    }
  }

  /**
   * Assert number is approximately equal (with tolerance)
   */
  assertApproximately(actual: number, expected: number, tolerance: number, message?: string): void {
    if (Math.abs(actual - expected) > tolerance) {
      this.handleFailure(
        message ?? `Expected ${actual} to be approximately ${expected} (±${tolerance})`
      );
    }
  }

  // ==================== String Assertions ====================

  /**
   * Assert string contains substring
   */
  assertContains(actual: string, substring: string, message?: string): void {
    if (!actual.includes(substring)) {
      this.handleFailure(
        message ?? `Expected "${actual}" to contain "${substring}"`
      );
    }
  }

  /**
   * Assert string does NOT contain substring
   */
  assertNotContains(actual: string, substring: string, message?: string): void {
    if (actual.includes(substring)) {
      this.handleFailure(
        message ?? `Expected "${actual}" to NOT contain "${substring}"`
      );
    }
  }

  /**
   * Assert string starts with prefix
   */
  assertStartsWith(actual: string, prefix: string, message?: string): void {
    if (!actual.startsWith(prefix)) {
      this.handleFailure(
        message ?? `Expected "${actual}" to start with "${prefix}"`
      );
    }
  }

  /**
   * Assert string ends with suffix
   */
  assertEndsWith(actual: string, suffix: string, message?: string): void {
    if (!actual.endsWith(suffix)) {
      this.handleFailure(
        message ?? `Expected "${actual}" to end with "${suffix}"`
      );
    }
  }

  /**
   * Assert string matches regex pattern
   */
  assertMatches(actual: string, pattern: RegExp, message?: string): void {
    if (!pattern.test(actual)) {
      this.handleFailure(
        message ?? `Expected "${actual}" to match pattern ${pattern}`
      );
    }
  }

  /**
   * Assert string is empty
   */
  assertEmpty(actual: string, message?: string): void {
    if (actual !== '') {
      this.handleFailure(message ?? `Expected empty string but got "${actual}"`);
    }
  }

  /**
   * Assert string is not empty
   */
  assertNotEmpty(actual: string, message?: string): void {
    if (actual === '') {
      this.handleFailure(message ?? `Expected non-empty string`);
    }
  }

  /**
   * Assert strings are equal (case-insensitive)
   */
  assertEqualIgnoreCase(actual: string, expected: string, message?: string): void {
    if (actual.toLowerCase() !== expected.toLowerCase()) {
      this.handleFailure(
        message ?? `Expected "${actual}" to equal "${expected}" (case-insensitive)`
      );
    }
  }

  // ==================== Array Assertions ====================

  /**
   * Assert array contains element
   */
  assertArrayContains<T>(array: T[], element: T, message?: string): void {
    if (!array.includes(element)) {
      this.handleFailure(
        message ?? `Expected array to contain "${element}"`
      );
    }
  }

  /**
   * Assert array does NOT contain element
   */
  assertArrayNotContains<T>(array: T[], element: T, message?: string): void {
    if (array.includes(element)) {
      this.handleFailure(
        message ?? `Expected array to NOT contain "${element}"`
      );
    }
  }

  /**
   * Assert array has specific length
   */
  assertArrayLength<T>(array: T[], expectedLength: number, message?: string): void {
    if (array.length !== expectedLength) {
      this.handleFailure(
        message ?? `Expected array length ${expectedLength} but got ${array.length}`
      );
    }
  }

  /**
   * Assert array is empty
   */
  assertArrayEmpty<T>(array: T[], message?: string): void {
    if (array.length !== 0) {
      this.handleFailure(
        message ?? `Expected empty array but got ${array.length} elements`
      );
    }
  }

  /**
   * Assert array is not empty
   */
  assertArrayNotEmpty<T>(array: T[], message?: string): void {
    if (array.length === 0) {
      this.handleFailure(message ?? `Expected non-empty array`);
    }
  }

  /**
   * Assert arrays have same elements (order-independent)
   */
  assertArraysEqual<T>(actual: T[], expected: T[], message?: string): void {
    const sortedActual = [...actual].sort();
    const sortedExpected = [...expected].sort();
    if (JSON.stringify(sortedActual) !== JSON.stringify(sortedExpected)) {
      this.handleFailure(
        message ?? `Arrays are not equal.\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`
      );
    }
  }

  // ==================== Type Assertions ====================

  /**
   * Assert value is of specific type
   */
  assertType(actual: unknown, expectedType: string, message?: string): void {
    if (typeof actual !== expectedType) {
      this.handleFailure(
        message ?? `Expected type "${expectedType}" but got "${typeof actual}"`
      );
    }
  }

  /**
   * Assert value is instance of class
   */
  assertInstanceOf<T>(actual: unknown, expectedClass: new (...args: unknown[]) => T, message?: string): void {
    if (!(actual instanceof expectedClass)) {
      this.handleFailure(
        message ?? `Expected instance of ${expectedClass.name}`
      );
    }
  }
}
```

### 2. ExpectUtils - DOM-Based Assertions

```typescript
// assertions/ExpectUtils.ts
import { Page, Locator, expect } from '@playwright/test';

/**
 * ExpectUtils - DOM-based assertions using Playwright's expect
 *
 * Use for UI validations:
 * - Element visibility
 * - Text content
 * - Element attributes
 * - URL and title checks
 */
export class ExpectUtils {
  private page: Page;
  private softMode: boolean = false;
  private softErrors: Error[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Enable soft assertion mode
   */
  enableSoftMode(): void {
    this.softMode = true;
    this.softErrors = [];
  }

  /**
   * Disable soft assertion mode and throw if there are errors
   */
  disableSoftModeAndValidate(): void {
    this.softMode = false;
    if (this.softErrors.length > 0) {
      const messages = this.softErrors.map((e, i) => `${i + 1}. ${e.message}`).join('\n');
      this.softErrors = [];
      throw new Error(`Soft assertions failed:\n${messages}`);
    }
  }

  /**
   * Get all soft assertion errors
   */
  getSoftErrors(): Error[] {
    return [...this.softErrors];
  }

  /**
   * Handle assertion with soft mode support
   */
  private async handleAssertion(assertionFn: () => Promise<void>): Promise<void> {
    if (this.softMode) {
      try {
        await assertionFn();
      } catch (error) {
        this.softErrors.push(error as Error);
        console.warn(`[Soft Assertion Failed] ${(error as Error).message}`);
      }
    } else {
      await assertionFn();
    }
  }

  // ==================== Visibility Assertions ====================

  /**
   * Assert element is visible
   */
  async toBeVisible(locator: Locator, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toBeVisible();
    });
  }

  /**
   * Assert element is hidden
   */
  async toBeHidden(locator: Locator, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toBeHidden();
    });
  }

  /**
   * Assert element is attached to DOM
   */
  async toBeAttached(locator: Locator, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toBeAttached();
    });
  }

  /**
   * Assert element is detached from DOM
   */
  async toBeDetached(locator: Locator, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toBeAttached({ attached: false });
    });
  }

  // ==================== State Assertions ====================

  /**
   * Assert element is enabled
   */
  async toBeEnabled(locator: Locator, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toBeEnabled();
    });
  }

  /**
   * Assert element is disabled
   */
  async toBeDisabled(locator: Locator, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toBeDisabled();
    });
  }

  /**
   * Assert checkbox/radio is checked
   */
  async toBeChecked(locator: Locator, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toBeChecked();
    });
  }

  /**
   * Assert checkbox/radio is not checked
   */
  async toBeUnchecked(locator: Locator, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toBeChecked({ checked: false });
    });
  }

  /**
   * Assert element is focused
   */
  async toBeFocused(locator: Locator, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toBeFocused();
    });
  }

  /**
   * Assert element is editable
   */
  async toBeEditable(locator: Locator, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toBeEditable();
    });
  }

  // ==================== Text Assertions ====================

  /**
   * Assert element has exact text
   */
  async toHaveText(locator: Locator, text: string | RegExp, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toHaveText(text);
    });
  }

  /**
   * Assert element contains text
   */
  async toContainText(locator: Locator, text: string | RegExp, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toContainText(text);
    });
  }

  /**
   * Assert element has no text
   */
  async toBeEmpty(locator: Locator, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toBeEmpty();
    });
  }

  // ==================== Value Assertions ====================

  /**
   * Assert input has value
   */
  async toHaveValue(locator: Locator, value: string | RegExp, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toHaveValue(value);
    });
  }

  /**
   * Assert input has values (multi-select)
   */
  async toHaveValues(locator: Locator, values: string[], message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toHaveValues(values);
    });
  }

  // ==================== Attribute Assertions ====================

  /**
   * Assert element has attribute
   */
  async toHaveAttribute(
    locator: Locator,
    name: string,
    value?: string | RegExp,
    message?: string
  ): Promise<void> {
    await this.handleAssertion(async () => {
      if (value !== undefined) {
        await expect(locator, message).toHaveAttribute(name, value);
      } else {
        await expect(locator, message).toHaveAttribute(name);
      }
    });
  }

  /**
   * Assert element has class
   */
  async toHaveClass(locator: Locator, className: string | RegExp, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toHaveClass(className);
    });
  }

  /**
   * Assert element has CSS property
   */
  async toHaveCSS(
    locator: Locator,
    name: string,
    value: string | RegExp,
    message?: string
  ): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toHaveCSS(name, value);
    });
  }

  /**
   * Assert element has id
   */
  async toHaveId(locator: Locator, id: string | RegExp, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toHaveId(id);
    });
  }

  // ==================== Count Assertions ====================

  /**
   * Assert element count
   */
  async toHaveCount(locator: Locator, count: number, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator, message).toHaveCount(count);
    });
  }

  // ==================== Page Assertions ====================

  /**
   * Assert page has title
   */
  async toHaveTitle(title: string | RegExp, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(this.page, message).toHaveTitle(title);
    });
  }

  /**
   * Assert page has URL
   */
  async toHaveURL(url: string | RegExp, message?: string): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(this.page, message).toHaveURL(url);
    });
  }

  // ==================== Screenshot Assertions ====================

  /**
   * Assert element matches screenshot
   */
  async toMatchScreenshot(locator: Locator, name: string, options?: object): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(locator).toHaveScreenshot(name, options);
    });
  }

  /**
   * Assert page matches screenshot
   */
  async pageToMatchScreenshot(name: string, options?: object): Promise<void> {
    await this.handleAssertion(async () => {
      await expect(this.page).toHaveScreenshot(name, options);
    });
  }
}
```

### 3. Combined Assertions Class

```typescript
// assertions/Assertions.ts
import { Page } from '@playwright/test';
import { AssertUtils } from './AssertUtils';
import { ExpectUtils } from './ExpectUtils';

/**
 * Assertions - Unified assertion gateway
 *
 * Combines both value-based and DOM-based assertions
 * into a single, easy-to-use interface.
 */
export class Assertions {
  private _assert: AssertUtils;
  private _expect: ExpectUtils;

  constructor(page: Page) {
    this._assert = new AssertUtils();
    this._expect = new ExpectUtils(page);
  }

  /**
   * Value-based assertions (strings, numbers, arrays, objects)
   */
  assert(): AssertUtils {
    return this._assert;
  }

  /**
   * DOM-based assertions (elements, page)
   */
  expect(): ExpectUtils {
    return this._expect;
  }

  /**
   * Enable soft assertion mode for both assert and expect
   */
  enableSoftMode(): void {
    this._assert.enableSoftMode();
    this._expect.enableSoftMode();
  }

  /**
   * Disable soft assertion mode and validate all collected errors
   */
  disableSoftModeAndValidate(): void {
    // Collect errors from both
    const assertErrors = this._assert.getSoftErrors();
    const expectErrors = this._expect.getSoftErrors();

    this._assert.disableSoftModeAndValidate();
    this._expect.disableSoftModeAndValidate();

    const allErrors = [...assertErrors, ...expectErrors];
    if (allErrors.length > 0) {
      const messages = allErrors.map((e, i) => `${i + 1}. ${e.message}`).join('\n');
      throw new Error(`Soft assertions failed:\n${messages}`);
    }
  }
}
```

## Using Assertions with Fixtures

```typescript
// fixtures/assertions.fixture.ts
import { test as base } from '@playwright/test';
import { Assertions } from '../assertions/Assertions';

type AssertionFixtures = {
  assertions: Assertions;
};

export const test = base.extend<AssertionFixtures>({
  assertions: async ({ page }, use) => {
    const assertions = new Assertions(page);
    await use(assertions);
  },
});

export { expect } from '@playwright/test';
```

## Combined Fixture (UIActions + Assertions)

```typescript
// fixtures/combined.fixture.ts
import { test as base } from '@playwright/test';
import { UIActions } from '../actions/UIActions';
import { Assertions } from '../assertions/Assertions';

type CombinedFixtures = {
  ui: UIActions;
  assertions: Assertions;
};

export const test = base.extend<CombinedFixtures>({
  ui: async ({ page }, use) => {
    await use(new UIActions(page));
  },
  assertions: async ({ page }, use) => {
    await use(new Assertions(page));
  },
});

export { expect } from '@playwright/test';
```

## Usage Examples

### Basic Usage

```typescript
import { test } from '../fixtures/combined.fixture';
import { LoginPage } from '../pages/LoginPage';

test('user can login', async ({ page, ui, assertions }) => {
  const loginPage = new LoginPage(page, ui);

  await ui.pageAction().navigate('/login');
  await loginPage.login('user@example.com', 'password');

  // DOM-based assertion
  await assertions.expect().toHaveURL(/.*dashboard/);
  await assertions.expect().toBeVisible(page.getByText('Welcome'));

  // Value-based assertion
  const pageTitle = await ui.pageAction().getTitle();
  assertions.assert().assertEqual(pageTitle, 'Dashboard');
});
```

### Using Soft Assertions

```typescript
test('validate form fields', async ({ page, assertions }) => {
  // Enable soft mode - failures won't stop the test
  assertions.enableSoftMode();

  const nameInput = page.getByLabel('Name');
  const emailInput = page.getByLabel('Email');
  const phoneInput = page.getByLabel('Phone');

  // Multiple assertions that collect all failures
  await assertions.expect().toBeVisible(nameInput, 'Name field should be visible');
  await assertions.expect().toBeVisible(emailInput, 'Email field should be visible');
  await assertions.expect().toBeVisible(phoneInput, 'Phone field should be visible');
  await assertions.expect().toHaveValue(nameInput, '', 'Name should be empty initially');
  await assertions.expect().toHaveValue(emailInput, '', 'Email should be empty initially');

  // At the end, validate all collected errors
  assertions.disableSoftModeAndValidate();
  // If any assertion failed, this will throw with ALL failures listed
});
```

### In Page Objects

```typescript
// pages/ProductPage.ts
import { Page, Locator } from '@playwright/test';
import { UIActions } from '../actions/UIActions';
import { Assertions } from '../assertions/Assertions';

export class ProductPage {
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly addToCartButton: Locator;

  constructor(
    private page: Page,
    private ui: UIActions,
    private assertions: Assertions
  ) {
    this.productTitle = page.getByRole('heading', { level: 1 });
    this.productPrice = page.getByTestId('product-price');
    this.addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
  }

  async verifyProductDetails(expectedName: string, expectedPrice: number): Promise<void> {
    await this.assertions.expect().toHaveText(this.productTitle, expectedName);

    const priceText = await this.ui.element().getText(this.productPrice);
    const price = parseFloat(priceText.replace('$', ''));
    this.assertions.assert().assertEqual(price, expectedPrice, 'Product price mismatch');
  }

  async addToCart(): Promise<void> {
    await this.ui.button().click(this.addToCartButton);
    await this.assertions.expect().toBeVisible(
      this.page.getByRole('alert'),
      'Cart confirmation should appear'
    );
  }
}
```

## Folder Structure

```
your-project/
├── assertions/
│   ├── AssertUtils.ts          # Value-based assertions
│   ├── ExpectUtils.ts          # DOM-based assertions
│   ├── Assertions.ts           # Combined gateway
│   └── index.ts                # Barrel exports
├── actions/
│   ├── UIActions.ts
│   └── ...
├── pages/
│   └── ...
├── fixtures/
│   ├── ui.fixture.ts
│   ├── assertions.fixture.ts
│   └── combined.fixture.ts
└── tests/
    └── ...
```

## Best Practices

### Do's

- [ ] Use `ExpectUtils` for all DOM-related assertions
- [ ] Use `AssertUtils` for value validations (API responses, calculations)
- [ ] Use soft assertions when validating multiple fields
- [ ] Provide descriptive messages for assertions
- [ ] Create custom assertion methods for domain-specific validations

### Don'ts

- [ ] Don't mix raw `expect()` calls with `ExpectUtils`
- [ ] Don't forget to call `disableSoftModeAndValidate()` after soft assertions
- [ ] Don't put complex business logic in assertion classes
- [ ] Don't use assertions for control flow (use conditions instead)

## Custom Assertion Example

```typescript
// assertions/CustomAssertions.ts
import { Locator } from '@playwright/test';
import { ExpectUtils } from './ExpectUtils';

export class CustomAssertions extends ExpectUtils {
  /**
   * Assert product card has all required elements
   */
  async toBeValidProductCard(cardLocator: Locator): Promise<void> {
    await this.toBeVisible(cardLocator.getByRole('img'), 'Product image should be visible');
    await this.toBeVisible(cardLocator.getByRole('heading'), 'Product title should be visible');
    await this.toBeVisible(cardLocator.getByTestId('price'), 'Product price should be visible');
    await this.toBeEnabled(cardLocator.getByRole('button', { name: 'Add to Cart' }));
  }

  /**
   * Assert form has validation error
   */
  async toHaveValidationError(formLocator: Locator, fieldName: string, errorMessage: string): Promise<void> {
    const errorLocator = formLocator.getByRole('alert').filter({ hasText: errorMessage });
    await this.toBeVisible(errorLocator, `Validation error for ${fieldName} should be visible`);
  }
}
```

## Related Resources

- [Action Utilities](../action-utilities/SKILL.md)
- [Page Object Model](../page-object-model/SKILL.md)
- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
