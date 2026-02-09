---
name: Test Fixtures & Setup
description: Custom fixtures, test.extend(), setup/teardown projects, global setup, and test lifecycle management in Playwright
---

# Test Fixtures & Setup Skill

## Overview

Playwright fixtures are the foundation of well-structured tests. They provide reusable setup/teardown logic, enable dependency injection, and keep tests isolated and maintainable. This skill covers custom fixtures, setup projects, global configuration, and test lifecycle patterns.

## Why Fixtures Matter

```typescript
// ❌ BAD: Setup logic scattered in every test
test('user can view dashboard', async ({ page }) => {
  // Login setup repeated everywhere
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');

  // Actual test starts here...
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

// ✅ GOOD: Fixture handles setup, test focuses on behavior
test('user can view dashboard', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

## Core Concepts

### 1. Built-in Fixtures

Playwright provides these fixtures out of the box:

| Fixture | Scope | Purpose |
|---------|-------|---------|
| `page` | Test | Isolated browser page |
| `context` | Test | Browser context (cookies, storage) |
| `browser` | Worker | Shared browser instance |
| `browserName` | Worker | Current browser name |
| `request` | Test | API request context |

```typescript
test('uses built-in fixtures', async ({ page, context, browser, request }) => {
  // page = isolated page, fresh for each test
  // context = browser context with its own cookies/storage
  // browser = shared browser instance across tests in a worker
  // request = API request context for direct API calls
});
```

### 2. Creating Custom Fixtures with `test.extend()`

```typescript
// fixtures/base.ts
import { test as base, expect } from '@playwright/test';

// Define fixture types
type MyFixtures = {
  // Per-test fixtures (fresh for each test)
  homePage: Page;
  apiClient: APIRequestContext;

  // Per-worker fixtures (shared across tests in a worker)
  adminToken: string;
};

export const test = base.extend<MyFixtures>({
  // Simple fixture - runs setup before test, teardown after
  homePage: async ({ page }, use) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await use(page); // <-- test runs here
    // Teardown: anything after use() runs after the test
  },

  // Fixture with API client
  apiClient: async ({ request }, use) => {
    // Setup: create authenticated API client
    const response = await request.post('/api/auth/login', {
      data: { email: 'test@example.com', password: 'password123' }
    });
    const { token } = await response.json();

    const apiContext = await request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${token}` }
    });

    await use(apiContext);

    // Teardown: dispose API context
    await apiContext.dispose();
  },
});

export { expect };
```

### 3. Worker-Scoped Fixtures (Shared Across Tests)

```typescript
// fixtures/worker-fixtures.ts
import { test as base } from '@playwright/test';

type WorkerFixtures = {
  adminToken: string;
  testDatabase: { connectionString: string };
};

export const test = base.extend<{}, WorkerFixtures>({
  // Worker-scoped: created once per worker, shared across tests
  adminToken: [async ({}, use) => {
    // Expensive setup - only runs once per worker
    const response = await fetch('https://api.example.com/auth/admin', {
      method: 'POST',
      body: JSON.stringify({ key: process.env.ADMIN_KEY }),
    });
    const { token } = await response.json();

    await use(token);

    // Worker teardown
    console.log('Admin session cleaned up');
  }, { scope: 'worker' }],

  testDatabase: [async ({}, use) => {
    // Create isolated test database per worker
    const db = await createTestDatabase();
    await use(db);
    await db.cleanup();
  }, { scope: 'worker' }],
});
```

### 4. Fixture Composition (Building on Other Fixtures)

```typescript
// fixtures/index.ts
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  // Fixture that depends on another fixture
  authenticatedPage: async ({ page, loginPage }, use) => {
    await loginPage.loginAs('user@example.com', 'password123');
    await use(page); // page is now authenticated
  },
});

export { expect };
```

### 5. Auto-Fixtures (Always Run, Even If Not Referenced)

```typescript
export const test = base.extend<{ autoTracing: void }>({
  // Auto-fixture: runs for every test without being referenced
  autoTracing: [async ({ page }, use, testInfo) => {
    // Start tracing before test
    await page.context().tracing.start({
      screenshots: true,
      snapshots: true,
    });

    await use();

    // Save trace on failure
    if (testInfo.status !== 'passed') {
      const tracePath = testInfo.outputPath('trace.zip');
      await page.context().tracing.stop({ path: tracePath });
      testInfo.attachments.push({
        name: 'trace',
        path: tracePath,
        contentType: 'application/zip',
      });
    } else {
      await page.context().tracing.stop();
    }
  }, { auto: true }], // <-- auto: true means it runs for every test
});
```

## Setup Projects

### 6. Global Setup with Setup Projects

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    // Setup project: runs first, creates shared auth state
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Test projects: depend on setup, run after it completes
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
  ],
});
```

### 7. Authentication Setup Project

```typescript
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate as user', async ({ page }) => {
  // Perform login
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for auth to complete
  await page.waitForURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // Save storage state (cookies + localStorage)
  await page.context().storageState({ path: authFile });
});
```

```typescript
// playwright.config.ts - reference the saved auth state
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json', // Reuse saved auth
      },
      dependencies: ['setup'],
    },
  ],
});
```

### 8. Multiple Auth Roles

```typescript
// tests/auth.setup.ts
import { test as setup } from '@playwright/test';

const adminFile = '.auth/admin.json';
const userFile = '.auth/user.json';
const readonlyFile = '.auth/readonly.json';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/admin');
  await page.context().storageState({ path: adminFile });
});

setup('authenticate as user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: userFile });
});

setup('authenticate as readonly', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.READONLY_EMAIL!);
  await page.getByLabel('Password').fill(process.env.READONLY_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.context().storageState({ path: readonlyFile });
});
```

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'admin-tests',
      testDir: './tests/admin',
      use: { storageState: '.auth/admin.json' },
      dependencies: ['setup'],
    },
    {
      name: 'user-tests',
      testDir: './tests/user',
      use: { storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'readonly-tests',
      testDir: './tests/readonly',
      use: { storageState: '.auth/readonly.json' },
      dependencies: ['setup'],
    },
  ],
});
```

## Global Setup & Teardown

### 9. Global Setup File

```typescript
// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Seed test database
  await seedDatabase();

  // Create test data via API
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('/api/test/seed');
  await page.waitForResponse(resp => resp.url().includes('/api/test/seed') && resp.ok());

  await browser.close();
}

export default globalSetup;
```

```typescript
// global-teardown.ts
import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // Clean up test data
  await cleanupDatabase();
  // Remove temp files
  await removeTestArtifacts();
}

export default globalTeardown;
```

```typescript
// playwright.config.ts
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
});
```

### 10. Test Lifecycle Hooks

```typescript
import { test, expect } from '@playwright/test';

// Runs once before all tests in this file
test.beforeAll(async ({ browser }) => {
  console.log('Starting test suite...');
});

// Runs before each test
test.beforeEach(async ({ page }) => {
  // Navigate to starting point
  await page.goto('/');
  // Accept cookies if banner appears
  const cookieBanner = page.getByRole('button', { name: 'Accept' });
  if (await cookieBanner.isVisible({ timeout: 1000 }).catch(() => false)) {
    await cookieBanner.click();
  }
});

// Runs after each test
test.afterEach(async ({ page }, testInfo) => {
  // Screenshot on failure
  if (testInfo.status !== 'passed') {
    await page.screenshot({
      path: `screenshots/${testInfo.title}-failure.png`,
      fullPage: true,
    });
  }
});

// Runs once after all tests in this file
test.afterAll(async () => {
  console.log('Test suite complete.');
});
```

## Test Data Patterns

### 11. Test Data Factory Fixture

```typescript
// fixtures/test-data.ts
import { test as base } from '@playwright/test';
import { faker } from '@faker-js/faker';

type TestDataFixtures = {
  testUser: { email: string; password: string; name: string };
  testProduct: { name: string; price: number; sku: string };
  uniqueId: string;
};

export const test = base.extend<TestDataFixtures>({
  testUser: async ({}, use) => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      name: faker.person.fullName(),
    };
    await use(user);
  },

  testProduct: async ({}, use) => {
    const product = {
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
      sku: faker.string.alphanumeric(8).toUpperCase(),
    };
    await use(product);
  },

  uniqueId: async ({}, use) => {
    await use(`test-${Date.now()}-${faker.string.nanoid(6)}`);
  },
});
```

### 12. API-Based Test Data Setup

```typescript
// fixtures/api-data.ts
import { test as base } from '@playwright/test';

type ApiDataFixtures = {
  createdUser: { id: string; email: string };
  createdOrder: { id: string; total: number };
};

export const test = base.extend<ApiDataFixtures>({
  createdUser: async ({ request }, use) => {
    // Create user via API before test
    const response = await request.post('/api/users', {
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        role: 'user',
      },
    });
    const user = await response.json();

    await use(user);

    // Cleanup: delete user after test
    await request.delete(`/api/users/${user.id}`);
  },

  createdOrder: async ({ request, createdUser }, use) => {
    // Create order that depends on user fixture
    const response = await request.post('/api/orders', {
      data: {
        userId: createdUser.id,
        items: [{ productId: 'prod-1', quantity: 1 }],
      },
    });
    const order = await response.json();

    await use(order);

    // Cleanup: cancel order after test
    await request.delete(`/api/orders/${order.id}`);
  },
});
```

## Common Patterns

### 13. Parameterized Fixtures

```typescript
// Test with different viewport sizes
type ViewportFixtures = {
  viewportSize: { width: number; height: number };
};

export const test = base.extend<ViewportFixtures>({
  viewportSize: [{ width: 1280, height: 720 }, { option: true }],
});

// Override in config or test
test.use({ viewportSize: { width: 375, height: 667 } }); // Mobile
```

### 14. Fixture with Timeout

```typescript
export const test = base.extend({
  slowService: [async ({}, use) => {
    const service = await startSlowService();
    await use(service);
    await service.stop();
  }, { timeout: 60_000 }], // 60 second timeout for this fixture
});
```

### 15. Merging Multiple Fixture Files

```typescript
// fixtures/index.ts - combine all fixtures
import { mergeTests } from '@playwright/test';
import { test as authTest } from './auth-fixtures';
import { test as dataTest } from './data-fixtures';
import { test as pageTest } from './page-fixtures';

// Merge all fixtures into a single test object
export const test = mergeTests(authTest, dataTest, pageTest);
export { expect } from '@playwright/test';
```

## Anti-Patterns to Avoid

### ❌ Don't Use Global Variables for Shared State

```typescript
// ❌ BAD: Global mutable state
let authToken: string;

test.beforeAll(async () => {
  authToken = await getAuthToken();
});

test('uses global token', async ({ page }) => {
  // authToken might be undefined if beforeAll fails
  await page.setExtraHTTPHeaders({ Authorization: `Bearer ${authToken}` });
});

// ✅ GOOD: Use a worker-scoped fixture
export const test = base.extend<{}, { authToken: string }>({
  authToken: [async ({}, use) => {
    const token = await getAuthToken();
    await use(token);
  }, { scope: 'worker' }],
});
```

### ❌ Don't Skip Teardown

```typescript
// ❌ BAD: No cleanup - test data accumulates
test('create user', async ({ request }) => {
  await request.post('/api/users', { data: userData });
  // User is never cleaned up!
});

// ✅ GOOD: Fixture handles cleanup automatically
export const test = base.extend({
  testUser: async ({ request }, use) => {
    const resp = await request.post('/api/users', { data: userData });
    const user = await resp.json();
    await use(user);
    await request.delete(`/api/users/${user.id}`); // Always cleans up
  },
});
```

### ❌ Don't Hardcode Setup Data

```typescript
// ❌ BAD: Hardcoded data causes collisions in parallel runs
const TEST_EMAIL = 'test@example.com';

// ✅ GOOD: Generate unique data per test
const TEST_EMAIL = `test-${Date.now()}@example.com`;
```

## Quick Reference

| Pattern | When to Use | Scope |
|---------|-------------|-------|
| `test.extend()` | Custom reusable setup/teardown | Test or Worker |
| Setup projects | Auth state, database seeding | Before all tests |
| `globalSetup` | One-time environment prep | Before entire run |
| `beforeAll/afterAll` | Per-file setup/teardown | Test file |
| `beforeEach/afterEach` | Per-test setup/teardown | Each test |
| Auto-fixtures | Tracing, logging, screenshots | Every test |
| `mergeTests()` | Combining fixture files | Imports |

## Related Skills

- [Authentication Testing](../authentication-testing/SKILL.md) — Storage state, 2FA patterns
- [Page Object Model](../page-object-model/SKILL.md) — POM fixtures
- [Playwright Best Practices](../playwright-best-practices/SKILL.md) — Core patterns
- [CI/CD Integration](../ci-cd-integration/SKILL.md) — Setup projects in CI
