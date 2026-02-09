---
name: CI/CD Integration
description: GitHub Actions setup, parallel execution, sharding, test filtering, artifact management, and pipeline optimization for Playwright tests
---

# CI/CD Integration Skill

## Overview

Running Playwright tests in CI/CD is essential for catching regressions before they reach production. This skill covers GitHub Actions configuration, parallel execution, sharding, test filtering, report management, and pipeline optimization patterns.

## GitHub Actions — Basic Setup

### 1. Minimal GitHub Actions Workflow

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run tests
        run: npx playwright test

      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

### 2. With Environment Variables & Secrets

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      BASE_URL: ${{ vars.BASE_URL || 'http://localhost:3000' }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run tests
        run: npx playwright test
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          TOTP_SECRET: ${{ secrets.TOTP_SECRET }}

      - name: Upload report
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

## Parallel Execution & Sharding

### 3. Sharding Across Multiple CI Machines

```yaml
# .github/workflows/playwright.yml
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Run tests (shard ${{ matrix.shard }})
        run: npx playwright test --shard=${{ matrix.shard }}

      - name: Upload shard report
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report-${{ strategy.job-index }}
          path: playwright-report/
          retention-days: 7

  # Merge shard reports into one
  merge-reports:
    needs: test
    runs-on: ubuntu-latest
    if: ${{ !cancelled() }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - name: Download shard reports
        uses: actions/download-artifact@v4
        with:
          pattern: playwright-report-*
          path: all-reports/

      - name: Merge reports
        run: npx playwright merge-reports --reporter=html all-reports/

      - name: Upload merged report
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-merged
          path: playwright-report/
          retention-days: 14
```

### 4. Playwright Config for Parallel Execution

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Number of parallel workers
  // CI: use fewer workers to avoid resource contention
  workers: process.env.CI ? 2 : undefined,

  // Fail the build after N test failures (saves CI time)
  maxFailures: process.env.CI ? 10 : undefined,

  // Retry failed tests in CI (catch flaky tests)
  retries: process.env.CI ? 2 : 0,

  // Reporter configuration
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github'], ['list']]
    : [['html', { open: 'on-failure' }]],
});
```

## Test Filtering in CI

### 5. Run Only Changed Tests on PR

```yaml
# .github/workflows/playwright-changed.yml
name: Playwright - Changed Tests Only

on:
  pull_request:
    branches: [main]

jobs:
  test-changed:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Need full history for diff

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Get changed test files
        id: changed
        run: |
          FILES=$(git diff --name-only origin/main...HEAD -- '*.spec.ts' '*.test.ts' | tr '\n' ' ')
          echo "files=$FILES" >> $GITHUB_OUTPUT
          echo "Changed test files: $FILES"

      - name: Run changed tests
        if: steps.changed.outputs.files != ''
        run: npx playwright test ${{ steps.changed.outputs.files }}

      - name: No tests changed
        if: steps.changed.outputs.files == ''
        run: echo "No test files changed in this PR"
```

### 6. Test Tags for Selective Execution

```typescript
// Tag tests for selective CI execution
test('user login @smoke @auth', async ({ page }) => {
  // This test runs in smoke suite
});

test('complex report generation @regression', async ({ page }) => {
  // This test only runs in full regression
});

test('payment flow @critical @payment', async ({ page }) => {
  // This test runs in critical path suite
});
```

```yaml
# Run only smoke tests on every PR
- name: Run smoke tests
  run: npx playwright test --grep @smoke

# Run full regression nightly
- name: Run regression
  run: npx playwright test --grep @regression

# Run critical path before deploy
- name: Run critical tests
  run: npx playwright test --grep @critical
```

### 7. Run Failed Tests from Last Run

```bash
# Re-run only tests that failed in the previous run
npx playwright test --last-failed

# Combine with retries
npx playwright test --last-failed --retries=2
```

## Artifacts & Reports

### 8. Upload Traces on Failure

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // Collect trace on first retry of a failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on first retry
    video: 'on-first-retry',
  },
});
```

```yaml
# Upload traces alongside report
- name: Upload traces
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: test-traces
    path: test-results/
    retention-days: 7
```

### 9. Combine Reports from Multiple Runs

```bash
# After downloading multiple report blobs
npx playwright merge-reports --reporter=html ./all-reports/

# Generate JSON for programmatic analysis
npx playwright merge-reports --reporter=json ./all-reports/ > results.json

# Multiple reporters at once
npx playwright merge-reports --reporter=html,json,list ./all-reports/
```

## Caching & Performance

### 10. Cache Playwright Browsers

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  id: playwright-cache
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

- name: Install Playwright browsers
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: npx playwright install --with-deps chromium

- name: Install system deps only (if browsers cached)
  if: steps.playwright-cache.outputs.cache-hit == 'true'
  run: npx playwright install-deps chromium
```

### 11. Speed Up CI Runs

```typescript
// playwright.config.ts — CI-optimized
export default defineConfig({
  // Only test Chromium in PR checks (full matrix on main)
  projects: process.env.CI && process.env.GITHUB_EVENT_NAME === 'pull_request'
    ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ],

  // Reduce workers in CI to avoid flakiness
  workers: process.env.CI ? 2 : undefined,

  // Shorter timeouts in CI (fail fast)
  timeout: process.env.CI ? 30_000 : 60_000,
  expect: {
    timeout: process.env.CI ? 5_000 : 10_000,
  },
});
```

## Docker Integration

### 12. Run Tests in Docker

```dockerfile
# Dockerfile.playwright
FROM mcr.microsoft.com/playwright:v1.50.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]
```

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 5s
      timeout: 3s
      retries: 10

  playwright:
    build:
      context: .
      dockerfile: Dockerfile.playwright
    depends_on:
      app:
        condition: service_healthy
    environment:
      - BASE_URL=http://app:3000
    volumes:
      - ./playwright-report:/app/playwright-report
      - ./test-results:/app/test-results
```

### 13. GitHub Actions with Docker

```yaml
- name: Run tests in Docker
  run: |
    docker compose -f docker-compose.test.yml up \
      --build --abort-on-container-exit --exit-code-from playwright
```

## Advanced CI Patterns

### 14. Scheduled Nightly Full Regression

```yaml
# .github/workflows/nightly.yml
name: Nightly Regression

on:
  schedule:
    - cron: '0 2 * * *' # 2 AM UTC daily
  workflow_dispatch: # Allow manual trigger

jobs:
  regression:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    strategy:
      fail-fast: false
      matrix:
        project: [chromium, firefox, webkit]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps

      - name: Run full regression (${{ matrix.project }})
        run: npx playwright test --project=${{ matrix.project }}

      - name: Upload report
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: report-${{ matrix.project }}
          path: playwright-report/
          retention-days: 30
```

### 15. Deploy Preview Testing

```yaml
# Test against Vercel/Netlify preview deployments
name: Preview Tests

on:
  deployment_status:

jobs:
  test:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Run tests against preview
        run: npx playwright test --grep @smoke
        env:
          BASE_URL: ${{ github.event.deployment_status.target_url }}
```

### 16. Status Checks & PR Comments

```yaml
- name: Add test results to PR
  if: github.event_name == 'pull_request' && !cancelled()
  uses: daun/playwright-report-summary@v3
  with:
    report-file: playwright-report/results.json
    comment-title: 'Playwright Test Results'
```

## Flaky Test Management

### 17. Retries in CI

```typescript
// playwright.config.ts
export default defineConfig({
  // Retry failed tests twice in CI
  retries: process.env.CI ? 2 : 0,
});
```

### 18. Track Flaky Tests

```yaml
# After test run, check for flaky tests (passed on retry)
- name: Check for flaky tests
  if: ${{ !cancelled() }}
  run: |
    if grep -q '"status":"flaky"' playwright-report/results.json 2>/dev/null; then
      echo "::warning::Flaky tests detected! Check the report for details."
    fi
```

## Quick Reference

| Goal | Command / Config |
|------|-----------------|
| Run in CI | `npx playwright test` with `process.env.CI` checks |
| Shard tests | `npx playwright test --shard=1/4` |
| Run by tag | `npx playwright test --grep @smoke` |
| Exclude tag | `npx playwright test --grep-invert @slow` |
| Changed files only | `git diff` + pass files to `npx playwright test` |
| Re-run failures | `npx playwright test --last-failed` |
| Merge reports | `npx playwright merge-reports --reporter=html ./reports/` |
| Cache browsers | Cache `~/.cache/ms-playwright` in CI |
| Single browser on PR | Conditional `projects` in config |
| Full matrix nightly | `schedule` cron + `matrix.project` |

## Related Skills

- [Test Fixtures & Setup](../test-fixtures-setup/SKILL.md) — Setup projects, global setup
- [Authentication Testing](../authentication-testing/SKILL.md) — Auth in CI pipelines
- [Debugging & Troubleshooting](../debugging-troubleshooting/SKILL.md) — Debugging CI failures
- [Playwright Best Practices](../playwright-best-practices/SKILL.md) — Core patterns
