# Troubleshooting Guide

Common issues and solutions when using these skills with AI assistants and Playwright.

## AI Assistant Issues

### Issue: AI isn't following the skills

**Symptoms:**
- Generated code uses CSS selectors instead of getByRole
- Hard-coded waits (page.waitForTimeout) in code
- Doesn't check for existing page objects

**Solutions:**
1. ✅ **Explicitly mention the skill name in your prompt**
   ```
   Using the playwright-best-practices skill...
   ```

2. ✅ **Be more specific about which part of the skill**
   ```
   Using the selector-strategies skill, specifically the priority hierarchy section...
   ```

3. ✅ **Reference examples**
   ```
   Following the pattern in /skills/playwright-best-practices/examples/good-practices/
   ```

4. ✅ **Remind AI of constraints**
   ```
   Remember: No hard-coded waits, use getByRole selectors, check for existing page objects first
   ```

---

### Issue: AI generates duplicate code

**Symptoms:**
- Creates new page object that already exists
- Doesn't reuse existing helpers
- Repeats selectors across tests

**Solutions:**
1. ✅ **Provide context about existing code**
   ```
   Existing page objects: PrescriptionPage, PatientSearchPage
   Using migration-patterns skill, check for reuse before creating new files
   ```

2. ✅ **Explicitly ask for reuse check**
   ```
   Before creating anything new:
   1. Search for existing page objects
   2. List what can be reused
   3. Only create what's truly new
   ```

3. ✅ **Use incremental migration prompt**
   ```
   Yesterday I created: [list]
   Today's migration: [code]
   Maximize reuse from yesterday's work
   ```

---

### Issue: Generated code doesn't pass linting

**Symptoms:**
- ESLint errors when running `npm run lint`
- TypeScript compilation errors
- Prettier formatting issues

**Solutions:**
1. ✅ **Ask AI to fix linting errors**
   ```
   Using playwright-best-practices skill:
   Fix these ESLint errors: [paste errors]
   ```

2. ✅ **Run checks before committing**
   ```bash
   npm run lint        # Check for issues
   npm run lint:fix    # Auto-fix many issues
   npm run format      # Fix formatting
   npm run type-check  # Check TypeScript
   ```

3. ✅ **Include linting requirements in prompt**
   ```
   Generate code that:
   - Passes ESLint checks
   - Has no TypeScript 'any' types
   - Uses proper await/async
   ```

---

## Playwright Test Issues

### Issue: Selectors not finding elements

**Symptoms:**
- `TimeoutError: locator.click: Timeout 30000ms exceeded`
- Element not found errors

**Solutions:**
1. ✅ **Use Playwright Inspector**
   ```bash
   npx playwright test --debug
   ```

2. ✅ **Use Playwright Codegen to find selectors**
   ```bash
   npx playwright codegen https://your-app.com
   ```

3. ✅ **Check selector priority**
   - Try getByRole first
   - Then getByLabel
   - Then getByText
   - Last resort: getByTestId

4. ✅ **Ask AI to debug selector**
   ```
   Using selector-strategies skill:
   
   This selector isn't working: page.getByRole('button', { name: 'Submit' })
   Page: /checkout
   Error: TimeoutError
   
   Help me find the right selector.
   ```

5. ✅ **Verify element is visible**
   ```typescript
   // Check if element exists
   await page.pause(); // Opens Playwright Inspector
   console.log(await page.getByRole('button').count());
   ```

---

### Issue: Tests are flaky

**Symptoms:**
- Tests pass sometimes, fail sometimes
- Different results on CI vs local
- Race conditions

**Solutions:**
1. ✅ **Remove hard-coded waits**
   ```typescript
   // ❌ WRONG
   await page.waitForTimeout(2000);
   
   // ✅ CORRECT
   await expect(page.getByText('Success')).toBeVisible();
   ```

2. ✅ **Use proper waits**
   ```typescript
   // Wait for navigation
   await page.waitForURL('/dashboard');
   
   // Wait for network
   await page.waitForLoadState('networkidle');
   
   // Wait for specific element
   await expect(page.getByRole('heading')).toBeVisible();
   ```

3. ✅ **Ensure test isolation**
   ```typescript
   // Each test should be independent
   test('test 1', async ({ page }) => {
     await page.goto('/page');
     // Complete setup within this test
   });
   
   test('test 2', async ({ page }) => {
     await page.goto('/page');
     // Don't depend on test 1
   });
   ```

4. ✅ **Ask AI to fix flaky test**
   ```
   Using playwright-best-practices skill:
   
   This test is flaky:
   [paste test code]
   
   Issues to fix:
   - Hard-coded waits
   - Race conditions
   - Improper assertions
   ```

---

### Issue: Tests are slow

**Symptoms:**
- Tests take too long to run
- Waiting unnecessarily

**Solutions:**
1. ✅ **Run tests in parallel**
   ```typescript
   // playwright.config.ts
   fullyParallel: true,
   ```

2. ✅ **Remove unnecessary waits**
   ```typescript
   // ❌ SLOW
   await page.waitForTimeout(5000);
   
   // ✅ FAST
   await expect(page.getByText('Loaded')).toBeVisible();
   ```

3. ✅ **Use fixtures for setup**
   ```typescript
   // Reusable setup, runs once
   test.beforeEach(async ({ page }) => {
     await page.goto('/');
     await login(page);
   });
   ```

4. ✅ **Optimize selectors**
   ```typescript
   // ❌ SLOW - Multiple queries
   await page.locator('.container').locator('.form').locator('input').fill('text');
   
   // ✅ FAST - Direct query
   await page.getByLabel('Email').fill('text');
   ```

---

### Issue: Can't test across multiple languages

**Symptoms:**
- Hard-coded English text in tests
- Tests fail in other locales

**Solutions:**
1. ✅ **Use role-based selectors**
   ```typescript
   // ❌ Language-specific
   await page.getByText('Submit').click();
   
   // ✅ Works in any language
   await page.getByRole('button', { name: /submit/i }).click();
   ```

2. ✅ **Configure locale projects**
   ```typescript
   // playwright.config.ts
   projects: [
     { name: 'en-US', use: { locale: 'en-US' } },
     { name: 'es-ES', use: { locale: 'es-ES' } },
   ]
   ```

3. ✅ **Refer to localization skill**
   ```
   Using localization-testing skill:
   Make this test work in: en-US, es-ES, fr-FR
   [paste test code]
   ```

---

### Issue: Accessibility tests failing

**Symptoms:**
- axe-core violations
- Accessibility errors

**Solutions:**
1. ✅ **Check specific violations**
   ```typescript
   const results = await new AxeBuilder({ page }).analyze();
   console.log(results.violations);
   ```

2. ✅ **Exclude third-party components**
   ```typescript
   await new AxeBuilder({ page })
     .exclude('#third-party-widget')
     .analyze();
   ```

3. ✅ **Test specific WCAG levels**
   ```typescript
   await new AxeBuilder({ page })
     .withTags(['wcag2aa'])
     .analyze();
   ```

4. ✅ **Ask AI for a11y help**
   ```
   Using accessibility-testing skill:
   
   These accessibility violations were found:
   [paste violations]
   
   How should I fix them?
   ```

---

## Migration Issues

### Issue: Creating duplicate page objects

**Symptoms:**
- Multiple page objects for same page
- Repeated selectors

**Solutions:**
1. ✅ **Always check before creating**
   ```bash
   # Search for existing page objects
   grep -r "PrescriptionPage" page-objects/
   ```

2. ✅ **Use migration-patterns skill**
   ```
   Using migration-patterns skill:
   
   Before migrating, check for:
   - Existing page objects: [search page-objects/]
   - Similar tests: [search tests/]
   - Reusable code: [list]
   ```

3. ✅ **Update migration log**
   - Track what's created vs reused
   - Document daily progress
   - Review before each migration

---

### Issue: Lost business logic during migration

**Symptoms:**
- Migrated test doesn't do what old test did
- Missing validation steps

**Solutions:**
1. ✅ **Compare old vs new test**
   ```
   Using migration-patterns skill:
   
   Original Puppeteer test:
   [paste old test]
   
   New Playwright test:
   [paste new test]
   
   Verify all business logic was preserved.
   ```

2. ✅ **Add comments explaining business rules**
   ```typescript
   // Business rule: Prescriptions can only be refilled after 75% depletion
   await expect(refillButton).toBeDisabled();
   ```

3. ✅ **Test end-to-end, not just UI**
   ```typescript
   // Verify database state if needed
   // Verify API responses if needed
   ```

---

## Organization Issues

### Issue: Can't find tests in codebase

**Symptoms:**
- Tests scattered randomly
- No clear structure

**Solutions:**
1. ✅ **Organize by domain**
   ```
   tests/
   ├── pharmacy/
   ├── patient-portal/
   └── billing/
   ```

2. ✅ **Use code-organization skill**
   ```
   Using code-organization skill:
   
   I have these tests: [list]
   Help me organize by business domain
   ```

3. ✅ **Create domain README files**
   ```markdown
   # Pharmacy Tests
   
   This folder contains all pharmacy-related tests.
   
   ## Subfolders:
   - prescription-flow/
   - inventory/
   - dispensing/
   ```

---

## CI/CD Issues

### Issue: Tests pass locally but fail in CI

**Symptoms:**
- Green locally, red in CI
- Different browser behavior

**Solutions:**
1. ✅ **Match CI environment**
   ```bash
   # Run with CI settings
   CI=true npm test
   ```

2. ✅ **Check for timing issues**
   ```typescript
   // Add retries in CI
   retries: process.env.CI ? 2 : 0,
   ```

3. ✅ **Use proper waits**
   ```typescript
   // Don't rely on fast local machine
   await expect(element).toBeVisible();
   ```

---

## Quick Diagnostic Commands

```bash
# Check linting
npm run lint

# Check TypeScript
npm run type-check

# Check formatting
npm run format:check

# Run single test
npx playwright test path/to/test.spec.ts

# Debug test
npx playwright test --debug path/to/test.spec.ts

# Run with UI
npx playwright test --ui

# Generate test
npx playwright codegen

# Show report
npm run report
```

---

## Getting Help

**If you're still stuck:**

1. ✅ Check skill-specific examples in `/skills/*/examples/`
2. ✅ Search GitHub issues: [Playwright Issues](https://github.com/microsoft/playwright/issues)
3. ✅ Ask AI with detailed context:
   ```
   Using [relevant-skill]:
   
   Issue: [describe problem]
   Code: [paste code]
   Error: [paste error]
   What I tried: [list attempts]
   
   Help me solve this.
   ```
4. ✅ Ask your team
5. ✅ Open an issue in this repository

---

**Remember:** Most issues come from:
- Not explicitly referencing skills in prompts
- Not checking for existing code before creating
- Using CSS selectors instead of semantic ones
- Not using proper waits/assertions
- Poor test isolation
