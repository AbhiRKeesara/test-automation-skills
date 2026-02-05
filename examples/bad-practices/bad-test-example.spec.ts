// Example: Bad Playwright Test - Anti-patterns to Avoid
import { test, expect } from '@playwright/test';

test('test 1', async ({ page }) => {
  // ❌ Vague test name
  
  await page.goto('https://example.com/prescriptions');
  
  // ❌ Hard-coded wait - Never do this!
  await page.waitForTimeout(3000);
  
  // ❌ Brittle CSS selector - Will break if CSS classes change
  await page.locator('#search-input').fill('Lisinopril');
  
  // ❌ Another hard-coded wait
  await page.waitForTimeout(2000);
  
  // ❌ Ambiguous selector - Which button?
  await page.locator('button').click();
  
  // ❌ More waiting
  await page.waitForTimeout(5000);
  
  // ❌ Complex CSS selector - Very brittle
  await page.locator('div.container > div.results > div:nth-child(1) > button.refill').click();
  
  // ❌ No assertion! Test doesn't verify anything
});

test('refill test', async ({ page }) => {
  // ❌ Not descriptive enough
  
  await page.goto('https://example.com/prescriptions');
  
  // ❌ Using XPath - Even worse than CSS selectors
  await page.locator('//div[@class="search"]//input[@id="query"]').fill('123456');
  
  // ❌ Hard-coded timeout
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await page.locator('//button[contains(text(), "Search")]').click();
  
  // ❌ Weak assertion - Just checking if element exists, not if it's visible
  const button = await page.$('.refill-btn');
  expect(button).not.toBeNull();
  
  // ❌ Using page.$$ instead of proper Playwright selectors
  const items = await page.$$('.prescription-item');
  console.log('Found items:', items.length); // ❌ Console.log in test
  
  // ❌ No cleanup - test data left in database
});

test('prescription flow', async ({ page }) => {
  // ❌ This test depends on previous test's data
  
  await page.goto('https://example.com/prescriptions');
  
  // ❌ Assumes data from previous test exists
  await page.locator('#prescription-123').click(); // What if it doesn't exist?
  
  await page.waitForTimeout(2000); // ❌ Hard-coded wait
  
  // ❌ Checking implementation details instead of user-visible behavior
  const state = await page.evaluate(() => {
    return window.__APP_STATE__.prescriptions.length;
  });
  expect(state).toBeGreaterThan(0);
  
  // ❌ No verification of actual user experience
});

test.skip('broken test', async ({ page }) => {
  // ❌ Test is skipped instead of fixed
  await page.goto('https://example.com');
  // ... broken test code
});

test.only('debug test', async ({ page }) => {
  // ❌ test.only left in - will run only this test
  await page.goto('https://example.com');
  await page.pause(); // ❌ Debug statement left in
});

/**
 * Problems with these tests:
 * 
 * ❌ Vague test names
 * ❌ Hard-coded waits (waitForTimeout)
 * ❌ Brittle CSS and XPath selectors
 * ❌ No page objects - duplicated selectors
 * ❌ Weak or missing assertions
 * ❌ Tests depend on each other
 * ❌ No test isolation
 * ❌ No cleanup
 * ❌ Console.log statements
 * ❌ test.skip and test.only left in code
 * ❌ Testing implementation details
 * ❌ Ambiguous selectors
 * ❌ No use of accessible selectors
 * 
 * All of these make tests:
 * - Flaky (random failures)
 * - Slow (unnecessary waits)
 * - Brittle (break on minor UI changes)
 * - Hard to maintain
 * - Not testing actual user experience
 */
