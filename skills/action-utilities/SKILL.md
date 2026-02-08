---
name: action-utilities
description: >
  UIActions pattern for centralized Playwright interactions. Use when implementing clean page object interactions, creating reusable action classes for buttons, inputs, dropdowns, checkboxes, or building a centralized interaction gateway.
---

# Action Utilities Skill

A comprehensive guide to implementing centralized action utilities (UIActions pattern) in Playwright for cleaner, more maintainable test automation.

## What is the UIActions Pattern?

The UIActions pattern creates a **single interaction gateway** between your Page Objects and Playwright. Instead of scattering low-level Playwright calls (`locator.click()`, `locator.fill()`) throughout your codebase, all interactions flow through one unified, expressive interface.

### Why Use UIActions?

| Problem | Solution with UIActions |
|---------|------------------------|
| Duplicated wait logic across tests | Centralized auto-wait handling |
| Inconsistent error handling | Unified error messages with context |
| Scattered retry logic | Single place for retry configuration |
| Hard to add logging/screenshots | One place to add cross-cutting concerns |
| Page Objects become bloated | Page Objects focus on "what", UIActions handles "how" |

## Core Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Test Files                          │
│            (describe what user does)                     │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    Page Objects                          │
│        (map UI elements, define page actions)            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                     UIActions                            │
│    (centralized interaction gateway - THE ONLY WAY      │
│     Page Objects talk to Playwright)                     │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Specialized Action Classes                  │
│   EditBoxActions │ ButtonActions │ DropDownActions │ etc │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    Playwright API                        │
└─────────────────────────────────────────────────────────┘
```

## Implementation

### 1. Base Action Class

```typescript
// actions/BaseAction.ts
import { Page, Locator } from '@playwright/test';

export abstract class BaseAction {
  protected page: Page;
  protected defaultTimeout: number;

  constructor(page: Page, timeout: number = 30000) {
    this.page = page;
    this.defaultTimeout = timeout;
  }

  /**
   * Wait for element to be visible before interacting
   */
  protected async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({
      state: 'visible',
      timeout: timeout ?? this.defaultTimeout,
    });
  }

  /**
   * Wait for element to be enabled
   */
  protected async waitForEnabled(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({
      state: 'attached',
      timeout: timeout ?? this.defaultTimeout,
    });
    // Additional check for enabled state
    const isDisabled = await locator.isDisabled();
    if (isDisabled) {
      throw new Error(`Element is disabled: ${locator}`);
    }
  }

  /**
   * Scroll element into view
   */
  protected async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Highlight element for debugging (optional)
   */
  protected async highlight(locator: Locator): Promise<void> {
    if (process.env.DEBUG_MODE === 'true') {
      await locator.evaluate((el) => {
        el.style.border = '3px solid red';
        setTimeout(() => (el.style.border = ''), 2000);
      });
    }
  }

  /**
   * Log action for debugging
   */
  protected log(action: string, details?: string): void {
    if (process.env.DEBUG_MODE === 'true') {
      console.log(`[UIAction] ${action}${details ? `: ${details}` : ''}`);
    }
  }
}
```

### 2. Specialized Action Classes

#### EditBoxActions (Text Inputs)

```typescript
// actions/EditBoxActions.ts
import { Page, Locator } from '@playwright/test';
import { BaseAction } from './BaseAction';

export class EditBoxActions extends BaseAction {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Fill text input with value
   */
  async fill(locator: Locator, value: string): Promise<void> {
    this.log('Fill', `value: "${value}"`);
    await this.waitForVisible(locator);
    await this.scrollIntoView(locator);
    await locator.fill(value);
  }

  /**
   * Type text character by character (useful for autocomplete fields)
   */
  async type(locator: Locator, value: string, delay: number = 50): Promise<void> {
    this.log('Type', `value: "${value}", delay: ${delay}ms`);
    await this.waitForVisible(locator);
    await this.scrollIntoView(locator);
    await locator.pressSequentially(value, { delay });
  }

  /**
   * Clear and fill
   */
  async clearAndFill(locator: Locator, value: string): Promise<void> {
    this.log('ClearAndFill', `value: "${value}"`);
    await this.waitForVisible(locator);
    await this.scrollIntoView(locator);
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Clear input field
   */
  async clear(locator: Locator): Promise<void> {
    this.log('Clear');
    await this.waitForVisible(locator);
    await locator.clear();
  }

  /**
   * Get current value
   */
  async getValue(locator: Locator): Promise<string> {
    await this.waitForVisible(locator);
    return locator.inputValue();
  }

  /**
   * Check if input is empty
   */
  async isEmpty(locator: Locator): Promise<boolean> {
    const value = await this.getValue(locator);
    return value.trim() === '';
  }

  /**
   * Fill with masked value (for passwords, sensitive data)
   */
  async fillSensitive(locator: Locator, value: string): Promise<void> {
    this.log('Fill', 'value: [MASKED]');
    await this.waitForVisible(locator);
    await this.scrollIntoView(locator);
    await locator.fill(value);
  }
}
```

#### ButtonActions (Clickable Elements)

```typescript
// actions/ButtonActions.ts
import { Page, Locator } from '@playwright/test';
import { BaseAction } from './BaseAction';

export class ButtonActions extends BaseAction {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Click element
   */
  async click(locator: Locator): Promise<void> {
    this.log('Click');
    await this.waitForVisible(locator);
    await this.waitForEnabled(locator);
    await this.scrollIntoView(locator);
    await locator.click();
  }

  /**
   * Double click element
   */
  async doubleClick(locator: Locator): Promise<void> {
    this.log('DoubleClick');
    await this.waitForVisible(locator);
    await this.scrollIntoView(locator);
    await locator.dblclick();
  }

  /**
   * Right click element
   */
  async rightClick(locator: Locator): Promise<void> {
    this.log('RightClick');
    await this.waitForVisible(locator);
    await this.scrollIntoView(locator);
    await locator.click({ button: 'right' });
  }

  /**
   * Click and wait for navigation
   */
  async clickAndWaitForNavigation(locator: Locator): Promise<void> {
    this.log('ClickAndWaitForNavigation');
    await this.waitForVisible(locator);
    await this.scrollIntoView(locator);
    await Promise.all([
      this.page.waitForNavigation(),
      locator.click(),
    ]);
  }

  /**
   * Click and wait for network idle
   */
  async clickAndWaitForNetworkIdle(locator: Locator): Promise<void> {
    this.log('ClickAndWaitForNetworkIdle');
    await this.waitForVisible(locator);
    await locator.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Force click (bypass actionability checks)
   */
  async forceClick(locator: Locator): Promise<void> {
    this.log('ForceClick');
    await locator.click({ force: true });
  }

  /**
   * Hover over element
   */
  async hover(locator: Locator): Promise<void> {
    this.log('Hover');
    await this.waitForVisible(locator);
    await locator.hover();
  }

  /**
   * Check if element is clickable
   */
  async isClickable(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 1000 });
      const isEnabled = await locator.isEnabled();
      return isEnabled;
    } catch {
      return false;
    }
  }
}
```

#### CheckboxActions

```typescript
// actions/CheckboxActions.ts
import { Page, Locator } from '@playwright/test';
import { BaseAction } from './BaseAction';

export class CheckboxActions extends BaseAction {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Check the checkbox
   */
  async check(locator: Locator): Promise<void> {
    this.log('Check');
    await this.waitForVisible(locator);
    await this.scrollIntoView(locator);
    await locator.check();
  }

  /**
   * Uncheck the checkbox
   */
  async uncheck(locator: Locator): Promise<void> {
    this.log('Uncheck');
    await this.waitForVisible(locator);
    await this.scrollIntoView(locator);
    await locator.uncheck();
  }

  /**
   * Set checkbox state (check or uncheck based on value)
   */
  async setChecked(locator: Locator, checked: boolean): Promise<void> {
    this.log('SetChecked', `checked: ${checked}`);
    await this.waitForVisible(locator);
    await this.scrollIntoView(locator);
    await locator.setChecked(checked);
  }

  /**
   * Toggle checkbox state
   */
  async toggle(locator: Locator): Promise<void> {
    this.log('Toggle');
    const isChecked = await this.isChecked(locator);
    await this.setChecked(locator, !isChecked);
  }

  /**
   * Check if checkbox is checked
   */
  async isChecked(locator: Locator): Promise<boolean> {
    await this.waitForVisible(locator);
    return locator.isChecked();
  }
}
```

#### DropdownActions

```typescript
// actions/DropdownActions.ts
import { Page, Locator } from '@playwright/test';
import { BaseAction } from './BaseAction';

export class DropdownActions extends BaseAction {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Select option by visible text
   */
  async selectByText(locator: Locator, text: string): Promise<void> {
    this.log('SelectByText', `text: "${text}"`);
    await this.waitForVisible(locator);
    await this.scrollIntoView(locator);
    await locator.selectOption({ label: text });
  }

  /**
   * Select option by value attribute
   */
  async selectByValue(locator: Locator, value: string): Promise<void> {
    this.log('SelectByValue', `value: "${value}"`);
    await this.waitForVisible(locator);
    await this.scrollIntoView(locator);
    await locator.selectOption({ value });
  }

  /**
   * Select option by index (0-based)
   */
  async selectByIndex(locator: Locator, index: number): Promise<void> {
    this.log('SelectByIndex', `index: ${index}`);
    await this.waitForVisible(locator);
    await this.scrollIntoView(locator);
    await locator.selectOption({ index });
  }

  /**
   * Select multiple options (for multi-select dropdowns)
   */
  async selectMultiple(locator: Locator, values: string[]): Promise<void> {
    this.log('SelectMultiple', `values: ${values.join(', ')}`);
    await this.waitForVisible(locator);
    await locator.selectOption(values);
  }

  /**
   * Get selected option text
   */
  async getSelectedText(locator: Locator): Promise<string> {
    await this.waitForVisible(locator);
    return locator.evaluate((select: HTMLSelectElement) => {
      return select.options[select.selectedIndex]?.text ?? '';
    });
  }

  /**
   * Get selected option value
   */
  async getSelectedValue(locator: Locator): Promise<string> {
    await this.waitForVisible(locator);
    return locator.inputValue();
  }

  /**
   * Get all options
   */
  async getAllOptions(locator: Locator): Promise<string[]> {
    await this.waitForVisible(locator);
    return locator.evaluate((select: HTMLSelectElement) => {
      return Array.from(select.options).map(option => option.text);
    });
  }
}
```

#### UIElementActions (Generic Elements)

```typescript
// actions/UIElementActions.ts
import { Page, Locator } from '@playwright/test';
import { BaseAction } from './BaseAction';

export class UIElementActions extends BaseAction {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Get element text content
   */
  async getText(locator: Locator): Promise<string> {
    await this.waitForVisible(locator);
    return (await locator.textContent()) ?? '';
  }

  /**
   * Get inner text (visible text only)
   */
  async getInnerText(locator: Locator): Promise<string> {
    await this.waitForVisible(locator);
    return locator.innerText();
  }

  /**
   * Get attribute value
   */
  async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
    await this.waitForVisible(locator);
    return locator.getAttribute(attribute);
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator, timeout?: number): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: timeout ?? 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is hidden
   */
  async isHidden(locator: Locator): Promise<boolean> {
    return locator.isHidden();
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    return locator.isEnabled();
  }

  /**
   * Wait for element to appear
   */
  async waitForElement(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({
      state: 'visible',
      timeout: timeout ?? this.defaultTimeout,
    });
  }

  /**
   * Wait for element to disappear
   */
  async waitForElementToDisappear(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({
      state: 'hidden',
      timeout: timeout ?? this.defaultTimeout,
    });
  }

  /**
   * Get element count
   */
  async count(locator: Locator): Promise<number> {
    return locator.count();
  }

  /**
   * Get all matching elements
   */
  async getAll(locator: Locator): Promise<Locator[]> {
    return locator.all();
  }

  /**
   * Get CSS property value
   */
  async getCssValue(locator: Locator, property: string): Promise<string> {
    await this.waitForVisible(locator);
    return locator.evaluate((el, prop) => {
      return window.getComputedStyle(el).getPropertyValue(prop);
    }, property);
  }

  /**
   * Check if element has specific class
   */
  async hasClass(locator: Locator, className: string): Promise<boolean> {
    const classAttr = await this.getAttribute(locator, 'class');
    return classAttr?.includes(className) ?? false;
  }
}
```

#### PageActions (Page-Level Operations)

```typescript
// actions/PageActions.ts
import { Page } from '@playwright/test';
import { BaseAction } from './BaseAction';

export class PageActions extends BaseAction {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to URL
   */
  async navigate(url: string): Promise<void> {
    this.log('Navigate', url);
    await this.page.goto(url);
  }

  /**
   * Navigate and wait for network idle
   */
  async navigateAndWait(url: string): Promise<void> {
    this.log('NavigateAndWait', url);
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    this.log('Reload');
    await this.page.reload();
  }

  /**
   * Go back in history
   */
  async goBack(): Promise<void> {
    this.log('GoBack');
    await this.page.goBack();
  }

  /**
   * Go forward in history
   */
  async goForward(): Promise<void> {
    this.log('GoForward');
    await this.page.goForward();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Wait for page to load
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('load');
  }

  /**
   * Wait for network idle
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for DOM content loaded
   */
  async waitForDOMContentLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    this.log('Screenshot', name);
    await this.page.screenshot({
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Accept dialog (alert, confirm, prompt)
   */
  async acceptDialog(): Promise<void> {
    this.page.once('dialog', dialog => dialog.accept());
  }

  /**
   * Dismiss dialog
   */
  async dismissDialog(): Promise<void> {
    this.page.once('dialog', dialog => dialog.dismiss());
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string): Promise<void> {
    this.log('PressKey', key);
    await this.page.keyboard.press(key);
  }

  /**
   * Scroll to top
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /**
   * Scroll to bottom
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }
}
```

### 3. Main UIActions Class (The Gateway)

```typescript
// actions/UIActions.ts
import { Page } from '@playwright/test';
import { EditBoxActions } from './EditBoxActions';
import { ButtonActions } from './ButtonActions';
import { CheckboxActions } from './CheckboxActions';
import { DropdownActions } from './DropdownActions';
import { UIElementActions } from './UIElementActions';
import { PageActions } from './PageActions';

/**
 * UIActions - The Single Interaction Gateway
 *
 * This is THE ONLY API your Page Objects should talk to.
 * All Playwright interactions flow through this class.
 *
 * Usage in Page Objects:
 * ```
 * constructor(private ui: UIActions) {}
 *
 * async login(email: string, password: string) {
 *   await this.ui.editBox().fill(this.emailInput, email);
 *   await this.ui.editBox().fill(this.passwordInput, password);
 *   await this.ui.button().click(this.loginButton);
 * }
 * ```
 */
export class UIActions {
  private page: Page;
  private _editBox: EditBoxActions;
  private _button: ButtonActions;
  private _checkbox: CheckboxActions;
  private _dropdown: DropdownActions;
  private _element: UIElementActions;
  private _pageActions: PageActions;

  constructor(page: Page) {
    this.page = page;
    this._editBox = new EditBoxActions(page);
    this._button = new ButtonActions(page);
    this._checkbox = new CheckboxActions(page);
    this._dropdown = new DropdownActions(page);
    this._element = new UIElementActions(page);
    this._pageActions = new PageActions(page);
  }

  /**
   * Actions for text input fields
   */
  editBox(): EditBoxActions {
    return this._editBox;
  }

  /**
   * Actions for buttons and clickable elements
   */
  button(): ButtonActions {
    return this._button;
  }

  /**
   * Actions for checkboxes and radio buttons
   */
  checkbox(): CheckboxActions {
    return this._checkbox;
  }

  /**
   * Actions for dropdown/select elements
   */
  dropdown(): DropdownActions {
    return this._dropdown;
  }

  /**
   * Actions for generic UI elements
   */
  element(): UIElementActions {
    return this._element;
  }

  /**
   * Page-level actions (navigation, screenshots, etc.)
   */
  pageAction(): PageActions {
    return this._pageActions;
  }

  /**
   * Get the underlying Playwright Page (use sparingly!)
   */
  getPage(): Page {
    return this.page;
  }
}
```

## Using UIActions with Page Objects

### Before (Without UIActions)

```typescript
// BAD - Direct Playwright calls in Page Object
class LoginPage {
  constructor(private page: Page) {}

  readonly emailInput = this.page.getByLabel('Email');
  readonly passwordInput = this.page.getByLabel('Password');
  readonly loginButton = this.page.getByRole('button', { name: 'Sign in' });

  async login(email: string, password: string) {
    // Direct Playwright calls scattered everywhere
    await this.emailInput.waitFor({ state: 'visible' });
    await this.emailInput.fill(email);
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.passwordInput.fill(password);
    await this.loginButton.waitFor({ state: 'visible' });
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
```

### After (With UIActions)

```typescript
// GOOD - All interactions through UIActions
class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(private page: Page, private ui: UIActions) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Sign in' });
  }

  async login(email: string, password: string) {
    // Clean, expressive, centralized
    await this.ui.editBox().fill(this.emailInput, email);
    await this.ui.editBox().fillSensitive(this.passwordInput, password);
    await this.ui.button().clickAndWaitForNetworkIdle(this.loginButton);
  }

  async getEmailValue(): Promise<string> {
    return this.ui.editBox().getValue(this.emailInput);
  }
}
```

## Setting Up UIActions with Fixtures

```typescript
// fixtures/ui.fixture.ts
import { test as base } from '@playwright/test';
import { UIActions } from '../actions/UIActions';

type UIFixtures = {
  ui: UIActions;
};

export const test = base.extend<UIFixtures>({
  ui: async ({ page }, use) => {
    const ui = new UIActions(page);
    await use(ui);
  },
});

export { expect } from '@playwright/test';
```

```typescript
// Using in tests
import { test, expect } from '../fixtures/ui.fixture';
import { LoginPage } from '../pages/LoginPage';

test('user can login', async ({ page, ui }) => {
  const loginPage = new LoginPage(page, ui);

  await ui.pageAction().navigate('/login');
  await loginPage.login('user@example.com', 'password');

  await expect(page).toHaveURL('/dashboard');
});
```

## Folder Structure

```
your-project/
├── actions/
│   ├── BaseAction.ts           # Abstract base class
│   ├── EditBoxActions.ts       # Text input actions
│   ├── ButtonActions.ts        # Click actions
│   ├── CheckboxActions.ts      # Checkbox/radio actions
│   ├── DropdownActions.ts      # Select actions
│   ├── UIElementActions.ts     # Generic element actions
│   ├── PageActions.ts          # Page-level actions
│   ├── UIActions.ts            # Main gateway class
│   └── index.ts                # Barrel exports
├── pages/
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   └── ...
├── fixtures/
│   └── ui.fixture.ts
└── tests/
    └── ...
```

## Best Practices

### Do's

- [ ] Use UIActions for ALL Playwright interactions
- [ ] Keep action classes focused (single responsibility)
- [ ] Add meaningful logging for debugging
- [ ] Use appropriate wait strategies in action classes
- [ ] Pass UIActions to Page Objects via constructor
- [ ] Create new action classes for specialized components

### Don'ts

- [ ] Don't call Playwright directly in Page Objects
- [ ] Don't duplicate wait logic across tests
- [ ] Don't skip the UIActions layer "just this once"
- [ ] Don't put business logic in action classes
- [ ] Don't create overly specific methods (keep actions generic)

## Rules for Page Objects (When Using UIActions)

1. **Never write raw Playwright code** - No `page.locator()`, `locator.click()`, `expect()` in Page Objects
2. **Never write inline selectors** - Define all locators as class properties
3. **Never hardcode values** - Use parameters or test data
4. **All interactions through UIActions** - No exceptions

## Related Resources

- [Page Object Model](../page-object-model/SKILL.md)
- [Assertion Utilities](../assertion-utilities/SKILL.md)
- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
