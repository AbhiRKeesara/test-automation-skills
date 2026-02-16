# Shadow DOM Handling Skill

## Overview
This skill teaches you how to interact with Shadow DOM elements in Playwright tests. Shadow DOM provides encapsulation for web components, creating isolated DOM trees that require special handling in test automation.

## When to Use
- Testing web components (custom elements)
- Interacting with design system components that use Shadow DOM
- Testing third-party widgets with encapsulated styles
- Working with modern frameworks (Lit, Stencil, native web components)

## Core Concepts

### Understanding Shadow DOM
- **Shadow Host**: The regular DOM element that contains a shadow root
- **Shadow Root**: The root of the shadow tree
- **Shadow Tree**: The encapsulated DOM structure inside the shadow root
- **Light DOM**: The regular DOM outside of shadow boundaries
- **Open vs Closed**: Shadow roots can be open (accessible) or closed (restricted)

### Shadow DOM Structure
```html
<!-- Light DOM -->
<my-widget>
  #shadow-root (open)
    <!-- Shadow DOM -->
    <div class="internal-content">
      <button class="internal-button">Click me!</button>
    </div>
    <style>
      .internal-button { color: blue; }
    </style>
</my-widget>
```

## Implementation Patterns

### 1. Basic Shadow DOM Access (Modern Approach)

```typescript
import { test, expect } from '@playwright/test';

test('interact with shadow dom element', async ({ page }) => {
  await page.goto('https://example.com/web-components');

  // Locate the host element (custom element)
  const widget = page.locator('my-widget');

  // Playwright automatically pierces shadow DOM
  const internalButton = widget.locator('.internal-button');

  // Interact with shadow DOM element
  await internalButton.click();

  // Assertions work normally
  await expect(internalButton).toHaveText('Clicked!');
});
```

### 2. Nested Shadow DOM

```typescript
test('interact with nested shadow dom', async ({ page }) => {
  await page.goto('https://example.com/nested-components');

  // Chain locators to traverse nested shadow trees
  const outerComponent = page.locator('outer-widget');
  const innerComponent = outerComponent.locator('inner-widget');
  const deepButton = innerComponent.locator('button.deep-action');

  await deepButton.click();
  await expect(deepButton).toHaveAttribute('aria-pressed', 'true');
});
```

### 3. Multiple Shadow DOM Elements

```typescript
test('work with multiple shadow components', async ({ page }) => {
  await page.goto('https://example.com/dashboard');

  // Access first card component
  const firstCard = page.locator('custom-card').first();
  const firstCardButton = firstCard.locator('button.action');
  await firstCardButton.click();

  // Access specific card by data attribute
  const profileCard = page.locator('custom-card[data-type="profile"]');
  const profileButton = profileCard.locator('button.edit');
  await profileButton.click();

  // Iterate through all cards
  const allCards = page.locator('custom-card');
  const count = await allCards.count();

  for (let i = 0; i < count; i++) {
    const card = allCards.nth(i);
    const title = await card.locator('.card-title').textContent();
    console.log(`Card ${i}: ${title}`);
  }
});
```

### 4. Using Pierce Combinator (Deprecated but Sometimes Necessary)

```typescript
test('use pierce combinator for complex selectors', async ({ page }) => {
  await page.goto('https://example.com');

  // Old syntax (still works but deprecated)
  // const button = page.locator('my-widget >>> .internal-button');

  // Modern approach - Playwright auto-pierces
  const widget = page.locator('my-widget');
  const button = widget.locator('.internal-button');

  await button.click();
});
```

### 5. Shadow DOM with Role Selectors

```typescript
test('use accessible role selectors in shadow dom', async ({ page }) => {
  await page.goto('https://example.com/accessible-components');

  const widget = page.locator('accessible-widget');

  // Role selectors work through shadow boundaries
  await widget.getByRole('button', { name: 'Submit' }).click();
  await widget.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
  await widget.getByLabel('Accept Terms').check();

  await expect(widget.getByRole('alert')).toContainText('Success');
});
```

## Page Object Pattern for Shadow DOM

### Shadow Component Object

```typescript
// components/CustomCard.ts
import { Locator } from '@playwright/test';

export class CustomCardComponent {
  private readonly component: Locator;

  constructor(host: Locator) {
    this.component = host;
  }

  // Encapsulate shadow DOM access
  private get title() {
    return this.component.locator('.card-title');
  }

  private get description() {
    return this.component.locator('.card-description');
  }

  private get actionButton() {
    return this.component.locator('button.primary-action');
  }

  private get closeButton() {
    return this.component.locator('button.close');
  }

  async clickAction() {
    await this.actionButton.click();
  }

  async close() {
    await this.closeButton.click();
  }

  async getTitle(): Promise<string> {
    return await this.title.textContent() || '';
  }

  async getDescription(): Promise<string> {
    return await this.description.textContent() || '';
  }

  async isExpanded(): Promise<boolean> {
    return await this.component.getAttribute('aria-expanded') === 'true';
  }
}

// Usage in test
test('use custom card component', async ({ page }) => {
  await page.goto('https://example.com/dashboard');

  const cardHost = page.locator('custom-card[data-id="123"]');
  const card = new CustomCardComponent(cardHost);

  await card.clickAction();
  expect(await card.getTitle()).toBe('Profile Settings');
});
```

### Nested Shadow Components

```typescript
// components/ComplexWidget.ts
import { Locator, Page } from '@playwright/test';

export class ComplexWidgetComponent {
  private readonly host: Locator;

  constructor(page: Page, selector: string) {
    this.host = page.locator(selector);
  }

  // Nested component access
  private get headerComponent() {
    return this.host.locator('widget-header');
  }

  private get contentComponent() {
    return this.host.locator('widget-content');
  }

  private get footerComponent() {
    return this.host.locator('widget-footer');
  }

  // Nested shadow DOM elements
  async getHeaderTitle(): Promise<string> {
    const titleElement = this.headerComponent.locator('h2.title');
    return await titleElement.textContent() || '';
  }

  async clickContentButton(buttonName: string) {
    const button = this.contentComponent.getByRole('button', { name: buttonName });
    await button.click();
  }

  async getFooterLinks() {
    const links = this.footerComponent.locator('a');
    const count = await links.count();
    const linkTexts: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await links.nth(i).textContent();
      if (text) linkTexts.push(text);
    }

    return linkTexts;
  }
}
```

### Factory Pattern for Shadow Components

```typescript
// factories/ComponentFactory.ts
import { Page, Locator } from '@playwright/test';
import { CustomCardComponent } from '../components/CustomCard';
import { CustomButtonComponent } from '../components/CustomButton';

export class ComponentFactory {
  constructor(private page: Page) {}

  createCard(selector: string): CustomCardComponent {
    const host = this.page.locator(selector);
    return new CustomCardComponent(host);
  }

  createButton(selector: string): CustomButtonComponent {
    const host = this.page.locator(selector);
    return new CustomButtonComponent(host);
  }

  getAllCards(): Promise<CustomCardComponent[]> {
    return this.createComponents('custom-card', CustomCardComponent);
  }

  private async createComponents<T>(
    selector: string,
    ComponentClass: new (host: Locator) => T
  ): Promise<T[]> {
    const locator = this.page.locator(selector);
    const count = await locator.count();
    const components: T[] = [];

    for (let i = 0; i < count; i++) {
      const host = locator.nth(i);
      components.push(new ComponentClass(host));
    }

    return components;
  }
}

// Usage
test('use component factory', async ({ page }) => {
  await page.goto('https://example.com/dashboard');

  const factory = new ComponentFactory(page);

  const cards = await factory.getAllCards();
  expect(cards.length).toBeGreaterThan(0);

  for (const card of cards) {
    console.log(await card.getTitle());
  }
});
```

## Common Pitfalls & Solutions

### ❌ Not Using Host Element as Reference

```typescript
// Bad - tries to find shadow element globally
const button = page.locator('.internal-button'); // Won't work!

// Good - locate through host element
const widget = page.locator('my-widget');
const button = widget.locator('.internal-button');
```

### ❌ Using CSS Selectors Across Shadow Boundaries

```typescript
// Bad - CSS can't cross shadow boundaries without special syntax
const button = page.locator('my-widget .internal-button'); // Won't work!

// Good - chain locators
const widget = page.locator('my-widget');
const button = widget.locator('.internal-button');
```

### ❌ Assuming All Components Use Shadow DOM

```typescript
// Check if element uses shadow DOM before accessing
test('handle both shadow and regular dom', async ({ page }) => {
  await page.goto('https://example.com');

  // Some components might not use shadow DOM
  const regularComponent = page.locator('regular-component .button');
  await regularComponent.click(); // Works for regular DOM

  // Shadow DOM components need different approach
  const shadowComponent = page.locator('shadow-component');
  const shadowButton = shadowComponent.locator('.button');
  await shadowButton.click();
});
```

### ❌ Not Waiting for Shadow DOM Content

```typescript
// Bad - shadow content might not be ready
const widget = page.locator('my-widget');
const button = widget.locator('button');
await button.click(); // Might fail if not ready

// Good - wait for element visibility
const widget = page.locator('my-widget');
const button = widget.locator('button');
await expect(button).toBeVisible(); // Ensures element is ready
await button.click();
```

## Best Practices

### ✅ Always Locate Through Host Element

```typescript
// Correct pattern
const host = page.locator('custom-element');
const shadowChild = host.locator('.child-element');
await shadowChild.click();
```

### ✅ Use Semantic Selectors When Possible

```typescript
// Prefer role-based selectors
const widget = page.locator('my-widget');
await widget.getByRole('button', { name: 'Submit' }).click();

// Over class-based selectors
// const button = widget.locator('.submit-btn'); // Less maintainable
```

### ✅ Encapsulate Shadow DOM Logic in Components

```typescript
export class DatePickerComponent {
  constructor(private host: Locator) {}

  async selectDate(day: number) {
    // Shadow DOM complexity hidden from tests
    const calendar = this.host.locator('.calendar-grid');
    const dayCell = calendar.locator(`[data-day="${day}"]`);
    await dayCell.click();
  }
}

// Test remains clean
test('select date', async ({ page }) => {
  const datePicker = new DatePickerComponent(page.locator('date-picker'));
  await datePicker.selectDate(15);
});
```

### ✅ Handle Both Open and Closed Shadow Roots

```typescript
test('handle different shadow root modes', async ({ page }) => {
  await page.goto('https://example.com');

  // Open shadow roots - Playwright handles automatically
  const openWidget = page.locator('open-widget');
  await openWidget.locator('button').click(); // Works!

  // Closed shadow roots - may require alternative approach
  const closedWidget = page.locator('closed-widget');

  // If direct access fails, use accessible patterns
  await closedWidget.getByRole('button', { name: 'Submit' }).click();
});
```

## Advanced Patterns

### Filtering Shadow DOM Elements

Playwright's filtering methods work seamlessly with Shadow DOM, allowing you to narrow down web component selections based on content or child elements.

#### Filter by Text Content

```typescript
test('filter web components by shadow content', async ({ page }) => {
  await page.goto('https://example.com/dashboard');

  // Find widgets that contain "Active" in their shadow DOM
  const activeWidgets = page
    .locator('custom-widget')
    .filter({ hasText: 'Active' });

  await expect(activeWidgets).toHaveCount(5);

  // Find widgets that DON'T have "Error" status
  const healthyWidgets = page
    .locator('custom-widget')
    .filter({ hasNotText: 'Error' })
    .filter({ hasNotText: 'Offline' });

  // Interact with first healthy widget
  await healthyWidgets.first().locator('button.refresh').click();
});
```

#### Filter by Child Elements in Shadow DOM

```typescript
test('filter by shadow DOM children', async ({ page }) => {
  await page.goto('https://example.com/components');

  // Find widgets that have a primary button in their shadow DOM
  const widgetsWithButton = page
    .locator('custom-widget')
    .filter({ has: page.locator('button.primary') });

  await expect(widgetsWithButton).toHaveCount(3);

  // Find cards that DON'T have a delete button
  const undeletableCards = page
    .locator('custom-card')
    .filter({ hasNot: page.getByRole('button', { name: 'Delete' }) });

  await expect(undeletableCards).toHaveCount(2);
});
```

#### Combine Multiple Filters with Shadow DOM

```typescript
test('chain filters for precise shadow component selection', async ({ page }) => {
  await page.goto('https://example.com/products');

  // Find product cards that are:
  // - In stock (have "Available" text)
  // - Not on sale (don't have sale badge)
  // - Have "Add to cart" button
  const standardProducts = page
    .locator('product-card')
    .filter({ hasText: 'Available' })
    .filter({ hasNotText: 'On Sale' })
    .filter({ hasNot: page.locator('.sale-badge') })
    .filter({ has: page.getByRole('button', { name: 'Add to cart' }) });

  console.log(`Found ${await standardProducts.count()} standard products`);

  // Click first matching product
  await standardProducts.first().getByRole('button', { name: 'Add to cart' }).click();
});
```

#### Using AND/OR Logic with Shadow Components

```typescript
test('combine shadow components with AND/OR logic', async ({ page }) => {
  await page.goto('https://example.com/dashboard');

  // Component must match both conditions (AND)
  const priorityWidget = page
    .locator('dashboard-widget')
    .and(page.locator('[priority="high"]'));

  await expect(priorityWidget).toBeVisible();

  // Match either component type (OR)
  const notification = page
    .locator('toast-notification')
    .or(page.locator('alert-banner'));

  await expect(notification).toBeVisible();

  // Close whichever notification type appeared
  await notification.locator('button.close').click();
});
```

#### Real-World: Dashboard Widget Filtering

```typescript
test('manage dashboard widgets with filtering', async ({ page }) => {
  await page.goto('https://example.com/dashboard');

  // Count widgets by status
  const errorWidgets = page
    .locator('dashboard-widget')
    .filter({ hasText: 'Error' });

  const loadingWidgets = page
    .locator('dashboard-widget')
    .filter({ hasText: 'Loading' });

  const activeWidgets = page
    .locator('dashboard-widget')
    .filter({ hasText: 'Active' })
    .filter({ hasNotText: 'Error' });

  console.log(`Errors: ${await errorWidgets.count()}`);
  console.log(`Loading: ${await loadingWidgets.count()}`);
  console.log(`Active: ${await activeWidgets.count()}`);

  // Refresh all error widgets
  const errorRefreshButtons = await errorWidgets
    .locator('button.refresh')
    .all();

  for (const button of errorRefreshButtons) {
    await button.click();
  }

  // Verify all widgets have data
  const allWidgets = await page.locator('dashboard-widget').all();

  for (const widget of allWidgets) {
    const hasData = await widget.locator('.data-display').isVisible();
    expect(hasData).toBeTruthy();
  }
});
```

#### Real-World: Product Card Selection

```typescript
test('select products with specific features', async ({ page }) => {
  await page.goto('https://example.com/products');

  // Find products with free shipping, in stock, and discounted
  const dealsWithFreeShipping = page
    .locator('product-card')
    .filter({ hasText: 'Free Shipping' })
    .filter({ hasText: 'In Stock' })
    .filter({ hasNotText: 'Out of Stock' })
    .filter({ has: page.locator('.discount-badge') });

  // Get all product names
  const products = await dealsWithFreeShipping.all();
  const productNames: string[] = [];

  for (const product of products) {
    // Access shadow DOM heading
    const name = await product.locator('h3.product-name').textContent();
    if (name) productNames.push(name);
  }

  console.log('Products with free shipping and discounts:', productNames);

  // Add first one to cart
  await dealsWithFreeShipping
    .first()
    .getByRole('button', { name: 'Add to cart' })
    .click();
});
```

#### Iterate and Filter Shadow Components

```typescript
test('iterate through filtered shadow components', async ({ page }) => {
  await page.goto('https://example.com/settings');

  // Get all settings cards that are editable
  const editableSettings = page
    .locator('settings-card')
    .filter({ has: page.getByRole('button', { name: 'Edit' }) });

  const cards = await editableSettings.all();

  for (const card of cards) {
    // Read setting name from shadow DOM
    const settingName = await card.locator('.setting-name').textContent();
    console.log(`Editable setting: ${settingName}`);

    // Check if it's enabled
    const isEnabled = await card.locator('.toggle').isChecked();
    if (!isEnabled) {
      await card.locator('.toggle').click();
    }
  }

  // Verify all editable settings are now enabled
  for (const card of cards) {
    await expect(card.locator('.toggle')).toBeChecked();
  }
});
```

### Mixing Shadow DOM and Regular DOM

```typescript
test('interact with mixed dom structure', async ({ page }) => {
  await page.goto('https://example.com');

  // Regular DOM element
  await page.getByRole('button', { name: 'Open Modal' }).click();

  // Shadow DOM in modal
  const modal = page.locator('custom-modal');
  const modalContent = modal.locator('.modal-content');
  await modalContent.getByRole('textbox', { name: 'Name' }).fill('John');

  // Regular DOM button in modal
  await page.getByRole('button', { name: 'Save' }).click();
});
```

### Dynamic Shadow Components

```typescript
test('handle dynamically created shadow components', async ({ page }) => {
  await page.goto('https://example.com');

  // Trigger component creation
  await page.getByRole('button', { name: 'Add Widget' }).click();

  // Wait for shadow component to be added
  const newWidget = page.locator('dynamic-widget').last();
  await expect(newWidget).toBeVisible();

  // Interact with newly created shadow content
  const input = newWidget.locator('input[type="text"]');
  await input.fill('Dynamic content');
});
```

### Shadow DOM with Slots

```typescript
test('interact with slotted content', async ({ page }) => {
  await page.goto('https://example.com/slots');

  // Access slotted light DOM content
  const widget = page.locator('slotted-widget');
  const slottedButton = widget.locator('[slot="actions"] button');
  await slottedButton.click();

  // Access shadow DOM content
  const shadowLabel = widget.locator('.widget-label');
  await expect(shadowLabel).toHaveText('Active');
});
```

## Debugging Shadow DOM

### Inspect Shadow Structure

```typescript
test('debug shadow dom structure', async ({ page }) => {
  await page.goto('https://example.com');

  const widget = page.locator('my-widget');

  // Log shadow content for debugging
  const innerHTML = await widget.evaluate((el) => {
    return el.shadowRoot?.innerHTML;
  });

  console.log('Shadow DOM content:', innerHTML);
});
```

### Check Shadow Root Mode

```typescript
test('check shadow root accessibility', async ({ page }) => {
  await page.goto('https://example.com');

  const isOpen = await page.locator('my-widget').evaluate((el) => {
    return el.shadowRoot !== null; // null means closed
  });

  console.log('Shadow root is open:', isOpen);
});
```

## Testing Strategies

### Strategy 1: Component-Level Testing

```typescript
test.describe('Custom Button Component', () => {
  test('renders with correct text', async ({ page }) => {
    await page.goto('https://example.com/components/button');

    const button = page.locator('custom-button');
    await expect(button.locator('.button-text')).toHaveText('Click Me');
  });

  test('handles click events', async ({ page }) => {
    await page.goto('https://example.com/components/button');

    const button = page.locator('custom-button');
    await button.locator('button').click();

    await expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});
```

### Strategy 2: Integration Testing

```typescript
test('complete form with shadow components', async ({ page }) => {
  await page.goto('https://example.com/form');

  // Regular input
  await page.getByLabel('Username').fill('testuser');

  // Shadow DOM date picker
  const datePicker = page.locator('custom-date-picker');
  await datePicker.locator('input').click();
  await datePicker.locator('[data-day="15"]').click();

  // Shadow DOM dropdown
  const dropdown = page.locator('custom-dropdown');
  await dropdown.locator('button.trigger').click();
  await dropdown.locator('[data-value="option1"]').click();

  // Submit
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText('Form submitted successfully')).toBeVisible();
});
```

## Performance Considerations

```typescript
// Reuse component instances when possible
test('efficient shadow dom access', async ({ page }) => {
  await page.goto('https://example.com');

  // Get reference once
  const widget = page.locator('my-widget');

  // Reuse for multiple operations
  await widget.locator('input').fill('value');
  await widget.locator('button.primary').click();
  await expect(widget.locator('.status')).toHaveText('Success');

  // Instead of re-locating each time
  // await page.locator('my-widget').locator('input').fill('value');
  // await page.locator('my-widget').locator('button.primary').click();
});
```

## Related Skills
- [Selector Strategies](../selector-strategies/SKILL.md) - Choosing effective selectors
- [Page Object Model](../page-object-model/SKILL.md) - Structuring component objects
- [Iframe Handling](../iframe-handling/SKILL.md) - Similar isolation patterns
- [Accessibility Testing](../accessibility-testing/SKILL.md) - Using ARIA roles in shadow DOM

## External Resources
- [MDN: Using Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [Playwright Shadow DOM Docs](https://playwright.dev/docs/selectors#pierce)
- [Web Components Specs](https://www.w3.org/TR/shadow-dom/)
