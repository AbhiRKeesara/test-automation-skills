// Bad Practice Example: Authentication Flow (ANTI-PATTERN)
// This demonstrates common mistakes - DO NOT FOLLOW THIS PATTERN

import { test } from '@playwright/test';

// ❌ BAD: No test.describe grouping
test('test1', async ({ page }) => {
  // ❌ BAD: Non-descriptive test name
  
  // ❌ BAD: CSS selectors instead of semantic selectors
  await page.goto('http://localhost:3000/login'); // ❌ Hardcoded URL
  
  // ❌ BAD: Using CSS IDs
  await page.locator('#email').fill('user@test.com');
  await page.locator('#password').fill('Test123!');
  await page.locator('#submit-btn').click();
  
  // ❌ BAD: Hard-coded wait
  await page.waitForTimeout(2000);
  
  // ❌ BAD: No assertions - test doesn't verify anything!
});

test('test2', async ({ page }) => {
  // ❌ BAD: Depends on previous test
  // Assumes already logged in from test1
  
  // ❌ BAD: Complex CSS selector
  await page.locator('div.container > div.sidebar > button.logout-btn').click();
  
  // ❌ BAD: Another hard-coded wait
  await page.waitForTimeout(3000);
  
  // ❌ BAD: Still no assertions
});

// ❌ BAD: Uses 'any' type
test('test3', async ({ page }: any) => {
  await page.goto('http://localhost:3000/login');
  
  // ❌ BAD: Missing await
  page.locator('#email').fill('bad@test.com');
  
  // ❌ BAD: Using nth() without context
  const buttons = await page.locator('button');
  await buttons.nth(2).click();
  
  // ❌ BAD: Using page.evaluate for simple tasks
  const isVisible = await page.evaluate(() => {
    const el = document.querySelector('.error-message');
    return el ? true : false;
  });
  
  if (isVisible) {
    console.log('Error shown'); // ❌ Using console.log
  }
  
  // ❌ BAD: Still no assertions
});

test('test with hardcoded waits everywhere', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  
  // ❌ BAD: Waiting before every action
  await page.waitForTimeout(1000);
  await page.locator('#email').fill('user@test.com');
  
  await page.waitForTimeout(1000);
  await page.locator('#password').fill('pass');
  
  await page.waitForTimeout(1000);
  await page.locator('#submit').click();
  
  await page.waitForTimeout(5000); // ❌ Excessive wait
  
  // ❌ Still no verification
});

// ❌ BAD: God test (does too many things)
test('complete user journey', async ({ page }) => {
  // Does login, create order, edit profile, logout all in one test
  // This should be separate tests
  
  await page.goto('http://localhost:3000/login');
  await page.locator('#email').fill('user@test.com');
  await page.locator('#password').fill('Test123!');
  await page.click('#submit');
  await page.waitForTimeout(2000);
  
  // Create order
  await page.click('.nav-orders');
  await page.waitForTimeout(1000);
  await page.click('#new-order');
  // ... 100 more lines
  
  // Edit profile
  await page.click('.nav-profile');
  // ... 50 more lines
  
  // Logout
  await page.click('.logout');
  // ❌ No assertions anywhere
});
