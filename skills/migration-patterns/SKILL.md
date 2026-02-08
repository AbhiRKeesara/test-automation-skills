---
name: migration-patterns
description: >
  Framework migration guide for moving from Puppeteer, Selenium, or Cypress to Playwright. Use when planning or executing incremental test migration, checking code reusability, or organizing migrated tests by business domain.
---

# Migration Patterns Skill

Guide for migrating test automation frameworks to Playwright with TypeScript, with special focus on **incremental migration** and **code reusability**.

## Table of Contents

- [Migration Strategy](#migration-strategy)
- [Incremental Migration](#incremental-migration)
- [Reusability Checks](#reusability-checks)
- [Domain Organization](#domain-organization)
- [Framework-Specific Guides](#framework-specific-guides)
- [Common Migration Challenges](#common-migration-challenges)

---

## Migration Strategy

### Core Principles

1. **Migrate incrementally** - One test at a time, one domain at a time
2. **Check for reusability** - Before creating new code, check if it already exists
3. **Organize by business domain** - Group tests logically, not by file type
4. **Track progress** - Use migration log to avoid duplicates
5. **Maintain business logic** - Don't lose important domain knowledge

### The Migration Process

```
┌─────────────────────────────────────────┐
│ 1. Pre-Migration Analysis               │
│    - Review what's already migrated     │
│    - Identify reusable components       │
│    - Determine correct location         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Migration                             │
│    - Convert selectors                   │
│    - Update assertions                   │
│    - Follow best practices              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Post-Migration Review                │
│    - Update migration log               │
│    - Document reusable components       │
│    - Verify business logic preserved    │
└─────────────────────────────────────────┘
```

---

## Incremental Migration

### Day-by-Day Workflow

#### Before Starting Each Day

1. **Review Migration Log**
   - What was migrated yesterday?
   - What page objects were created?
   - What utilities were added?

2. **Plan Today's Migration**
   - Which tests are candidates?
   - Which test shares most code with yesterday's work?
   - What domain are we focusing on?

#### Example: Pharmacy Domain Migration

**Day 1 - Foundation**
```typescript
// Migrated: create-prescription.spec.ts
// Created:
//   - PrescriptionSearchPage (page-objects/pharmacy/)
//   - PrescriptionFormPage (page-objects/pharmacy/)
//   - createTestPrescription() (utils/pharmacy/)
```

**Day 2 - Building On Day 1** ⚠️ CRITICAL: Reuse existing code!
```typescript
// Migrating: refill-prescription.spec.ts

// ✅ BEFORE migrating, check:
// 1. Does PrescriptionSearchPage already exist? YES - REUSE IT!
// 2. Is there a prescription helper? YES - createTestPrescription() exists!
// 3. Where should this test live? /tests/pharmacy/prescription-flow/

// ✅ GOOD: Reuse existing code
import { PrescriptionSearchPage } from '../../page-objects/pharmacy/PrescriptionSearchPage';
import { createTestPrescription } from '../../utils/pharmacy/prescription-helpers';

test('refill prescription flow', async ({ page }) => {
  // Reuse existing page object
  const searchPage = new PrescriptionSearchPage(page);
  
  // Reuse existing helper
  const prescription = await createTestPrescription(page, {
    medication: 'Lisinopril 10mg',
    refillsRemaining: 3
  });
  
  await searchPage.navigate();
  await searchPage.searchById(prescription.id);
  await searchPage.clickRefill(prescription.id);
  
  // Only create NEW page object if needed
  const refillPage = new RefillConfirmationPage(page); // This is NEW
  await refillPage.confirmRefill();
  
  await expect(page.getByText('Refill submitted')).toBeVisible();
});
```

**❌ BAD: Creating duplicates**
```typescript
// Don't create PrescriptionSearchPageV2 just because you didn't check!
// Don't create createPrescription() when createTestPrescription() exists!
```

### Pre-Migration Checklist

Before migrating ANY test, complete this checklist:

```markdown
## Pre-Migration Checklist for [Test Name]

### 1. Code Reusability Analysis
- [ ] Searched /page-objects/ for existing page objects
- [ ] Searched /utils/ for existing helpers
- [ ] Reviewed yesterday's migration log
- [ ] Identified what can be REUSED vs what needs to be CREATED

### 2. Business Domain Identification
- [ ] Determined which domain this test belongs to (pharmacy, billing, etc.)
- [ ] Checked if similar tests exist in that domain folder
- [ ] Identified which user flow this test covers

### 3. Location Planning
- [ ] Determined correct folder: /tests/[domain]/[sub-category]/
- [ ] Checked for naming conflicts
- [ ] Verified folder structure matches our standards

### 4. Dependencies Identification
- [ ] Listed all pages this test touches
- [ ] Listed all API calls this test makes
- [ ] Listed all test data requirements

### 5. Business Logic Verification
- [ ] Understood the business purpose of this test
- [ ] Identified critical business rules being tested
- [ ] Noted any complex workflows or edge cases
```

---

## Reusability Checks

### How to Check for Existing Code

#### 1. Search Existing Page Objects

```bash
# Search for similar page objects
grep -r "class.*Prescription.*Page" page-objects/

# Search for specific methods
grep -r "searchByMedication\|searchById" page-objects/
```

#### 2. Review Migration Log

```markdown
# Check templates/migration-tracker/MIGRATION-LOG.md

## January 30, 2026

### Migrated: create-prescription.spec.ts
**Business Domain:** Pharmacy > Prescription Management
**Created Files:**
- page-objects/pharmacy/PrescriptionSearchPage.ts
- page-objects/pharmacy/PrescriptionFormPage.ts
- utils/pharmacy/prescription-helpers.ts

**Reusable Components:**
- `PrescriptionSearchPage.searchByMedication(name: string)`
- `PrescriptionSearchPage.searchById(id: string)`
- `createTestPrescription(page, options)`
```

#### 3. AI-Assisted Reusability Check

**Prompt Template:**
```
Using the migration-patterns skill:

Before migrating [test name], analyze our codebase:

1. Search /page-objects/pharmacy/ for existing prescription-related page objects
2. Search /utils/pharmacy/ for existing helpers
3. Review /tests/pharmacy/ for similar test flows
4. Identify what can be REUSED vs what needs to be CREATED

Then show me:
- List of existing components that can be reused
- List of new components that need to be created
- Recommended file locations
```

### Decision Tree: Create vs Reuse

```
Does similar functionality exist?
│
├─ YES
│  └─ Can I extend the existing class/function?
│     ├─ YES → EXTEND existing code
│     └─ NO → Is it truly different?
│        ├─ YES → CREATE new, document why
│        └─ NO → REFACTOR existing to be reusable
│
└─ NO
   └─ CREATE new code
```

### Example: Extending vs Creating New

```typescript
// ✅ EXTEND existing page object when pages are similar
// page-objects/pharmacy/BasePrescriptionPage.ts
export class BasePrescriptionPage {
  constructor(protected page: Page) {}
  
  protected async selectMedication(name: string) {
    await this.page.getByLabel('Medication').fill(name);
  }
}

// page-objects/pharmacy/CreatePrescriptionPage.ts
export class CreatePrescriptionPage extends BasePrescriptionPage {
  async create(medication: string, dosage: string) {
    await this.selectMedication(medication); // Reused!
    await this.page.getByLabel('Dosage').fill(dosage);
    await this.page.getByRole('button', { name: 'Create' }).click();
  }
}

// page-objects/pharmacy/RefillPrescriptionPage.ts
export class RefillPrescriptionPage extends BasePrescriptionPage {
  async refill(prescriptionId: string) {
    await this.searchById(prescriptionId);
    await this.page.getByRole('button', { name: 'Refill' }).click();
  }
}
```

---

## Domain Organization

### Folder Structure by Business Domain

```
tests/
├── pharmacy/
│   ├── prescription-flow/
│   │   ├── create-prescription.spec.ts      (Day 1)
│   │   ├── refill-prescription.spec.ts       (Day 2)
│   │   ├── cancel-prescription.spec.ts       (Day 3)
│   │   └── transfer-prescription.spec.ts     (Day 4)
│   ├── medication-search/
│   │   ├── search-by-name.spec.ts
│   │   └── search-by-ndc.spec.ts
│   └── inventory/
│       ├── stock-check.spec.ts
│       └── reorder-alerts.spec.ts
├── patient-portal/
│   ├── appointments/
│   │   ├── schedule-appointment.spec.ts
│   │   ├── cancel-appointment.spec.ts
│   │   └── reschedule-appointment.spec.ts
│   ├── medical-records/
│   │   ├── view-records.spec.ts
│   │   └── download-records.spec.ts
│   └── messaging/
│       ├── send-message.spec.ts
│       └── read-messages.spec.ts
└── billing/
    ├── payments/
    │   ├── add-payment-method.spec.ts
    │   ├── make-payment.spec.ts
    │   └── view-payment-history.spec.ts
    └── insurance/
        ├── add-insurance.spec.ts
        └── verify-coverage.spec.ts

page-objects/
├── pharmacy/
│   ├── PrescriptionSearchPage.ts
│   ├── PrescriptionFormPage.ts
│   ├── RefillConfirmationPage.ts
│   └── MedicationDetailsPage.ts
├── patient-portal/
│   ├── AppointmentSchedulerPage.ts
│   ├── MedicalRecordsPage.ts
│   └── MessagingPage.ts
└── billing/
    ├── PaymentMethodsPage.ts
    └── InsuranceFormPage.ts

utils/
├── pharmacy/
│   ├── prescription-helpers.ts
│   ├── medication-data.ts
│   └── pharmacy-api-helpers.ts
├── patient-portal/
│   ├── appointment-helpers.ts
│   └── patient-data.ts
└── billing/
    ├── payment-helpers.ts
    └── insurance-helpers.ts
```

### Determining Where a Test Belongs

**Ask these questions:**

1. **What business domain?** → Top-level folder (pharmacy, billing, etc.)
2. **What user workflow?** → Sub-folder (prescription-flow, payments, etc.)
3. **What specific action?** → File name (refill-prescription.spec.ts)

**Example Decision Process:**

```
Test: User refills a prescription

1. Business Domain: Pharmacy
   → /tests/pharmacy/

2. User Workflow: Prescription management flow
   → /tests/pharmacy/prescription-flow/

3. Specific Action: Refilling
   → /tests/pharmacy/prescription-flow/refill-prescription.spec.ts
```

---

## Framework-Specific Guides

### Puppeteer → Playwright

#### Selector Migration

```typescript
// ❌ Puppeteer
await page.click('#submit-button');
await page.waitForSelector('.success-message');

// ✅ Playwright
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByRole('alert')).toBeVisible();
```

#### Wait Migration

```typescript
// ❌ Puppeteer
await page.waitFor(2000); // Hard-coded wait
await page.waitForSelector('#loading', { hidden: true });

// ✅ Playwright
// Auto-waiting - no explicit wait needed
await page.getByRole('progressbar').waitFor({ state: 'hidden' });
```

#### Navigation Migration

```typescript
// ❌ Puppeteer
await page.goto('https://example.com');
await page.waitForNavigation();

// ✅ Playwright
await page.goto('https://example.com');
// No need for waitForNavigation - goto waits automatically
```

#### Assertion Migration

```typescript
// ❌ Puppeteer
const text = await page.$eval('.message', el => el.textContent);
expect(text).toBe('Success');

// ✅ Playwright
await expect(page.getByRole('status')).toHaveText('Success');
```

### Selenium → Playwright

```typescript
// ❌ Selenium
driver.findElement(By.id('email')).sendKeys('test@example.com');
driver.findElement(By.id('submit')).click();
WebDriverWait wait = new WebDriverWait(driver, 10);
wait.until(ExpectedConditions.visibilityOfElementLocated(By.className('success')));

// ✅ Playwright
await page.getByLabel('Email').fill('test@example.com');
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByRole('alert')).toBeVisible();
```

---

## Common Migration Challenges

### Challenge 1: Handling Dynamic Content

**Old Framework (Puppeteer):**
```typescript
await page.waitFor(3000); // Wait for data to load
const items = await page.$$('.prescription-item');
```

**Playwright Solution:**
```typescript
// Wait for specific condition
await page.getByRole('progressbar').waitFor({ state: 'hidden' });

// Or wait for first item to appear
await page.getByRole('article').first().waitFor();

// Then get all items
const items = await page.getByRole('article').all();
```

### Challenge 2: File Uploads

**Old Framework:**
```typescript
const fileInput = await page.$('input[type="file"]');
await fileInput.uploadFile('/path/to/file.pdf');
```

**Playwright Solution:**
```typescript
await page.getByLabel('Upload prescription').setInputFiles('/path/to/file.pdf');

// Or for hidden inputs
await page.locator('input[type="file"]').setInputFiles('/path/to/file.pdf');
```

### Challenge 3: Multiple Tabs/Windows

**Old Framework (Puppeteer):**
```typescript
const newPagePromise = new Promise(resolve => 
  browser.once('targetcreated', target => resolve(target.page()))
);
await page.click('a[target="_blank"]');
const newPage = await newPagePromise;
```

**Playwright Solution:**
```typescript
const [newPage] = await Promise.all([
  page.context().waitForEvent('page'),
  page.getByRole('link', { name: 'Open in new tab' }).click()
]);
```

### Challenge 4: Preserving Business Logic

When migrating, document the business purpose:

```typescript
// ❌ Bad - Lost business context
test('test prescription', async ({ page }) => {
  await page.goto('/prescriptions');
  await page.click('#refill-123');
  // What business rule are we testing?
});

// ✅ Good - Business logic preserved
test('should allow refill only when prescription has remaining refills', async ({ page }) => {
  // Business Rule: Users can refill prescriptions if refills remaining > 0
  const prescription = await createTestPrescription(page, {
    medication: 'Lisinopril 10mg',
    refillsRemaining: 2 // Critical business data
  });
  
  const searchPage = new PrescriptionSearchPage(page);
  await searchPage.navigate();
  await searchPage.searchById(prescription.id);
  
  // Verify refill button is enabled (business logic)
  await expect(searchPage.getRefillButton(prescription.id)).toBeEnabled();
  
  await searchPage.clickRefill(prescription.id);
  
  // Verify business outcome
  await expect(page.getByText('Refill submitted successfully')).toBeVisible();
});
```

---

## Migration Log Template

See [templates/migration-tracker/MIGRATION-LOG-TEMPLATE.md](../../templates/migration-tracker/MIGRATION-LOG-TEMPLATE.md) for the complete template.

---

## Quick Reference

### Before Migrating ANY Test:
1. ✅ Check migration log for similar tests
2. ✅ Search for existing page objects
3. ✅ Search for existing utilities
4. ✅ Determine business domain and location
5. ✅ Understand business logic being tested

### During Migration:
1. ✅ Use accessible selectors (getByRole, getByLabel)
2. ✅ Remove hard-coded waits
3. ✅ Add proper assertions
4. ✅ Create page objects for reusability
5. ✅ Document business logic with comments

### After Migration:
1. ✅ Update migration log
2. ✅ Document reusable components
3. ✅ Run tests to verify functionality
4. ✅ Review with team if complex business logic involved

---

## Related Resources

- [Playwright Best Practices Skill](../playwright-best-practices/SKILL.md)
- [Code Organization Skill](../code-organization/SKILL.md)
- [Migration Log Template](../../templates/migration-tracker/MIGRATION-LOG-TEMPLATE.md)
- [Reusability Check Prompts](../../templates/prompt-templates/reusability-check.md)
