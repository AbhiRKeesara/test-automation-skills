# Filtering and Locator Improvements Summary

This document summarizes the comprehensive filtering and locator combination patterns added to the skills repository based on Playwright's official documentation.

## Overview

The repository has been enhanced with complete coverage of Playwright's filtering and locator combination methods, addressing gaps in the original documentation.

## What Was Added

### 1. Enhanced Selector Strategies Skill (`skills/selector-strategies/SKILL.md`)

#### New Filtering Methods Documented

**Text-Based Filtering:**
- ✅ `filter({ hasText })` - Filter by containing specific text
- ✅ `filter({ hasNotText })` - **NEW** - Filter by NOT containing text
- ✅ Regex patterns in filters

**Child/Descendant Filtering:**
- ✅ `filter({ has })` - Filter by containing specific child elements
- ✅ `filter({ hasNot })` - Filter by NOT containing specific child elements
- ✅ Chaining multiple filters for complex conditions

**Locator Combinations:**
- ✅ `.and()` - **NEW** - Combine locators with AND logic (both must match)
- ✅ `.or()` - **EXPANDED** - Alternative locators with OR logic (either can match)

#### New List Operations Section

- ✅ `.first()` - Get first matching element
- ✅ `.last()` - Get last matching element
- ✅ `.nth(index)` - Get element by index (supports negative indices)
- ✅ `.count()` - Get count of matching elements
- ✅ `.all()` - Get all elements for iteration

#### Real-World Filtering Scenarios

Added practical examples for:
- E-commerce product filtering (price, availability, shipping)
- Table row selection by cell content
- Dashboard widget management by status
- Conditional UI handling (modal vs toast notifications)
- Form validation state filtering

**Total Addition:** ~400 lines of comprehensive filtering documentation

### 2. Enhanced Shadow DOM Skill (`skills/shadow-dom-handling/SKILL.md`)

#### New Filtering Section

Added comprehensive section on filtering web components:
- Filter shadow components by text content
- Filter by shadow DOM children
- Combine filters for precise component selection
- AND/OR logic with shadow components
- Real-world dashboard and product card filtering
- Iteration through filtered shadow components

**Examples:**
```typescript
// Filter web components by shadow content
const activeWidgets = page
  .locator('custom-widget')
  .filter({ hasText: 'Active' })
  .filter({ hasNotText: 'Error' });

// Filter by shadow DOM children
const widgetsWithButton = page
  .locator('custom-widget')
  .filter({ has: page.locator('button.primary') });
```

**Total Addition:** ~250 lines of shadow DOM filtering patterns

### 3. New Example File

Created `examples/good-practices/advanced-filtering-patterns.spec.ts`:
- 20+ comprehensive test examples
- Text-based filtering patterns
- Child/descendant filtering
- AND/OR logic demonstrations
- List operations
- Real-world scenarios (e-commerce, tables, dashboards, forms)

**Total Addition:** ~500 lines of runnable examples

## Key Improvements Summary

| Area | Before | After | Impact |
|------|--------|-------|--------|
| **Text Filtering** | Basic `hasText` only | Added `hasNotText`, regex patterns | Complete coverage |
| **Child Filtering** | Basic examples | Added `hasNot`, complex chaining | Advanced scenarios |
| **Locator Combinations** | Brief `.or()` mention | Full `.and()` + expanded `.or()` | Critical feature added |
| **List Operations** | None | Complete section with all methods | Essential patterns |
| **Real-World Examples** | Limited | 10+ practical scenarios | Practical application |
| **Shadow DOM Filtering** | Not covered | Comprehensive section | Modern web support |

## Methods Now Fully Documented

### Filtering Methods
| Method | Purpose | Example |
|--------|---------|---------|
| `filter({ hasText })` | Contains text | Find products with "Free Shipping" |
| `filter({ hasNotText })` | Doesn't contain text | Exclude "Out of stock" items |
| `filter({ has })` | Contains child element | Rows with delete button |
| `filter({ hasNot })` | Doesn't contain child | Rows without error icon |

### Combination Methods
| Method | Purpose | Example |
|--------|---------|---------|
| `.and()` | Both must match (AND) | Button with role AND test ID |
| `.or()` | Either can match (OR) | Modal OR toast notification |

### List Methods
| Method | Purpose | Example |
|--------|---------|---------|
| `.first()` | First element | Click first product |
| `.last()` | Last element | Get last item text |
| `.nth(n)` | Element by index | Select third item (nth(2)) |
| `.count()` | Count elements | Verify item count |
| `.all()` | All for iteration | Loop through products |

## Real-World Use Cases Added

### 1. E-commerce Product Filtering
```typescript
const affordableInStockProducts = page
  .getByRole('article')
  .filter({ hasNotText: 'Out of stock' })
  .filter({ hasNotText: 'Pre-order' })
  .filter({ hasText: /\$[1-5][0-9]/ }); // $10-$59
```

### 2. Table Row Selection
```typescript
const userRow = page
  .getByRole('row')
  .filter({ has: page.getByRole('cell', { name: 'john@example.com' }) });
```

### 3. Dashboard Widget Management
```typescript
const healthyWidgets = page
  .locator('.dashboard-widget')
  .filter({ hasText: 'Active' })
  .filter({ hasNotText: 'Error' })
  .filter({ hasNot: page.locator('.error-badge') });
```

### 4. Conditional UI Handling
```typescript
const notification = page
  .getByRole('dialog', { name: 'Success' })
  .or(page.getByRole('status', { name: 'Success' }));
```

### 5. Form Validation States
```typescript
const invalidFields = page
  .locator('input')
  .filter({ has: page.locator('.error-message') });
```

## How This Helps Conversions

### Puppeteer → Playwright Shadow DOM
```typescript
// Puppeteer - manual filtering
const cards = await page.$$('custom-card');
const activeCard = cards.find(async card => {
  const shadowRoot = await card.evaluateHandle(el => el.shadowRoot);
  const status = await shadowRoot.$('.status');
  return await status.textContent() === 'Active';
});

// Playwright - declarative filtering
const activeCard = page
  .locator('custom-card')
  .filter({ hasText: 'Active' });
```

### Complex Conditional Logic
```typescript
// Before - multiple if statements
let button;
if (await page.getByRole('button', { name: 'Submit' }).isVisible()) {
  button = page.getByRole('button', { name: 'Submit' });
} else if (await page.getByRole('button', { name: 'Send' }).isVisible()) {
  button = page.getByRole('button', { name: 'Send' });
}

// After - declarative OR
const button = page
  .getByRole('button', { name: 'Submit' })
  .or(page.getByRole('button', { name: 'Send' }));
```

## Integration with Existing Skills

The new filtering patterns integrate seamlessly with:

| Existing Skill | Integration Point | Benefit |
|----------------|-------------------|---------|
| Shadow DOM Handling | Filter web components | Test modern component libraries |
| Page Object Model | Cleaner component selection | More maintainable selectors |
| Action Utilities | Precise element targeting | Fewer false positives |
| Iframe Handling | Filter frame content | Complex frame scenarios |
| Selector Strategies | Complete toolbox | All selection patterns covered |

## Documentation Quality Improvements

### Before
- Basic filtering mentioned
- Limited real-world examples
- Missing critical methods (`and()`, `hasNotText`)
- No list operations
- Shadow DOM filtering not covered

### After
- Complete filtering coverage
- 10+ real-world scenarios
- All methods fully documented with examples
- Comprehensive list operations section
- Shadow DOM filtering fully integrated

## Skills Updated

1. ✅ **selector-strategies/SKILL.md** (+400 lines)
   - Expanded filtering section
   - New list operations section
   - Real-world scenarios section

2. ✅ **shadow-dom-handling/SKILL.md** (+250 lines)
   - New filtering shadow components section
   - Real-world web component examples

3. ✅ **examples/good-practices/** (+1 new file)
   - advanced-filtering-patterns.spec.ts (500+ lines)

## Total Impact

- **Lines Added:** ~1,150 lines of documentation and examples
- **Methods Documented:** 10+ filtering and list methods
- **Real-World Examples:** 15+ practical scenarios
- **Test Examples:** 20+ runnable test cases

## What Questions Can Now Be Answered

With these improvements, the skills repository can now help with:

1. ✅ "How do I find elements that DON'T contain specific text?"
2. ✅ "How do I combine multiple conditions with AND logic?"
3. ✅ "How do I handle conditional UI (modal OR toast)?"
4. ✅ "How do I filter web components by their shadow DOM content?"
5. ✅ "How do I iterate through a filtered list of elements?"
6. ✅ "How do I select the first/last/nth element?"
7. ✅ "How do I find table rows by cell content?"
8. ✅ "How do I filter products by price, availability, and features?"
9. ✅ "How do I manage dashboard widgets by status?"
10. ✅ "How do I convert complex Puppeteer filtering to Playwright?"

## Comparison with Advanced Patterns Integration

| Aspect | Advanced Patterns (Previous) | Filtering Improvements (This) |
|--------|------------------------------|-------------------------------|
| Focus | Advanced interactions | Advanced selection |
| New Skills | 3 (iframe, shadow DOM, dialogs) | 0 (enhanced existing) |
| Lines Added | ~6,000 | ~1,150 |
| Documentation | New topics | Deepened existing |
| Examples | 4 new files | 1 comprehensive file |
| Source | Playwright best practices | Official locators docs |

## Next Steps Recommendations

Consider adding:
1. **Filtering performance guide** - When to use which filter method
2. **Accessibility + filtering** - Combining ARIA with filters
3. **Custom filter functions** - Advanced filtering with evaluate
4. **Migration examples** - More Puppeteer/Selenium → Playwright filtering conversions

---

**Added:** February 15, 2026
**Source:** Playwright Official Documentation - Locators Guide
**Related:** ADVANCED-PATTERNS-INTEGRATION.md for complementary improvements
