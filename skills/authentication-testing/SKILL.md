---
name: Authentication Testing
description: Storage state reuse, 2FA/TOTP testing, multi-role auth, session management, OAuth flows, and secure credential handling in Playwright
---

# Authentication Testing Skill

## Overview

Authentication is the most common setup step in end-to-end testing. This skill covers how to efficiently handle login flows, reuse auth state across tests, test 2FA/TOTP, manage multiple roles, and avoid common auth-related test failures.

## The #1 Rule: Authenticate Once, Reuse Everywhere

```typescript
// ❌ BAD: Every test logs in through the UI (slow, flaky)
test('view profile', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');
  // NOW the actual test begins...
  await page.goto('/profile');
});

// ✅ GOOD: Auth state saved once, reused via storageState
test('view profile', async ({ page }) => {
  // Already authenticated via storageState in config!
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
});
```

## Storage State Pattern

### 1. Save Auth State with Setup Project

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // Auth setup runs first
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },
    // All test projects depend on auth setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },
  ],
});
```

### 2. Auth Setup File

```typescript
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const USER_AUTH_FILE = '.auth/user.json';

setup('authenticate as standard user', async ({ page }) => {
  // Step 1: Navigate to login
  await page.goto('/login');

  // Step 2: Fill credentials
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);

  // Step 3: Submit and wait for redirect
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');

  // Step 4: Verify we're logged in
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // Step 5: Save auth state (cookies + localStorage)
  await page.context().storageState({ path: USER_AUTH_FILE });
});
```

### 3. Add .auth to .gitignore

```bash
# .gitignore
.auth/
```

## Multi-Role Authentication

### 4. Different Roles with Different Storage States

```typescript
// tests/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/admin');
  await page.context().storageState({ path: '.auth/admin.json' });
});

setup('authenticate as editor', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.EDITOR_EMAIL!);
  await page.getByLabel('Password').fill(process.env.EDITOR_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/editor');
  await page.context().storageState({ path: '.auth/editor.json' });
});

setup('authenticate as viewer', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.VIEWER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.VIEWER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: '.auth/viewer.json' });
});
```

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'auth-setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'admin-tests',
      testDir: './tests/admin',
      use: { storageState: '.auth/admin.json' },
      dependencies: ['auth-setup'],
    },
    {
      name: 'editor-tests',
      testDir: './tests/editor',
      use: { storageState: '.auth/editor.json' },
      dependencies: ['auth-setup'],
    },
    {
      name: 'viewer-tests',
      testDir: './tests/viewer',
      use: { storageState: '.auth/viewer.json' },
      dependencies: ['auth-setup'],
    },
  ],
});
```

### 5. Override Auth Per Test

```typescript
// Use a different role for specific tests
test.use({ storageState: '.auth/admin.json' });

test('admin can delete users', async ({ page }) => {
  await page.goto('/admin/users');
  // Already logged in as admin
});
```

### 6. No Auth for Specific Tests

```typescript
// Tests that need no authentication (login page, public pages)
test.use({ storageState: { cookies: [], origins: [] } });

test('login page shows form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('Email')).toBeVisible();
});
```

## Two-Factor Authentication (2FA / TOTP)

### 7. TOTP with otplib

```bash
npm install --save-dev otplib
```

```typescript
// tests/auth-2fa.setup.ts
import { test as setup } from '@playwright/test';
import { authenticator } from 'otplib';

setup('authenticate with 2FA', async ({ page }) => {
  // Step 1: Standard login
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Step 2: Wait for 2FA prompt
  await expect(page.getByText('Enter verification code')).toBeVisible();

  // Step 3: Generate TOTP code from secret
  const secret = process.env.TOTP_SECRET!;
  const totpCode = authenticator.generate(secret);

  // Step 4: Enter the TOTP code
  await page.getByLabel('Verification code').fill(totpCode);
  await page.getByRole('button', { name: 'Verify' }).click();

  // Step 5: Wait for auth to complete
  await page.waitForURL('/dashboard');

  // Step 6: Save state
  await page.context().storageState({ path: '.auth/user-2fa.json' });
});
```

### 8. Handle TOTP Timing Issues

```typescript
import { authenticator } from 'otplib';

// TOTP codes are time-based (30-second windows)
// If we're near the end of a window, the code might expire before submission
function getValidTotpCode(secret: string): string {
  const timeRemaining = authenticator.timeRemaining();

  // If less than 5 seconds remaining, wait for next window
  if (timeRemaining < 5) {
    const waitMs = (timeRemaining + 1) * 1000;
    // Use synchronous delay to wait for next TOTP window
    const start = Date.now();
    while (Date.now() - start < waitMs) {
      // busy wait
    }
  }

  return authenticator.generate(secret);
}
```

## API-Based Authentication (Faster)

### 9. Skip UI Login — Authenticate via API

```typescript
// tests/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate via API', async ({ request, page }) => {
  // Login via API (much faster than UI)
  const response = await request.post('/api/auth/login', {
    data: {
      email: process.env.TEST_USER_EMAIL!,
      password: process.env.TEST_USER_PASSWORD!,
    },
  });

  expect(response.ok()).toBeTruthy();
  const { token } = await response.json();

  // Set the token in browser context
  await page.goto('/');
  await page.evaluate((authToken) => {
    localStorage.setItem('auth_token', authToken);
  }, token);

  // Save the state
  await page.context().storageState({ path: '.auth/user.json' });
});
```

### 10. Cookie-Based API Auth

```typescript
setup('authenticate via API with cookies', async ({ request }) => {
  // API login returns Set-Cookie headers
  const response = await request.post('/api/auth/login', {
    data: {
      email: process.env.TEST_USER_EMAIL!,
      password: process.env.TEST_USER_PASSWORD!,
    },
  });

  // Cookies are automatically captured in the request context
  // Save the storage state including cookies
  await request.storageState({ path: '.auth/user.json' });
});
```

## Session Management

### 11. Handle Session Expiry

```typescript
// fixtures/auth-fixtures.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  // Auto-fixture: check session validity before each test
  ensureAuthenticated: [async ({ page }, use) => {
    // Check if session is still valid
    const response = await page.request.get('/api/auth/me');

    if (response.status() === 401) {
      // Session expired — re-authenticate
      console.warn('Session expired, re-authenticating...');
      await page.goto('/login');
      await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
      await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.waitForURL('/dashboard');
    }

    await use();
  }, { auto: true }],
});
```

### 12. Test Logout Behavior

```typescript
test('user can log out', async ({ page }) => {
  await page.goto('/dashboard');

  // Click logout
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();

  // Verify redirect to login
  await expect(page).toHaveURL('/login');

  // Verify protected routes are inaccessible
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
```

### 13. Test Session Timeout

```typescript
test('expired session redirects to login', async ({ browser }) => {
  // Create a new context with expired cookies
  const context = await browser.newContext({
    storageState: {
      cookies: [{
        name: 'session',
        value: 'expired-token-value',
        domain: 'localhost',
        path: '/',
        expires: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      }],
      origins: [],
    },
  });

  const page = await context.newPage();
  await page.goto('/dashboard');

  // Should redirect to login
  await expect(page).toHaveURL(/\/login/);
  await context.close();
});
```

## OAuth / SSO Testing

### 14. Mock OAuth Provider

```typescript
test('OAuth login flow', async ({ page }) => {
  // Intercept the OAuth redirect to mock the provider
  await page.route('**/oauth/authorize*', async (route) => {
    const url = new URL(route.request().url());
    const redirectUri = url.searchParams.get('redirect_uri')!;
    const state = url.searchParams.get('state')!;

    // Simulate successful OAuth callback
    await route.fulfill({
      status: 302,
      headers: {
        location: `${redirectUri}?code=mock-auth-code&state=${state}`,
      },
    });
  });

  // Mock the token exchange
  await page.route('**/oauth/token', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
      }),
    });
  });

  // Click SSO login button
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in with Google' }).click();

  // Should complete OAuth flow and land on dashboard
  await expect(page).toHaveURL('/dashboard');
});
```

## Credential Management

### 15. Environment Variables (Required)

```bash
# .env.test (NEVER commit this file)
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=secure-test-password
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin-secure-password
TOTP_SECRET=JBSWY3DPEHPK3PXP
```

```typescript
// playwright.config.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

export default defineConfig({
  // ... config
});
```

```bash
# .gitignore
.env.test
.env.local
.auth/
```

### 16. Never Hardcode Credentials

```typescript
// ❌ BAD: Credentials in test code
await page.getByLabel('Email').fill('admin@company.com');
await page.getByLabel('Password').fill('P@ssw0rd!');

// ✅ GOOD: Read from environment
await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL!);
await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD!);
```

## Anti-Patterns

### ❌ Don't Login Through UI in Every Test

```typescript
// ❌ BAD: 50 tests × 3-second login = 2.5 minutes wasted
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
});

// ✅ GOOD: Login once with setup project, reuse storageState
// (See sections 1-2 above)
```

### ❌ Don't Share Auth State Between Parallel Workers

```typescript
// ❌ BAD: Multiple workers writing to same file
setup('login', async ({ page }) => {
  await page.context().storageState({ path: 'auth.json' }); // Race condition!
});

// ✅ GOOD: Each role gets its own file, setup runs once before workers start
```

### ❌ Don't Store Tokens in Test Code

```typescript
// ❌ BAD: Token in source code
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// ✅ GOOD: Token generated dynamically in setup
setup('get auth token', async ({ request }) => {
  const resp = await request.post('/api/auth/login', { data: credentials });
  const { token } = await resp.json();
  // Use token via fixture, not hardcoded
});
```

## Quick Reference

| Scenario | Approach |
|----------|----------|
| Standard login | Setup project + `storageState` |
| Multiple roles | Multiple setup steps + role-specific state files |
| 2FA / TOTP | `otplib` to generate codes in setup |
| API-heavy app | API login (skip UI) + set token in `localStorage` |
| OAuth / SSO | Mock the OAuth provider with `page.route()` |
| Public pages | `storageState: { cookies: [], origins: [] }` |
| Session expiry | Auto-fixture to check + re-auth if needed |
| CI/CD | Env vars from secrets manager |

## Related Skills

- [Test Fixtures & Setup](../test-fixtures-setup/SKILL.md) — Custom fixtures, `test.extend()`
- [Page Object Model](../page-object-model/SKILL.md) — POM with auth fixtures
- [Error Handling](../error-handling/SKILL.md) — Handle auth failures gracefully
- [CI/CD Integration](../ci-cd-integration/SKILL.md) — Secrets management in pipelines
