# Migration Log Template

Track your progress migrating tests from [Old Framework] to Playwright + TypeScript.

## Instructions

1. **Copy this file** for your project: `MIGRATION-LOG.md`
2. **Update daily** after migrating tests
3. **Reference before migrating** to check for reusable code

---

## Migration Overview

**Start Date:** [Date]  
**Old Framework:** [Puppeteer / Selenium / Cypress]  
**Target Framework:** Playwright + TypeScript  
**Total Tests to Migrate:** [Number]  
**Tests Migrated:** [Number]  
**Progress:** [XX%]

---

## January 31, 2026

### Migrated Tests

#### Test 1: [Test Name]
**Original File:** `old-framework/tests/test-name.js`  
**New File:** `tests/[domain]/[category]/test-name.spec.ts`  
**Business Domain:** [Pharmacy / Billing / Patient Portal]  
**Complexity:** [Low / Medium / High]  
**Time Taken:** [XX minutes]

**Created Files:**
- `page-objects/[domain]/PageName.ts` - [Description]
- `utils/[domain]/helper-name.ts` - [Description]

**Reusable Components:**
- `ClassName.methodName(params)` - [What it does]
- `functionName(params)` - [What it does]

**Business Logic Notes:**
- [Important business rule tested]
- [Edge cases covered]
- [Critical workflows]

**Challenges:**
- [Any issues encountered]
- [How they were resolved]

---

#### Test 2: [Test Name]
**Original File:** `old-framework/tests/test-name2.js`  
**New File:** `tests/[domain]/[category]/test-name2.spec.ts`  
**Business Domain:** [Domain]  
**Complexity:** [Low / Medium / High]  
**Time Taken:** [XX minutes]

**Reused Components:** ✅
- `ExistingClass.method()` - From Test 1 migration
- `existingHelper()` - From Test 1 migration

**Created Files:**
- `page-objects/[domain]/NewPage.ts` - [Description]

**Reusable Components:**
- `NewClass.methodName(params)` - [What it does]

**Business Logic Notes:**
- [Important business rule tested]

---

## January 30, 2026

### Migrated Tests

#### Test 1: create-prescription
**Original File:** `puppeteer/tests/prescription/create.js`  
**New File:** `tests/pharmacy/prescription-flow/create-prescription.spec.ts`  
**Business Domain:** Pharmacy > Prescription Management  
**Complexity:** Medium  
**Time Taken:** 45 minutes

**Created Files:**
- `page-objects/pharmacy/PrescriptionSearchPage.ts` - Search for prescriptions by medication or ID
- `page-objects/pharmacy/PrescriptionFormPage.ts` - Create new prescription form
- `utils/pharmacy/prescription-helpers.ts` - Helper functions for creating/deleting test prescriptions

**Reusable Components:**
- `PrescriptionSearchPage.searchByMedication(name: string)` - Search prescriptions by medication name
- `PrescriptionSearchPage.searchById(id: string)` - Search prescriptions by ID
- `createTestPrescription(page, options)` - Creates a test prescription via API
- `deleteTestPrescription(page, id)` - Deletes a test prescription via API

**Business Logic Notes:**
- Prescriptions require: medication name, dosage, quantity, and patient ID
- System validates medication name against database
- Only licensed prescribers can create prescriptions
- Prescriptions are automatically marked as "Active" on creation

**Challenges:**
- Had to replace Puppeteer's `page.waitFor(2000)` with proper `waitFor()` conditions
- Changed from CSS selectors (#prescription-form) to accessible selectors (getByRole, getByLabel)

---

## Migration Checklist Template

Before migrating each test, complete this checklist:

### Pre-Migration Checklist for [Test Name]

**Date:** [Date]

#### 1. Code Reusability Analysis
- [ ] Searched `/page-objects/` for existing page objects
- [ ] Searched `/utils/` for existing helpers
- [ ] Reviewed yesterday's migration log
- [ ] Identified what can be REUSED vs what needs to be CREATED

**Existing components found:**
- [List components that can be reused]

**New components needed:**
- [List components that need to be created]

#### 2. Business Domain Identification
- [ ] Determined business domain: [Pharmacy / Billing / etc.]
- [ ] Checked for similar tests in domain folder
- [ ] Identified user workflow: [workflow name]

**Location Decision:**
- Folder: `/tests/[domain]/[category]/`
- File name: `[test-name].spec.ts`

#### 3. Business Logic Understanding
- [ ] Read and understood original test
- [ ] Identified business rules being tested
- [ ] Noted edge cases and validations
- [ ] Documented critical workflows

**Business Logic Summary:**
- [What business rule/workflow is being tested]

#### 4. Migration Plan
- [ ] Determined selector migration strategy
- [ ] Planned assertion updates
- [ ] Identified required test data
- [ ] Estimated complexity and time

**Estimated Time:** [XX minutes]  
**Complexity:** [Low / Medium / High]

---

## File Mapping Reference

Track where files from the old framework map to the new structure:

| Old Framework Path | New Playwright Path | Notes |
|-------------------|---------------------|-------|
| `puppeteer/tests/login.js` | `tests/auth/login.spec.ts` | Uses LoginPage page object |
| `puppeteer/tests/prescription/create.js` | `tests/pharmacy/prescription-flow/create-prescription.spec.ts` | Created PrescriptionSearchPage, PrescriptionFormPage |
| `puppeteer/tests/prescription/refill.js` | `tests/pharmacy/prescription-flow/refill-prescription.spec.ts` | Reuses PrescriptionSearchPage |

---

## Domain Organization Map

Track which tests belong to which business domain:

### Pharmacy Domain
- ✅ `create-prescription.spec.ts` - Creates new prescription
- ✅ `refill-prescription.spec.ts` - Refills existing prescription
- ⏳ `cancel-prescription.spec.ts` - Cancels prescription (Next)
- ⏳ `transfer-prescription.spec.ts` - Transfers to another pharmacy (Next)

### Billing Domain
- ⏳ `add-payment-method.spec.ts` - (Planned)
- ⏳ `make-payment.spec.ts` - (Planned)

### Patient Portal
- ⏳ `schedule-appointment.spec.ts` - (Planned)
- ⏳ `view-medical-records.spec.ts` - (Planned)

---

## Component Reusability Reference

Track reusable components created during migration:

### Page Objects

#### Pharmacy Domain
- **PrescriptionSearchPage**
  - `searchByMedication(name: string)` - Search by medication name
  - `searchById(id: string)` - Search by prescription ID
  - `getRefillButton(id: string)` - Get refill button for specific prescription
  - Used in: create-prescription, refill-prescription

- **PrescriptionFormPage**
  - `fillForm(data: PrescriptionData)` - Fill out prescription form
  - `submit()` - Submit the form
  - Used in: create-prescription

#### Auth Domain
- **LoginPage**
  - `login(email: string, password: string)` - Log in user
  - Used in: All tests requiring authentication

### Utilities

#### Pharmacy Helpers (`utils/pharmacy/prescription-helpers.ts`)
- `createTestPrescription(page, options)` - Create test prescription via API
- `deleteTestPrescription(page, id)` - Delete test prescription
- Used in: create-prescription, refill-prescription

#### Test Data Generators (`utils/test-data/random-data.ts`)
- `generateRandomEmail()` - Generate unique test email
- `generateRandomPhoneNumber()` - Generate random phone number
- Used in: User registration tests

---

## Migration Metrics

### Weekly Progress

**Week of January 27 - January 31, 2026:**
- Tests Migrated: 2
- New Page Objects Created: 2
- New Utilities Created: 1
- Average Time per Test: 40 minutes
- Reusability Rate: 50% (1 out of 2 tests reused existing code)

### Cumulative Stats
- Total Tests Migrated: 2 / 50
- Total Page Objects: 2
- Total Utilities: 1
- Average Migration Time: 40 minutes
- Estimated Completion: [Date based on current pace]

---

## Notes & Lessons Learned

### Key Insights
- Always check for existing page objects before creating new ones
- Reviewing yesterday's log saves 10-15 minutes per test
- Group related tests together to maximize code reuse
- Document business logic while it's fresh

### Common Patterns Discovered
- Most prescription tests share PrescriptionSearchPage
- Authentication helper is used in 80% of tests
- API helpers reduce test setup time by ~30%

### Improvements for Next Week
- Create shared fixture for authenticated state
- Build more comprehensive test data generators
- Document more complex business rules

---

## Template: Daily Entry

Copy this template for each day of migration:

```markdown
## [Date]

### Migrated Tests

#### Test 1: [Test Name]
**Original File:** `[path]`  
**New File:** `[path]`  
**Business Domain:** [Domain]  
**Complexity:** [Low / Medium / High]  
**Time Taken:** [XX minutes]

**Created Files:**
- `[file path]` - [Description]

**Reused Components:** ✅ / ❌
- [Component name] - [Where it came from]

**Reusable Components:**
- `[Component.method()]` - [What it does]

**Business Logic Notes:**
- [Important business rule]

**Challenges:**
- [Issues and resolutions]

---
```
