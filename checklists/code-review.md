# Code Review Checklist

Use this checklist before committing code or during PR reviews.

## Quick Check (2 minutes)

- [ ] Tests pass locally (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Code is formatted (`npm run format:check`)

## Test Quality (5 minutes)

### Test Isolation
- [ ] Test doesn't depend on other tests
- [ ] Test has its own setup
- [ ] Test cleans up after itself (if needed)
- [ ] Can run test alone: `npx playwright test path/to/test.spec.ts`

### Assertions
- [ ] Test has explicit assertions (`expect` statements)
- [ ] Assertions verify expected outcomes
- [ ] No test that only performs actions without verification

### Naming
- [ ] Test name clearly describes what it tests
- [ ] Test name follows pattern: "user can [action]" or "[action] shows [result]"
- [ ] File name is descriptive and kebab-case (`create-prescription.spec.ts`)

## Selector Quality (3 minutes)

### Selector Priority
- [ ] Uses `getByRole` for interactive elements
- [ ] Uses `getByLabel` for form inputs
- [ ] Uses `getByText` for text content
- [ ] Uses `getByTestId` only when necessary
- [ ] Avoids CSS selectors (`.class`, `#id`, `div > button`)
- [ ] Avoids XPath selectors

### Selector Stability
- [ ] Selectors are resilient to UI changes
- [ ] Selectors don't rely on implementation details
- [ ] Selectors reflect how users interact with the page

**Examples:**
```typescript
// ✅ GOOD
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('user@test.com');

// ❌ BAD
await page.locator('#submit-btn').click();
await page.locator('.form-input:nth-child(2)').fill('user@test.com');
```

## No Hard-Coded Waits (1 minute)

- [ ] No `page.waitForTimeout()` calls
- [ ] Uses assertions instead: `await expect(...).toBeVisible()`
- [ ] Uses `waitForURL()` for navigation
- [ ] Uses `waitForLoadState()` if absolutely necessary

**Examples:**
```typescript
// ❌ BAD
await page.click('#button');
await page.waitForTimeout(2000);
await page.click('#next');

// ✅ GOOD
await page.getByRole('button', { name: 'Next' }).click();
await expect(page.getByText('Success')).toBeVisible();
```

## TypeScript Quality (3 minutes)

### Types
- [ ] No `any` types
- [ ] Function return types specified
- [ ] Variables have explicit types when not obvious
- [ ] Imports are properly typed

### Async/Await
- [ ] All Playwright calls use `await`
- [ ] Functions that use `await` are marked `async`
- [ ] No missing `await` keywords

**Examples:**
```typescript
// ❌ BAD
async function login(page: any) {  // 'any' type
  page.goto('/login');  // Missing await
  return true;
}

// ✅ GOOD
async function login(page: Page): Promise<void> {
  await page.goto('/login');
}
```

## Page Object Pattern (if applicable)

- [ ] Page objects exist for complex pages
- [ ] Page objects encapsulate selectors
- [ ] Page objects don't contain business logic
- [ ] Page objects are reused across tests
- [ ] No duplicate page objects for same page

## Code Organization (5 minutes)

### File Location
- [ ] Test is in correct domain folder (`tests/[domain]/`)
- [ ] Test is in correct subfolder (user journey)
- [ ] Page objects are in correct folder (`page-objects/[domain]/`)

### Reuse Check
- [ ] Checked for existing page objects before creating new
- [ ] Checked for existing helpers before creating new
- [ ] Reused existing fixtures where possible
- [ ] No duplicate code

### Naming Conventions
- [ ] File names are kebab-case
- [ ] Class names are PascalCase
- [ ] Function names are camelCase
- [ ] Constants are UPPER_SNAKE_CASE

## Accessibility (if applicable)

- [ ] Accessibility scan added for key pages
- [ ] No WCAG violations
- [ ] Keyboard navigation tested (if applicable)
- [ ] Screen reader compatibility verified (if applicable)

## Localization (if applicable)

- [ ] Test works in all supported locales
- [ ] No hard-coded language-specific text
- [ ] Date/number formatting is locale-aware
- [ ] RTL languages tested (if applicable)

## Migration Specific (if applicable)

### Migration Checklist
- [ ] Checked for existing page objects before creating
- [ ] Verified no duplicate page objects created
- [ ] Test placed in correct domain folder
- [ ] Migration log updated
- [ ] Business logic preserved from old test
- [ ] Code reuse ratio is reasonable (>50%)

## Documentation

- [ ] Complex logic has comments explaining "why"
- [ ] Business rules are documented
- [ ] Non-obvious decisions are explained
- [ ] TODOs are tracked (if any)

## Performance

- [ ] Test doesn't have unnecessary delays
- [ ] Selectors are optimized (not overly complex)
- [ ] Test can run in parallel with others
- [ ] No console.log statements left in code (use console.warn/error if needed)

## Security

- [ ] No sensitive data hardcoded (passwords, API keys)
- [ ] Test data uses environment variables or test data files
- [ ] No real user credentials in tests

---

## Before Committing

Run these commands:

```bash
# 1. Lint and fix issues
npm run lint:fix

# 2. Format code
npm run format

# 3. Type check
npm run type-check

# 4. Run your tests
npx playwright test path/to/your-test.spec.ts

# 5. Run all tests (if time permits)
npm test
```

---

## PR Review Additional Checks

### For Reviewers

- [ ] Test names are clear and descriptive
- [ ] Code follows patterns from skills
- [ ] No obvious security issues
- [ ] Migration log updated (if applicable)
- [ ] Page objects are well organized
- [ ] Tests add value (not just for coverage)

### Questions to Ask

1. **Why this approach?** - Is there a better pattern?
2. **Can this be reused?** - Should it be a helper/fixture?
3. **Is this stable?** - Will it break with UI changes?
4. **Is this isolated?** - Can it run independently?
5. **Is this readable?** - Can new team members understand it?

---

## Common Issues to Catch

### ❌ Hard-coded waits
```typescript
await page.waitForTimeout(3000);
```

### ❌ CSS selectors
```typescript
await page.locator('.submit-button').click();
```

### ❌ Missing await
```typescript
page.goto('/page');  // Missing await
```

### ❌ No assertions
```typescript
test('login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'user@test.com');
  await page.click('#submit');
  // ❌ No verification!
});
```

### ❌ Test depends on another test
```typescript
test('step 1', async ({ page }) => {
  await createOrder(page);
});

test('step 2', async ({ page }) => {
  // ❌ Assumes step 1 ran first
  await completeOrder(page);
});
```

---

## Severity Levels

### 🔴 MUST FIX (Blocking)
- Tests failing
- TypeScript errors
- ESLint errors
- Hard-coded waits
- Missing assertions
- Duplicate page objects

### 🟡 SHOULD FIX (Important)
- CSS selectors instead of semantic
- Poor test isolation
- Missing TypeScript types
- No code reuse
- Poorly organized files

### 🟢 NICE TO HAVE (Optional)
- Additional test coverage
- Better naming
- More comments
- Performance optimizations

---

## Quick Reference

**Good Test Checklist:**
1. ✅ Isolated (doesn't depend on others)
2. ✅ Uses semantic selectors (getByRole)
3. ✅ Has assertions (expect statements)
4. ✅ No hard-coded waits
5. ✅ Properly typed (TypeScript)
6. ✅ Well organized (correct folder)
7. ✅ Reuses existing code

**Remember:** If you're unsure, ask:
```
Using the playwright-best-practices skill:

Review this code:
[paste code]

Check for violations of our standards.
```
