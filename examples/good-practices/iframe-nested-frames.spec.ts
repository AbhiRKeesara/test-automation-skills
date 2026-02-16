import { test, expect } from '@playwright/test';

/**
 * Example: Working with Nested Frames
 *
 * This demonstrates how to navigate complex frame hierarchies
 * using Playwright's frameLocator API.
 *
 * Source: Adapted from Playwright best practices
 */

test.describe('Nested Frames Example', () => {
  test('navigate nested frames and verify content', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/nested_frames');

    // Access top-level frame
    const topFrame = page.frameLocator('frame[name="frame-top"]');

    // Access nested frames within top frame
    const leftFrame = topFrame.frameLocator('frame[name="frame-left"]');
    const middleFrame = topFrame.frameLocator('frame[name="frame-middle"]');
    const rightFrame = topFrame.frameLocator('frame[name="frame-right"]');

    // Verify content in each nested frame
    await expect(leftFrame.locator('body')).toContainText('LEFT');
    await expect(middleFrame.locator('body')).toContainText('MIDDLE');
    await expect(rightFrame.locator('body')).toContainText('RIGHT');

    // Access sibling frame (bottom frame)
    const bottomFrame = page.frameLocator('frame[name="frame-bottom"]');
    await expect(bottomFrame.locator('body')).toContainText('BOTTOM');
  });

  test('interact with elements inside iframes', async ({ page }) => {
    await page.goto('https://testpages.eviltester.com/styled/iframes-test.html');

    // Locate the iframe
    const frame = page.frameLocator('#thedynamichtml');

    // Interact with elements inside the iframe
    await expect(frame.getByRole('heading', { name: 'iFrame' })).toBeVisible();

    // Can perform actions inside iframe just like regular page
    const links = frame.locator('a');
    const linkCount = await links.count();
    console.log(`Found ${linkCount} links in iframe`);
  });

  test('handle dynamic iframes', async ({ page }) => {
    await page.goto('https://example.com');

    // Wait for iframe to be added to DOM
    await page.waitForSelector('iframe#dynamic-widget');

    // Now safely access the frame
    const dynamicFrame = page.frameLocator('iframe#dynamic-widget');

    // Wait for content inside frame to be ready
    await expect(dynamicFrame.getByText('Widget Loaded')).toBeVisible();

    // Interact with frame content
    await dynamicFrame.getByRole('button', { name: 'Start' }).click();
  });
});

/**
 * Best Practices Demonstrated:
 *
 * ✅ Use frameLocator() instead of deprecated frame() API
 * ✅ Chain frameLocators for nested frames
 * ✅ Use semantic selectors (getByRole) inside frames
 * ✅ Wait for frames and content before interacting
 * ✅ Treat frames like regular pages for locators
 *
 * Common Pitfalls Avoided:
 *
 * ❌ Using page.frame() - deprecated
 * ❌ Not waiting for frame to load before accessing
 * ❌ Trying to use CSS selectors across frame boundaries
 * ❌ Forgetting to check if frame content is ready
 */
