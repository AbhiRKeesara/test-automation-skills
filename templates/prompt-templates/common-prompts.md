# Prompt Templates

Copy-paste ready prompts for common tasks with Kiro IDE and Amazon Q CLI.

## 1. Create New Test

```
Using the playwright-best-practices and selector-strategies skills:

Create a test for: [DESCRIBE THE USER FLOW]

Pages involved: [LIST PAGES]
Business domain: [pharmacy/billing/patient-portal/etc]

Requirements:
- Use accessibility-first selectors (getByRole, getByLabel)
- Follow page object pattern
- Include proper assertions and waits
- Add TypeScript types
```

**Example:**
```
Using the playwright-best-practices and selector-strategies skills:

Create a test for: User searches for a patient by MRN and creates a new prescription

Pages involved: Patient Search, Prescription Form, Confirmation
Business domain: pharmacy

Requirements:
- Use accessibility-first selectors (getByRole, getByLabel)
- Follow page object pattern
- Include proper assertions and waits
- Add TypeScript types
```

---

## 2. Migrate Test from Puppeteer/Selenium

```
Using the migration-patterns, playwright-best-practices, and selector-strategies skills:

I'm migrating this [Puppeteer/Selenium] test to Playwright + TypeScript:

[PASTE OLD TEST CODE]

Before migrating:
1. Which business domain does this belong to?
2. Check if page objects already exist for these pages
3. List existing page objects I should reuse
4. Show me where this test should live in folder structure
5. Identify what's NEW vs what can be REUSED

Then migrate following our standards with maximum code reuse.
```

---

## 3. Fix Failing Test

```
Using the playwright-best-practices skill:

Fix this failing test:
[PASTE TEST CODE]

Common issues to check:
- Replace hard-coded waits with assertions
- Use getByRole/getByLabel instead of CSS selectors
- Fix race conditions with proper waits
- Add missing assertions
- Ensure test isolation
```

---

## 4. Add Accessibility Testing

```
Using the accessibility-testing skill:

Add accessibility checks to this test:
[PASTE TEST CODE]

Requirements:
- Run axe-core scan on key pages
- Check for WCAG 2.1 AA violations
- Verify keyboard navigation
- Test screen reader compatibility
```

---

## 5. Add Localization Testing

```
Using the localization-testing skill:

Update this test to support multiple locales (en-US, es-ES, fr-FR):
[PASTE TEST CODE]

Requirements:
- Use locale-aware selectors
- Validate translated content
- Handle date/number formatting
- Test RTL languages if applicable
```

---

## 6. Code Review

```
Using all relevant skills from test-automation-skills:

Review this code against our standards:
[PASTE CODE]

Provide:
- Violations of best practices
- Specific fixes needed
- Suggestions for improvement
- Which skill sections were violated
```

---

## 7. Create Page Object

```
Using the playwright-best-practices and selector-strategies skills:

Before creating a page object for [PAGE NAME]:

1. Search existing page objects for similar pages
2. If exists, should I extend or create new?
3. What selectors should be prioritized?
4. What methods are commonly needed for this page?

Then create the page object following our patterns with TypeScript types.
```

---

## 8. Incremental Migration (Day-by-Day)

```
Using the migration-patterns, code-organization, and playwright-best-practices skills:

Context:
- Yesterday I migrated: [LIST TESTS]
- Created page objects: [LIST PAGE OBJECTS]
- Business domain: [DOMAIN]

Today's test to migrate:
[PASTE PUPPETEER/SELENIUM CODE]

Action:
1. Check for reuse opportunities from yesterday's work
2. Verify no duplicate page objects will be created
3. Determine folder location based on domain
4. Migrate with maximum code reuse
5. Update migration log format
```

**Example:**
```
Using the migration-patterns, code-organization, and playwright-best-practices skills:

Context:
- Yesterday I migrated: create-prescription.spec.ts
- Created page objects: PrescriptionPage, MedicationSearchPage
- Business domain: pharmacy

Today's test to migrate:
[Puppeteer code for refilling prescription]

Action:
1. Check for reuse opportunities from yesterday's work
2. Verify no duplicate page objects will be created
3. Determine folder location based on domain
4. Migrate with maximum code reuse
5. Update migration log format
```

---

## 9. Refactor to Use Fixtures

```
Using the playwright-best-practices skill:

Refactor this test to use fixtures for reusable setup:
[PASTE TEST CODE]

Identify:
- What setup code is repeated across tests?
- What should become a fixture?
- What should remain in the test?

Then create the fixture and refactor the test.
```

---

## 10. Generate Test Data Factory

```
Using the playwright-best-practices and code-organization skills:

Create a test data factory for: [ENTITY TYPE]

Fields needed:
- [field1]: [type]
- [field2]: [type]
- [field3]: [type]

Requirements:
- TypeScript types
- Default values
- Override capability
- createMany() method
```

---

## 11. Add Keyboard Navigation Test

```
Using the accessibility-testing skill:

Add keyboard navigation tests for this page:
[PASTE PAGE URL OR DESCRIBE PAGE]

Test:
- Tab order through form fields
- Enter key submission
- Escape key to close dialogs
- Arrow keys for navigation
- Focus management
```

---

## 12. Convert CSS Selectors to Semantic

```
Using the selector-strategies skill:

Replace these CSS selectors with semantic selectors:
[PASTE CODE WITH CSS SELECTORS]

Rules:
- Prefer getByRole > getByLabel > getByText > getByTestId
- Explain why each replacement is better
- Ensure selectors are stable and maintainable
```

---

## 13. Organize Tests by Domain

```
Using the code-organization skill:

I have these tests: [LIST TESTS]

Help me:
1. Identify business domains
2. Create folder structure
3. Determine where each test should live
4. Group related tests together
5. Organize page objects by domain
```

---

## 14. Debug Selector Issues

```
Using the selector-strategies skill:

This selector isn't working: [PASTE SELECTOR]
Page URL: [URL]
Error: [ERROR MESSAGE]

Help me:
1. Understand why it's failing
2. Find alternative selectors
3. Choose the most stable option
4. Test the new selector
```

---

## 15. Create Reusable Helper

```
Using the playwright-best-practices and code-organization skills:

I'm repeating this code in multiple tests:
[PASTE REPEATED CODE]

Create a reusable helper function:
- Determine appropriate category (date/string/api/etc)
- Add TypeScript types
- Include JSDoc comments
- Show usage example
```

---

## Tips for Better Results

### 1. Be Specific About Context
❌ "Create a login test"
✅ "Create a login test for pharmacy staff authentication that checks role-based access"

### 2. Provide Existing Code
❌ "How should I organize my tests?"
✅ "I have these 20 tests [list them]. Using code-organization skill, help me organize by domain"

### 3. Reference Relevant Skills
❌ "Help me with this test"
✅ "Using playwright-best-practices and selector-strategies skills, help me improve this test"

### 4. Break Down Complex Tasks
Instead of: "Migrate all my tests"
Do:
1. "Analyze which domain to migrate first"
2. "Migrate first test and create page objects"
3. "Migrate second test reusing yesterday's page objects"

### 5. Ask for Explanations
"Using the selector-strategies skill, explain why getByRole is better than CSS selectors for [specific case]"

---

## Save Time Tips

1. **Bookmark frequently used prompts** - Keep them in a note-taking app
2. **Customize domain names** - Replace [pharmacy/billing/etc] with your actual domains
3. **Add context files** - Paste your project structure for better results
4. **Iterate** - Start simple, then ask follow-up questions
5. **Share successful prompts** - Help your team with what works

---

## Next Steps

1. Copy a template above
2. Fill in the bracketed sections
3. Paste into Kiro IDE or Amazon Q CLI
4. Review the generated code
5. Run tests to verify
6. Commit if all passes
