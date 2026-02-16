# Selector Strategies Skill

Comprehensive guide to writing resilient, accessible selectors for Playwright tests.

## Why This Matters

**Bad selectors cause:**
- Flaky tests that break when UI changes
- Slow tests (inefficient selectors)
- Accessibility issues (non-semantic selectors)
- Maintenance nightmares

**Good selectors provide:**
- Resilient tests that survive UI changes
- Fast, reliable test execution
- Accessibility validation built-in
- Self-documenting code

## Selector Priority Hierarchy

Use selectors in this order (top = best):

```
1. getByRole         ⭐ BEST - Accessibility-first, semantic
2. getByLabel        ⭐ Forms with labels
3. getByPlaceholder  ⭐ Forms without labels
4. getByText         ⚠️  Use sparingly - can be brittle
5. getByTestId       ⚠️  Last resort - requires code changes
6. CSS/XPath         ❌ AVOID - Brittle and non-accessible
```

---

## 1. getByRole (⭐ BEST - Use This First)

### Why It's Best
- Tests accessibility (if your test can find it, screen readers can too)
- Semantic and meaningful
- Resilient to CSS/structure changes
- Forces better HTML practices

### Common Roles

```typescript
// Buttons
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('button', { name: 'Cancel' }).click();

// Links
await page.getByRole('link', { name: 'View Details' }).click();
await page.getByRole('link', { name: /products/i }).click(); // Regex

// Form inputs
await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
await page.getByRole('textbox', { name: 'Password' }).fill('SecurePass123');

// Checkboxes & Radio
await page.getByRole('checkbox', { name: 'Remember me' }).check();
await page.getByRole('radio', { name: 'Priority shipping' }).click();

// Headings
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
await page.getByRole('heading', { level: 1, name: 'Welcome' }).waitFor();

// Lists
const items = page.getByRole('listitem');
await expect(items).toHaveCount(5);

// Tables
const table = page.getByRole('table');
const rows = page.getByRole('row');
const cells = page.getByRole('cell');

// Alerts/Status
await expect(page.getByRole('alert')).toHaveText('Error: Invalid input');
await expect(page.getByRole('status')).toHaveText('Loading...');

// Navigation
await page.getByRole('navigation').getByRole('link', { name: 'Home' }).click();

// Main content
await page.getByRole('main').waitFor();

// Complementary content (sidebars)
await page.getByRole('complementary').waitFor();
```

### Advanced getByRole Patterns

```typescript
// Combining with filters
await page
  .getByRole('button')
  .filter({ hasText: 'Delete' })
  .first()
  .click();

// Within a specific section
await page
  .getByRole('region', { name: 'Shopping Cart' })
  .getByRole('button', { name: 'Checkout' })
  .click();

// Multiple role options (when role might vary)
const submitButton = page.getByRole('button', { name: 'Submit' })
  .or(page.getByRole('link', { name: 'Submit' }));
```

### Full List of ARIA Roles

```
alert, alertdialog, application, article, banner, button,
cell, checkbox, columnheader, combobox, complementary,
contentinfo, definition, dialog, directory, document,
feed, figure, form, grid, gridcell, group, heading, img,
link, list, listbox, listitem, log, main, marquee, math,
menu, menubar, menuitem, menuitemcheckbox, menuitemradio,
navigation, none, note, option, presentation, progressbar,
radio, radiogroup, region, row, rowgroup, rowheader,
scrollbar, search, searchbox, separator, slider, spinbutton,
status, switch, tab, table, tablist, tabpanel, term,
textbox, timer, toolbar, tooltip, tree, treegrid, treeitem
```

---

## 2. getByLabel (⭐ Forms)

### When to Use
- Form inputs with associated `<label>` elements
- Best for accessible form testing

### Examples

```typescript
// Basic usage
await page.getByLabel('Email').fill('user@example.com');
await page.getByLabel('Password').fill('SecurePass123');
await page.getByLabel('Phone number').fill('555-1234');

// Checkboxes with labels
await page.getByLabel('I accept the terms').check();
await page.getByLabel('Subscribe to newsletter').uncheck();

// Radio buttons
await page.getByLabel('Standard shipping').click();
await page.getByLabel('Express shipping').click();

// Select dropdowns
await page.getByLabel('Country').selectOption('United States');
await page.getByLabel('State').selectOption({ label: 'Washington' });

// Partial matching
await page.getByLabel(/email/i).fill('user@example.com'); // Case-insensitive
```

### Common Patterns

```typescript
// Form with multiple fields
test('fill out registration form', async ({ page }) => {
  await page.getByLabel('First name').fill('John');
  await page.getByLabel('Last name').fill('Doe');
  await page.getByLabel('Date of birth').fill('1990-01-01');
  await page.getByLabel('Email address').fill('john@example.com');
  await page.getByLabel('Phone number').fill('555-0100');

  await page.getByRole('button', { name: 'Submit' }).click();
});
```

---

## 3. getByPlaceholder (Forms without labels)

### When to Use
- Input fields without visible labels
- When placeholder text is descriptive enough

### Examples

```typescript
// Basic usage
await page.getByPlaceholder('Enter your email').fill('user@example.com');
await page.getByPlaceholder('Search products...').fill('Laptop');

// Search bars
await page.getByPlaceholder('Search for items').fill('headphones');
await page.getByPlaceholder('Search for items').press('Enter');

// Partial matching
await page.getByPlaceholder(/search/i).fill('query');
```

⚠️ **Warning:** Prefer `getByLabel` when labels exist, as it's more accessible.

---

## 4. getByText (⚠️ Use Sparingly)

### When to Use
- Text content that's unique and unlikely to change
- Navigation items
- Status messages

### When NOT to Use
- Dynamic content (numbers, dates, user-generated content)
- Content that might be translated
- Content that changes frequently

### Examples

```typescript
// Good - Static, unique text
await page.getByText('Product Catalog').click();
await expect(page.getByText('Welcome back!')).toBeVisible();

// Acceptable - With exact match
await expect(page.getByText('Order confirmed', { exact: true })).toBeVisible();

// Good - Partial match for longer text
await expect(page.getByText(/successfully submitted/i)).toBeVisible();

// Bad - Numbers/dates change
await page.getByText('5 items in cart').click(); // Brittle!

// Bad - User-generated content
await page.getByText('John Smith').click(); // What if name changes?
```

### Better Alternatives to getByText

```typescript
// Bad
await page.getByText('Submit').click();

// Better
await page.getByRole('button', { name: 'Submit' }).click();

// Bad
await page.getByText('Email').click();

// Better
await page.getByLabel('Email').click();
```

---

## 5. getByTestId (⚠️ Last Resort)

### When to Use
- Complex components with no better selectors
- Dynamic content where role/label isn't practical
- Third-party components you don't control

### Setup

```html
<!-- Add data-testid to HTML -->
<div data-testid="product-card-123">
  <h3>Wireless Headphones</h3>
  <button>Add to Cart</button>
</div>
```

```typescript
// Use in tests
await page.getByTestId('product-card-123').click();
await expect(page.getByTestId('product-card-123')).toBeVisible();

// Combine with other selectors
await page
  .getByTestId('product-list')
  .getByRole('button', { name: 'Add to Cart' })
  .click();
```

### TestId Naming Conventions

```typescript
// Good - Descriptive, kebab-case
data-testid="product-card-123"
data-testid="user-search-results"
data-testid="checkout-form"

// Bad - Not descriptive
data-testid="card1"
data-testid="div"
data-testid="component"
```

---

## 6. CSS Selectors & XPath (❌ AVOID)

### Why to Avoid

```typescript
// BAD - Brittle CSS selectors
await page.locator('#submit-btn').click();
await page.locator('.form-input[name="email"]').fill('user@example.com');
await page.locator('div > div > button:nth-child(2)').click();

// WORSE - XPath
await page.locator('//div[@class="container"]/button[1]').click();

// GOOD - Accessible selectors
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('user@example.com');
```

### Only Acceptable Use Cases

```typescript
// Acceptable - Targeting by attribute when no better option
await page.locator('[data-automation-id="legacy-component"]').click();

// Acceptable - Complex CSS for specific edge cases
await page.locator('input[type="hidden"][name="csrf"]').getAttribute('value');
```

---

## Chaining Selectors

### Scoping with Locators

```typescript
// Find button within a specific section
await page
  .getByRole('region', { name: 'User Profile' })
  .getByRole('button', { name: 'Edit' })
  .click();

// Find item in a list
await page
  .getByRole('list')
  .getByRole('listitem')
  .filter({ hasText: 'Product #123' })
  .getByRole('button', { name: 'Buy Now' })
  .click();

// Navigate through component hierarchy
await page
  .getByRole('main')
  .getByRole('article')
  .first()
  .getByRole('link', { name: 'Read more' })
  .click();
```

### Filtering and Locator Combinations

Filtering allows you to narrow down locators to match specific conditions. Playwright provides powerful filtering methods for precise element selection.

#### Filter by Text Content

```typescript
// Filter by having specific text
await page
  .getByRole('listitem')
  .filter({ hasText: 'Active' })
  .first()
  .click();

// Filter by NOT having specific text
await expect(
  page.getByRole('listitem').filter({ hasNotText: 'Out of stock' })
).toHaveCount(5);

// Filter with regex
await page
  .getByRole('listitem')
  .filter({ hasText: /Product \d+/ })
  .first()
  .click();
```

#### Filter by Child/Descendant Elements

```typescript
// Filter by having a specific child element
await page
  .getByRole('listitem')
  .filter({ has: page.getByRole('button', { name: 'Delete' }) })
  .click();

// Filter by NOT having a specific child element
await expect(
  page.getByRole('listitem').filter({ hasNot: page.getByText('Disabled') })
).toHaveCount(3);

// Filter by having multiple children
const productCard = page
  .getByRole('article')
  .filter({ has: page.getByRole('heading', { name: 'Product 2' }) })
  .filter({ has: page.getByRole('button', { name: 'Add to cart' }) });
```

#### Combine Multiple Locators (AND Logic)

```typescript
// Element must match BOTH conditions
const subscribeButton = page
  .getByRole('button')
  .and(page.getByTitle('Subscribe to newsletter'));

await subscribeButton.click();

// Useful when you need to be very specific
const primaryDeleteButton = page
  .getByRole('button', { name: 'Delete' })
  .and(page.locator('.primary-action'));

// Combining role and test ID
const submitButton = page
  .getByRole('button', { name: 'Submit' })
  .and(page.getByTestId('submit-form'));
```

#### Alternative Locators (OR Logic)

```typescript
// Match EITHER condition - useful for conditional UI
const newEmail = page.getByRole('button', { name: 'New' });
const dialog = page.getByText('Confirm security settings');

// Whichever appears first
await expect(newEmail.or(dialog).first()).toBeVisible();

// Fallback pattern when button text varies
const submitButton = page
  .getByRole('button', { name: 'Submit' })
  .or(page.getByRole('button', { name: 'Send' }))
  .or(page.getByRole('button', { name: 'Confirm' }));

// Close button might be in different locations
const closeButton = page
  .getByRole('dialog')
  .getByRole('button', { name: 'Close' })
  .or(page.getByRole('button', { name: 'X' }));
```

#### Chain Multiple Filters

```typescript
// Complex filtering for precise targeting
const expensiveAvailableProduct = page
  .getByRole('listitem')
  .filter({ hasNotText: 'Out of stock' })
  .filter({ hasNotText: 'Coming Soon' })
  .filter({ hasText: /\$[1-9][0-9]{2,}/ }) // $100+
  .filter({ has: page.getByRole('button', { name: 'Add to cart' }) })
  .first();

// Find active, non-error widgets
const healthyWidgets = page
  .locator('.dashboard-widget')
  .filter({ hasText: 'Active' })
  .filter({ hasNotText: 'Error' })
  .filter({ hasNot: page.locator('.error-badge') });
```

### Working with Multiple Elements (List Operations)

#### Selecting Specific Items

```typescript
// Get first matching element
await page.getByRole('listitem').first().click();

// Get last matching element
await page.getByRole('listitem').last().click();

// Get by index (zero-based)
await page.getByRole('listitem').nth(1).click(); // Second item
await page.getByRole('listitem').nth(0).click(); // First item (same as .first())

// Negative indices work too
await page.getByRole('listitem').nth(-1).click(); // Last item (same as .last())
```

#### Counting Elements

```typescript
// Get count of matching elements
const itemCount = await page.getByRole('listitem').count();
expect(itemCount).toBeGreaterThan(0);

// Assert exact count
await expect(page.getByRole('listitem')).toHaveCount(5);

// Count with filtering
const activeItems = await page
  .getByRole('listitem')
  .filter({ hasText: 'Active' })
  .count();
```

#### Iterating Through Elements

```typescript
// Using .all() for iteration
const items = await page.getByRole('listitem').all();

for (const item of items) {
  const text = await item.textContent();
  console.log(text);
}

// Find specific item by iterating
for (const item of items) {
  const hasDeleteButton = await item
    .getByRole('button', { name: 'Delete' })
    .isVisible();

  if (hasDeleteButton) {
    await item.getByRole('button', { name: 'Delete' }).click();
    break;
  }
}

// Process all items
const products = await page.getByRole('article').all();
const productNames: string[] = [];

for (const product of products) {
  const name = await product.getByRole('heading').textContent();
  if (name) productNames.push(name);
}
```

#### Assertions on Lists

```typescript
// Assert count
await expect(page.getByRole('listitem')).toHaveCount(5);

// Assert all text content in order
await expect(page.getByRole('listitem')).toHaveText([
  'Apple',
  'Banana',
  'Orange',
  'Mango',
  'Grape'
]);

// Assert count range
const products = page.getByRole('listitem');
expect(await products.count()).toBeGreaterThan(3);
expect(await products.count()).toBeLessThan(10);

// Assert all items contain specific text
const items = await page.getByRole('listitem').all();
for (const item of items) {
  await expect(item).toContainText('Price:');
}
```

### Real-World Filtering Scenarios

#### E-commerce Product Lists

```typescript
// Find in-stock products in specific price range
const affordableInStockProducts = page
  .getByRole('article') // Product cards
  .filter({ hasNotText: 'Out of stock' })
  .filter({ hasNotText: 'Pre-order' })
  .filter({ hasText: /\$[1-5][0-9]/ }); // $10-$59

// Click "Add to Cart" on first available product
await affordableInStockProducts
  .first()
  .getByRole('button', { name: 'Add to cart' })
  .click();

// Find products with free shipping
const freeShippingProducts = page
  .getByRole('article')
  .filter({ has: page.getByText('Free Shipping') })
  .filter({ hasNotText: 'Out of stock' });

await expect(freeShippingProducts).toHaveCount(8);
```

#### Table Row Selection

```typescript
// Find table row containing specific data
const userRow = page
  .getByRole('row')
  .filter({ has: page.getByRole('cell', { name: 'john@example.com' }) });

await userRow.getByRole('button', { name: 'Edit' }).click();

// Select rows that DON'T have a delete button (system users)
const systemUsers = page
  .getByRole('row')
  .filter({ hasNot: page.getByRole('button', { name: 'Delete' }) });

await expect(systemUsers).toHaveCount(3);

// Find rows with specific status
const activeUsers = page
  .getByRole('row')
  .filter({ has: page.getByRole('cell', { name: 'Active' }) })
  .filter({ hasNot: page.getByRole('cell', { name: 'Suspended' }) });
```

#### Dashboard Cards

```typescript
// Find active, non-error widgets
const healthyWidgets = page
  .locator('.dashboard-widget')
  .filter({ hasText: 'Active' })
  .filter({ hasNotText: 'Error' })
  .filter({ hasNot: page.locator('.error-badge') });

// Verify all healthy widgets have refresh button
for (const widget of await healthyWidgets.all()) {
  await expect(widget.getByRole('button', { name: 'Refresh' })).toBeVisible();
}

// Count widgets by status
const errorWidgets = page.locator('.dashboard-widget').filter({ hasText: 'Error' });
const loadingWidgets = page.locator('.dashboard-widget').filter({ hasText: 'Loading' });
const activeWidgets = page.locator('.dashboard-widget').filter({ hasText: 'Active' });

console.log(`Error: ${await errorWidgets.count()}`);
console.log(`Loading: ${await loadingWidgets.count()}`);
console.log(`Active: ${await activeWidgets.count()}`);
```

#### Conditional UI Handling

```typescript
// Handle either modal dialog OR inline notification
const notification = page
  .getByRole('dialog', { name: 'Success' })
  .or(page.getByRole('status', { name: 'Success' }));

await expect(notification).toBeVisible();

// Close whichever appeared
const closeButton = notification
  .getByRole('button', { name: 'Close' })
  .or(notification.getByRole('button', { name: 'Dismiss' }))
  .or(notification.getByRole('button', { name: 'OK' }));

await closeButton.click();

// Handle different submit button texts across locales
const submitButton = page
  .getByRole('button', { name: 'Submit' })
  .or(page.getByRole('button', { name: 'Send' }))
  .or(page.getByRole('button', { name: 'Enviar' })) // Spanish
  .or(page.getByRole('button', { name: 'Soumettre' })); // French
```

#### Form Validation States

```typescript
// Find fields with errors
const fieldsWithErrors = page
  .locator('input')
  .filter({ has: page.locator('.error-message') });

const errorCount = await fieldsWithErrors.count();
console.log(`Found ${errorCount} fields with errors`);

// Find required fields that are empty
const requiredInputs = page
  .locator('input[required]')
  .filter({ hasNot: page.locator('[value]') });

// Or using evaluation
const emptyRequired = page.locator('input[required]').filter({
  has: page.locator(':blank')
});

// Find fields that are valid
const validFields = page
  .locator('input')
  .filter({ hasNot: page.locator('.error-message') })
  .filter({ hasText: '' }); // No error text
```

---

## Decision Tree: Which Selector to Use?

```
Is it a button, link, or form element?
├─ YES → Use getByRole
│
└─ NO → Is it a form input with a label?
   ├─ YES → Use getByLabel
   │
   └─ NO → Is it a form input with a placeholder?
      ├─ YES → Use getByPlaceholder
      │
      └─ NO → Is it unique text content?
         ├─ YES → Use getByText (with caution)
         │
         └─ NO → Can you add data-testid?
            ├─ YES → Use getByTestId
            │
            └─ NO → Use CSS selector (last resort)
```

---

## Using Playwright Codegen Effectively

Use Playwright's built-in tools for selector discovery:

### Generate Selectors

```bash
# Launch codegen
npx playwright codegen https://your-app.com

# Codegen with device emulation
npx playwright codegen --device="iPhone 13" https://your-app.com

# Codegen with custom viewport
npx playwright codegen --viewport-size=1280,720 https://your-app.com
```

### Debug Existing Tests

```bash
# Run test in debug mode
npx playwright test --debug

# Run specific test in debug mode
npx playwright test login.spec.ts --debug
```

### Inspector for Selector Testing

```typescript
// Add this to pause test and inspect
await page.pause();
```

---

## Real-World Examples

### Example 1: E-Commerce Add to Cart

```typescript
test('add product to cart', async ({ page }) => {
  // Navigate to products (using accessible link)
  await page.getByRole('navigation').getByRole('link', { name: 'Products' }).click();

  // Wait for products to load (using semantic heading)
  await page.getByRole('heading', { name: 'Our Products' }).waitFor();

  // Find specific product in list (scoped searching)
  const productCard = page
    .getByRole('article')
    .filter({ hasText: 'Wireless Headphones' });

  // Click add to cart button within that card
  await productCard.getByRole('button', { name: 'Add to Cart' }).click();

  // Verify confirmation modal (using dialog role)
  const modal = page.getByRole('dialog');
  await expect(modal.getByRole('heading', { name: 'Added to Cart' })).toBeVisible();

  // Continue shopping
  await modal.getByRole('button', { name: 'Continue Shopping' }).click();

  // Verify cart count updated
  await expect(page.getByRole('status', { name: 'Cart items' })).toHaveText('1');
});
```

### Example 2: User Search

```typescript
test('search for user', async ({ page }) => {
  // Use search input (by label or placeholder)
  await page.getByLabel('Search users').fill('John Doe');

  // Or if no label:
  // await page.getByPlaceholder('Enter user name').fill('John Doe');

  // Submit search (accessible button)
  await page.getByRole('button', { name: 'Search' }).click();

  // Wait for results (semantic region)
  await page.getByRole('region', { name: 'Search Results' }).waitFor();

  // Verify results exist
  const results = page.getByRole('listitem');
  await expect(results.first()).toBeVisible();

  // Click on first result
  await results.first().getByRole('link', { name: 'View Profile' }).click();
});
```

### Example 3: Form Submission

```typescript
test('submit contact form', async ({ page }) => {
  // Fill form using labels (most accessible)
  await page.getByLabel('First name').fill('Jane');
  await page.getByLabel('Last name').fill('Smith');
  await page.getByLabel('Email').fill('jane.smith@example.com');
  await page.getByLabel('Phone').fill('555-0199');
  await page.getByLabel('Message').fill('I have a question about your products.');

  // Select dropdown
  await page.getByLabel('Subject').selectOption('Product Inquiry');

  // Check checkbox
  await page.getByLabel('I agree to the terms and conditions').check();

  // Submit form
  await page.getByRole('button', { name: 'Submit' }).click();

  // Verify success
  await expect(page.getByRole('alert')).toHaveText('Message sent successfully');
});
```

---

## Testing Selector Resilience

### Good Test: Survives UI Changes

```typescript
// This test survives:
// - CSS class changes
// - HTML structure changes
// - Element ID changes
test('resilient test', async ({ page }) => {
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('alert')).toHaveText('Success');
});
```

### Bad Test: Breaks Easily

```typescript
// This test breaks if:
// - CSS classes change
// - HTML structure changes
// - Element IDs change
test('brittle test', async ({ page }) => {
  await page.locator('#submit-btn').click();
  await page.locator('div.message.success').waitFor();
});
```

---

## Quick Reference

### Selector Preference Order

1. ⭐ `getByRole` - Buttons, links, form elements, headings
2. ⭐ `getByLabel` - Form inputs with labels
3. ⭐ `getByPlaceholder` - Form inputs without labels
4. ⚠️ `getByText` - Unique, static text (use sparingly)
5. ⚠️ `getByTestId` - Last resort
6. ❌ CSS/XPath - Avoid unless absolutely necessary

### Common Selectors Cheat Sheet

```typescript
// Buttons
page.getByRole('button', { name: 'Text' })

// Links
page.getByRole('link', { name: 'Text' })

// Inputs
page.getByRole('textbox', { name: 'Label' })
page.getByLabel('Label')

// Checkboxes
page.getByRole('checkbox', { name: 'Label' })

// Headings
page.getByRole('heading', { name: 'Text' })

// Lists
page.getByRole('list')
page.getByRole('listitem')

// Alerts
page.getByRole('alert')

// Regions
page.getByRole('region', { name: 'Region Name' })
```

---

## Related Resources

- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
- [Accessibility Testing](../accessibility-testing/SKILL.md)
- [Playwright Locators Documentation](https://playwright.dev/docs/locators)
