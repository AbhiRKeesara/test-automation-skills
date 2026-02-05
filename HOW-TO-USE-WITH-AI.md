# How to Use with AI Tools (Kiro IDE / Amazon Q CLI)

This guide shows you how to get the most out of AI coding assistants using these skills.

## 🎯 Core Concept

AI assistants work best when you:
1. **Reference specific skills** in your prompts
2. **Provide context** about what you're trying to do
3. **Ask for explanations** when the AI makes choices
4. **Iterate** based on the output

## 📝 Prompt Templates

### Template 1: Creating New Tests

```
Using the playwright-best-practices and selector-strategies skills:

Create a test for [describe the user flow].

Requirements:
- Use accessibility-first selectors (getByRole, getByLabel)
- Include proper assertions
- Follow page object pattern
- Add comments explaining business logic
```

**Example:**
```
Using the playwright-best-practices and selector-strategies skills:

Create a test for pharmacy prescription refill flow:
1. User logs in
2. Navigates to prescriptions
3. Selects a prescription
4. Clicks "Refill"
5. Confirms the refill

Requirements:
- Use accessibility-first selectors
- Include proper assertions
- Follow page object pattern
- Add comments explaining business logic
```

### Template 2: Fixing Existing Tests

```
Using the playwright-best-practices skill:

Fix this test to follow best practices:

[paste your test code]

Specific issues to address:
- Remove hard-coded waits
- Replace brittle selectors
- Add proper assertions
- Improve error messages
```

**Example:**
```
Using the playwright-best-practices skill:

Fix this test to follow best practices:

test('login test', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.waitForTimeout(2000);
  await page.locator('#username').fill('test@example.com');
  await page.locator('#password').fill('password123');
  await page.locator('button').click();
});

Specific issues to address:
- Remove hard-coded waits
- Replace CSS selectors with accessible ones
- Add assertions to verify login success
- Improve test name and structure
```

### Template 3: Migrating Tests (YOUR USE CASE!)

```
Using the migration-patterns, playwright-best-practices, and selector-strategies skills:

Migrate this [Puppeteer/Selenium] test to Playwright + TypeScript:

[paste old test code]

Before migrating:
1. Check if page objects already exist for this flow
2. Search for similar tests in /tests/[domain-name]/
3. Identify reusable utilities
4. Show me where this test should be placed

Then migrate following our standards.
```

**Example:**
```
Using the migration-patterns, playwright-best-practices, and selector-strategies skills:

Migrate this Puppeteer test to Playwright + TypeScript:

const puppeteer = require('puppeteer');

async function testPrescriptionRefill() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://pharmacy.example.com/prescriptions');
  await page.waitFor(2000);
  await page.click('#prescription-123');
  await page.click('.refill-button');
  await page.waitForSelector('.success-message');
  
  await browser.close();
}

Before migrating:
1. Check if page objects exist for pharmacy/prescription pages
2. Search for similar tests in /tests/pharmacy/
3. Identify reusable utilities in /utils/
4. Show me where this test should live

Then migrate following our standards.
```

### Template 4: Incremental Migration with Reusability Check

```
Using the migration-patterns and code-organization skills:

I'm migrating test #[N] from [old framework] to Playwright.

Yesterday I migrated:
- [test name 1] which created [page objects/utilities]
- [test name 2] which created [page objects/utilities]

Today's test to migrate:
[paste test code]

Before migrating:
1. Analyze which existing page objects can be reused
2. Check if we're testing similar flows (avoid duplication)
3. Determine correct folder location based on business domain
4. List what's NEW vs what can be REUSED

Then show me the migration with clear markers for reused code.
```

### Template 5: Finding Better Selectors

```
Using the selector-strategies skill:

I need to find a selector for [describe the element].

Current page HTML:
[paste relevant HTML or describe the element]

Requirements:
- Accessibility-first approach
- Resilient to changes
- No CSS selectors or XPath unless absolutely necessary

Show me 3 options ranked by preference with explanations.
```

### Template 6: Adding Accessibility Testing

```
Using the accessibility-testing and playwright-best-practices skills:

Add accessibility checks to this test:

[paste test code]

Focus on:
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast
```

### Template 7: Code Review / Quality Check

```
Using the playwright-best-practices skill:

Review this test and suggest improvements:

[paste test code]

Check for:
- Best practices violations
- Potential flakiness
- Missing assertions
- Code organization issues
- Performance concerns
```

## 🔄 Multi-Step Workflows

### Workflow 1: Complete Migration Day

**Prompt 1 - Planning:**
```
Using the migration-patterns skill:

I'm starting day [N] of migration from Puppeteer to Playwright.

Previously migrated:
[list tests from migration log]

Today's candidates:
[list 3-5 tests to migrate]

Which test should I migrate first to maximize code reuse?
```

**Prompt 2 - Execute Migration:**
```
Using the migration-patterns and playwright-best-practices skills:

Migrate [chosen test] following the recommendations from the previous analysis.
Show me:
1. Updated migration log entry
2. The migrated test code
3. Any new/updated page objects
4. What was reused vs created
```

**Prompt 3 - Validation:**
```
Using the playwright-best-practices skill:

Review the migrated test for:
- Completeness (did we capture all functionality?)
- Quality (does it follow our standards?)
- Business logic preservation (same behavior as original?)
```

### Workflow 2: Building a Test Suite from Scratch

**Prompt 1 - Structure:**
```
Using the code-organization skill:

I'm building a test suite for [application/domain].

Main user flows:
- [flow 1]
- [flow 2]
- [flow 3]

Suggest:
1. Folder structure
2. Page object organization
3. Shared utilities needed
```

**Prompt 2 - Create Foundation:**
```
Using the playwright-best-practices skill:

Based on the suggested structure, create:
1. playwright.config.ts
2. Base page object class
3. Test fixtures
4. First example test
```

**Prompt 3 - Build Out:**
```
Using the playwright-best-practices and selector-strategies skills:

Create page objects and tests for [specific flow].
```

## 🎓 Advanced Techniques

### Technique 1: Context Building

Give the AI context about your domain:

```
Context: I'm testing a pharmacy application where users can:
- Search for medications
- Refill prescriptions
- View prescription history
- Update payment methods

Using the playwright-best-practices skill:

[your actual request]
```

### Technique 2: Asking for Explanations

```
Using the playwright-best-practices skill:

Create a test for [scenario].

After creating the test, explain:
- Why you chose those specific selectors
- What best practices you applied
- What alternatives you considered
```

### Technique 3: Learning from Examples

```
Using the playwright-best-practices skill:

Show me two versions of a test for [scenario]:
1. A BAD version with common anti-patterns
2. A GOOD version following best practices

Annotate both with comments explaining what's wrong/right.
```

### Technique 4: Requesting Checklists

```
Before I commit this test, give me a checklist based on playwright-best-practices skill:

[paste your test]

Checklist should cover:
- Selector quality
- Assertion completeness
- Error handling
- Code organization
```

## 🚫 Common Mistakes to Avoid

### ❌ Mistake 1: Vague Prompts
```
Create a test for login
```

### ✅ Better:
```
Using the playwright-best-practices and selector-strategies skills:

Create a test for login with email and password.
Include:
- Accessibility-first selectors
- Assertion for successful login
- Error case handling
```

---

### ❌ Mistake 2: Not Mentioning Skills
```
Fix my test [paste code]
```

### ✅ Better:
```
Using the playwright-best-practices skill, fix this test:
[paste code]

Focus on replacing hard-coded waits and brittle selectors.
```

---

### ❌ Mistake 3: Not Checking for Existing Code
```
Create a page object for the login page
```

### ✅ Better:
```
Using the migration-patterns skill:

Before creating a login page object:
1. Check if one already exists in /page-objects/
2. If it exists, show me how to extend it
3. If not, create a new one following our standards

[describe what the page object needs]
```

## 💡 Pro Tips

1. **Always reference specific skills** - it helps the AI focus
2. **Provide examples** from your codebase when possible
3. **Ask for multiple options** when unsure
4. **Request explanations** to learn patterns
5. **Use the migration tracker** to maintain context across days
6. **Iterate** - your first prompt doesn't have to be perfect

## 📊 Measuring Success

Good prompts should result in code that:
- ✅ Passes ESLint/Prettier checks
- ✅ Uses accessibility-first selectors
- ✅ Includes proper assertions
- ✅ Has clear, maintainable structure
- ✅ Avoids hard-coded waits
- ✅ Follows naming conventions

If the generated code doesn't meet these criteria, refine your prompt!

## 🔗 Related Resources

- [Playwright Best Practices Skill](./skills/playwright-best-practices/SKILL.md)
- [Migration Patterns Skill](./skills/migration-patterns/SKILL.md)
- [Selector Strategies Skill](./skills/selector-strategies/SKILL.md)
- [Prompt Templates](./templates/prompt-templates/)

---

**Remember:** AI tools are assistants, not replacements. Always review generated code for correctness and alignment with your business requirements.
