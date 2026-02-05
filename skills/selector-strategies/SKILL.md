# Selector Strategies Skill

Comprehensive guide to writing resilient, accessible selectors for Playwright tests. Better than relying on MCP servers!

## Why This Matters

**Bad selectors cause:**
- ❌ Flaky tests that break when UI changes
- ❌ Slow tests (inefficient selectors)
- ❌ Accessibility issues (non-semantic selectors)
- ❌ Maintenance nightmares

**Good selectors provide:**
- ✅ Resilient tests that survive UI changes
- ✅ Fast, reliable test execution
- ✅ Accessibility validation built-in
- ✅ Self-documenting code

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
- ✅ Tests accessibility (if your test can find it, screen readers can too)
- ✅ Semantic and meaningful
- ✅ Resilient to CSS/structure changes
- ✅ Forces better HTML practices

### Common Roles

```typescript
// Buttons
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('button', { name: 'Cancel' }).click();

// Links
await page.getByRole('link', { name: 'View Details' }).click();
await page.getByRole('link', { name: /prescriptions/i }).click(); // Regex

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
  .getByRole('region', { name: 'Prescriptions' })
  .getByRole('button', { name: 'Refill' })
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
test('fill out patient form', async ({ page }) => {
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
await page.getByPlaceholder('Search medications...').fill('Lisinopril');

// Search bars
await page.getByPlaceholder('Search prescriptions').fill('123456');
await page.getByPlaceholder('Search prescriptions').press('Enter');

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
// ✅ Good - Static, unique text
await page.getByText('Prescription History').click();
await expect(page.getByText('Welcome back!')).toBeVisible();

// ⚠️ Acceptable - With exact match
await expect(page.getByText('Order confirmed', { exact: true })).toBeVisible();

// ✅ Good - Partial match for longer text
await expect(page.getByText(/successfully submitted/i)).toBeVisible();

// ❌ Bad - Numbers/dates change
await page.getByText('5 prescriptions').click(); // Brittle!

// ❌ Bad - User-generated content
await page.getByText('Dr. Smith').click(); // What if name changes?
```

### Better Alternatives to getByText

```typescript
// ❌ Bad
await page.getByText('Submit').click();

// ✅ Better
await page.getByRole('button', { name: 'Submit' }).click();

// ❌ Bad
await page.getByText('Email').click();

// ✅ Better
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
<div data-testid="prescription-card-123">
  <h3>Lisinopril 10mg</h3>
  <button>Refill</button>
</div>
```

```typescript
// Use in tests
await page.getByTestId('prescription-card-123').click();
await expect(page.getByTestId('prescription-card-123')).toBeVisible();

// Combine with other selectors
await page
  .getByTestId('prescription-list')
  .getByRole('button', { name: 'Refill' })
  .click();
```

### TestId Naming Conventions

```typescript
// ✅ Good - Descriptive, kebab-case
data-testid="prescription-card-123"
data-testid="patient-search-results"
data-testid="payment-method-form"

// ❌ Bad - Not descriptive
data-testid="card1"
data-testid="div"
data-testid="component"
```

---

## 6. CSS Selectors & XPath (❌ AVOID)

### Why to Avoid

```typescript
// ❌ BAD - Brittle CSS selectors
await page.locator('#submit-btn').click();
await page.locator('.form-input[name="email"]').fill('user@example.com');
await page.locator('div > div > button:nth-child(2)').click();

// ❌ WORSE - XPath
await page.locator('//div[@class="container"]/button[1]').click();

// ✅ GOOD - Accessible selectors
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('user@example.com');
```

### Only Acceptable Use Cases

```typescript
// ✅ Acceptable - Targeting by attribute when no better option
await page.locator('[data-automation-id="legacy-component"]').click();

// ✅ Acceptable - Complex CSS for specific edge cases
await page.locator('input[type="hidden"][name="csrf"]').getAttribute('value');
```

---

## Chaining Selectors

### Scoping with Locators

```typescript
// Find button within a specific section
await page
  .getByRole('region', { name: 'Patient Information' })
  .getByRole('button', { name: 'Edit' })
  .click();

// Find item in a list
await page
  .getByRole('list')
  .getByRole('listitem')
  .filter({ hasText: 'Prescription #123' })
  .getByRole('button', { name: 'Refill' })
  .click();

// Navigate through component hierarchy
await page
  .getByRole('main')
  .getByRole('article')
  .first()
  .getByRole('link', { name: 'Read more' })
  .click();
```

### Filtering

```typescript
// Filter by text content
await page
  .getByRole('listitem')
  .filter({ hasText: 'Active' })
  .first()
  .click();

// Filter by another selector
await page
  .getByRole('button')
  .filter({ has: page.getByText('Delete') })
  .click();

// Filter with NOT
await page
  .getByRole('button')
  .filter({ hasNot: page.getByText('Disabled') })
  .click();
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

Instead of MCP servers, use Playwright's built-in tools:

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

### Example 1: Pharmacy Prescription Refill

```typescript
test('refill prescription', async ({ page }) => {
  // Navigate to prescriptions (using accessible link)
  await page.getByRole('navigation').getByRole('link', { name: 'Prescriptions' }).click();
  
  // Wait for prescriptions to load (using semantic heading)
  await page.getByRole('heading', { name: 'Your Prescriptions' }).waitFor();
  
  // Find specific prescription in list (scoped searching)
  const prescriptionCard = page
    .getByRole('article')
    .filter({ hasText: 'Lisinopril 10mg' });
  
  // Click refill button within that card
  await prescriptionCard.getByRole('button', { name: 'Refill' }).click();
  
  // Verify confirmation modal (using dialog role)
  const modal = page.getByRole('dialog');
  await expect(modal.getByRole('heading', { name: 'Confirm Refill' })).toBeVisible();
  
  // Confirm refill
  await modal.getByRole('button', { name: 'Confirm' }).click();
  
  // Verify success message
  await expect(page.getByRole('alert')).toHaveText('Prescription refill requested successfully');
});
```

### Example 2: Patient Search

```typescript
test('search for patient', async ({ page }) => {
  // Use search input (by label or placeholder)
  await page.getByLabel('Search patients').fill('John Doe');
  
  // Or if no label:
  // await page.getByPlaceholder('Enter patient name').fill('John Doe');
  
  // Submit search (accessible button)
  await page.getByRole('button', { name: 'Search' }).click();
  
  // Wait for results (semantic region)
  await page.getByRole('region', { name: 'Search Results' }).waitFor();
  
  // Verify result count
  const results = page.getByRole('listitem');
  await expect(results).toHaveCount.greaterThan(0);
  
  // Click on first result
  await results.first().getByRole('link', { name: 'View Details' }).click();
});
```

### Example 3: Form Submission

```typescript
test('submit patient form', async ({ page }) => {
  // Fill form using labels (most accessible)
  await page.getByLabel('First name').fill('Jane');
  await page.getByLabel('Last name').fill('Smith');
  await page.getByLabel('Date of birth').fill('1985-06-15');
  await page.getByLabel('Email').fill('jane.smith@example.com');
  await page.getByLabel('Phone').fill('555-0199');
  
  // Select dropdown
  await page.getByLabel('Insurance provider').selectOption('Blue Cross');
  
  // Check checkbox
  await page.getByLabel('I agree to the terms and conditions').check();
  
  // Submit form
  await page.getByRole('button', { name: 'Submit' }).click();
  
  // Verify success
  await expect(page.getByRole('alert')).toHaveText('Patient information saved successfully');
});
```

---

## Testing Selector Resilience

### Good Test: Survives UI Changes

```typescript
// ✅ This test survives:
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
// ❌ This test breaks if:
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
