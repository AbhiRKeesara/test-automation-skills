---
name: code-organization
description: >
  Best practices for organizing Playwright test code by business domain. Use when setting up new projects, reorganizing test structure, establishing naming conventions, or deciding folder layout for page objects, utilities, and fixtures.
---

# Code Organization Skill

Best practices for organizing test automation code in Playwright projects.

## Project Structure

### Recommended Folder Structure

```
your-project/
├── tests/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── logout.spec.ts
│   │   └── password-reset.spec.ts
│   ├── pharmacy/
│   │   ├── prescription-flow/
│   │   │   ├── create-prescription.spec.ts
│   │   │   ├── refill-prescription.spec.ts
│   │   │   └── cancel-prescription.spec.ts
│   │   └── medication-search.spec.ts
│   ├── patient-portal/
│   │   ├── appointments.spec.ts
│   │   └── medical-records.spec.ts
│   └── billing/
│       └── payments.spec.ts
├── page-objects/
│   ├── auth/
│   │   ├── LoginPage.ts
│   │   └── PasswordResetPage.ts
│   ├── pharmacy/
│   │   ├── PrescriptionSearchPage.ts
│   │   ├── PrescriptionFormPage.ts
│   │   └── MedicationDetailsPage.ts
│   ├── patient-portal/
│   │   └── AppointmentsPage.ts
│   └── billing/
│       └── PaymentPage.ts
├── fixtures/
│   ├── auth.fixture.ts
│   ├── test-data.fixture.ts
│   └── api.fixture.ts
├── utils/
│   ├── pharmacy/
│   │   ├── prescription-helpers.ts
│   │   └── medication-data.ts
│   ├── test-data/
│   │   ├── user-generator.ts
│   │   └── random-data.ts
│   └── api/
│       └── api-helpers.ts
├── test-data/
│   ├── medications.json
│   ├── users.json
│   └── insurance-providers.json
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Naming Conventions

### File Naming

```
✅ Good:
- login.spec.ts
- create-prescription.spec.ts
- refill-prescription.spec.ts
- PrescriptionSearchPage.ts
- prescription-helpers.ts

❌ Bad:
- test1.ts
- TestLogin.spec.ts (not kebab-case)
- presc.spec.ts (not descriptive)
- loginpage.ts (no PascalCase for classes)
```

### Class Naming

```typescript
// ✅ Good - PascalCase for classes
export class LoginPage {}
export class PrescriptionSearchPage {}
export class PaymentMethodsPage {}

// ❌ Bad
export class loginPage {}
export class prescription_search_page {}
```

### Function/Variable Naming

```typescript
// ✅ Good - camelCase
async function createTestUser() {}
const prescriptionId = '123';
const isAuthenticated = true;

// ❌ Bad
async function CreateTestUser() {}
const prescription_id = '123';
```

### Test Naming

```typescript
// ✅ Good - Descriptive, explains what's being tested
test('should display error when email is invalid', async ({ page }) => {});
test('should allow user to refill prescription with remaining refills', async ({ page }) => {});
test('should prevent refill when no refills remaining', async ({ page }) => {});

// ❌ Bad
test('test 1', async ({ page }) => {});
test('error', async ({ page }) => {});
test('works', async ({ page }) => {});
```

## Page Objects Organization

### Base Page Object

```typescript
// page-objects/BasePage.ts
import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}
  
  async navigate(path: string) {
    await this.page.goto(path);
  }
  
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}
```

### Domain-Specific Page Objects

```typescript
// page-objects/pharmacy/PrescriptionSearchPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PrescriptionSearchPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly resultsContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByLabel('Search prescriptions');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resultsContainer = page.getByRole('region', { name: 'Search Results' });
  }

  async navigate() {
    await super.navigate('/prescriptions/search');
  }

  async searchByMedication(medicationName: string) {
    await this.searchInput.fill(medicationName);
    await this.searchButton.click();
    await this.resultsContainer.waitFor();
  }

  async searchById(prescriptionId: string) {
    await this.searchInput.fill(prescriptionId);
    await this.searchButton.click();
    await this.resultsContainer.waitFor();
  }

  getResultCard(prescriptionId: string): Locator {
    return this.page.getByTestId(`prescription-card-${prescriptionId}`);
  }

  getRefillButton(prescriptionId: string): Locator {
    return this.getResultCard(prescriptionId).getByRole('button', { name: 'Refill' });
  }
}
```

## Utility Functions

### Helper Functions Organization

```typescript
// utils/pharmacy/prescription-helpers.ts
import { Page } from '@playwright/test';

export interface PrescriptionOptions {
  medication: string;
  dosage: string;
  refillsRemaining: number;
  patientId?: string;
}

export async function createTestPrescription(
  page: Page,
  options: PrescriptionOptions
): Promise<{ id: string; medication: string }> {
  // API call to create test prescription
  const response = await page.request.post('/api/prescriptions', {
    data: {
      medication: options.medication,
      dosage: options.dosage,
      refillsRemaining: options.refillsRemaining,
      patientId: options.patientId || 'test-patient-123',
    },
  });

  const prescription = await response.json();
  return {
    id: prescription.id,
    medication: prescription.medication,
  };
}

export async function deleteTestPrescription(page: Page, prescriptionId: string): Promise<void> {
  await page.request.delete(`/api/prescriptions/${prescriptionId}`);
}
```

### Random Data Generators

```typescript
// utils/test-data/random-data.ts
export function generateRandomEmail(): string {
  const timestamp = Date.now();
  return `test-${timestamp}@example.com`;
}

export function generateRandomPhoneNumber(): string {
  return `555-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function generateRandomDate(startYear: number = 1950, endYear: number = 2005): string {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

## Fixtures Organization

### Authentication Fixture

```typescript
// fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../page-objects/auth/LoginPage';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('test@example.com', 'password123');
    await page.waitForURL(/.*dashboard/);
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

### Test Data Fixture

```typescript
// fixtures/test-data.fixture.ts
import { test as base } from '@playwright/test';
import { generateRandomEmail, generateRandomPhoneNumber } from '../utils/test-data/random-data';

type TestDataFixtures = {
  testUser: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  };
};

export const test = base.extend<TestDataFixtures>({
  testUser: async ({}, use) => {
    const user = {
      email: generateRandomEmail(),
      phone: generateRandomPhoneNumber(),
      firstName: 'Test',
      lastName: 'User',
    };
    await use(user);
  },
});

export { expect } from '@playwright/test';
```

## Test Data Management

### JSON Test Data

```json
// test-data/medications.json
{
  "medications": [
    {
      "name": "Lisinopril",
      "dosages": ["5mg", "10mg", "20mg"],
      "category": "Blood Pressure"
    },
    {
      "name": "Metformin",
      "dosages": ["500mg", "850mg", "1000mg"],
      "category": "Diabetes"
    }
  ]
}
```

```typescript
// Using JSON test data
import medications from '../test-data/medications.json';

test('search for medication', async ({ page }) => {
  const medication = medications.medications[0];
  const searchPage = new PrescriptionSearchPage(page);
  
  await searchPage.navigate();
  await searchPage.searchByMedication(medication.name);
});
```

## Configuration Files

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: process.env.BASE_URL || 'https://your-app.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node", "@playwright/test"]
  },
  "include": ["tests/**/*", "page-objects/**/*", "fixtures/**/*", "utils/**/*"]
}
```

## Import Patterns

### Barrel Exports (index.ts)

```typescript
// page-objects/pharmacy/index.ts
export { PrescriptionSearchPage } from './PrescriptionSearchPage';
export { PrescriptionFormPage } from './PrescriptionFormPage';
export { MedicationDetailsPage } from './MedicationDetailsPage';

// Now import like this:
import { PrescriptionSearchPage, PrescriptionFormPage } from '../page-objects/pharmacy';
```

### Path Aliases (Optional)

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["page-objects/*"],
      "@fixtures/*": ["fixtures/*"],
      "@utils/*": ["utils/*"],
      "@test-data/*": ["test-data/*"]
    }
  }
}
```

```typescript
// Usage
import { LoginPage } from '@pages/auth/LoginPage';
import { createTestUser } from '@utils/test-data/user-generator';
```

## Best Practices

### 1. Group by Business Domain
```
✅ tests/pharmacy/prescription-flow/
✅ tests/pharmacy/medication-search/
❌ tests/critical/
❌ tests/smoke/
```

### 2. Co-locate Related Files
```
✅ tests/pharmacy/ + page-objects/pharmacy/ + utils/pharmacy/
❌ All page objects in one flat folder
```

### 3. Use Descriptive Names
```
✅ refill-prescription-with-remaining-refills.spec.ts
❌ test1.spec.ts
```

### 4. Avoid Deep Nesting
```
✅ tests/pharmacy/prescription-flow/refill.spec.ts (3 levels)
❌ tests/pharmacy/prescriptions/management/flows/refill/test.spec.ts (6+ levels)
```

### 5. One Concept Per File
```
✅ PrescriptionSearchPage.ts (one page)
❌ AllPrescriptionPages.ts (multiple pages in one file)
```

## Related Resources

- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
- [Migration Patterns](../migration-patterns/SKILL.md)
