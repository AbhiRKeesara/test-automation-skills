# Iframe Handling Skill

## Overview
This skill helps you work with iframes (inline frames) and nested frames in Playwright tests. Iframes are HTML elements that embed another document within the current page, creating isolated contexts that require special handling in test automation.

## When to Use
- Testing embedded content (maps, videos, third-party widgets)
- Interacting with content in separate frame contexts
- Navigating nested frame hierarchies
- Validating content across multiple frame boundaries

## Core Concepts

### Understanding Frames
- **Iframe**: An isolated browsing context embedded in a page
- **Frame Locator**: Playwright's mechanism to access iframe content
- **Frame Hierarchy**: Nested frames create parent-child relationships
- **Cross-origin**: Frames may come from different domains (security restrictions apply)

## Implementation Patterns

### 1. Basic Iframe Access

```typescript
import { test, expect } from '@playwright/test';

test('interact with iframe content', async ({ page }) => {
  await page.goto('https://example.com');

  // Locate the iframe using frameLocator
  const frame = page.frameLocator('#iframe-id');

  // Interact with elements inside the iframe
  await frame.getByRole('button', { name: 'Submit' }).click();

  // Assertions work the same way
  await expect(frame.getByRole('heading', { name: 'Welcome' }))
    .toBeVisible();
});
```

### 2. Nested Frames Navigation

```typescript
test('navigate nested frames', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/nested_frames');

  // Access top-level frame
  const topFrame = page.frameLocator('frame[name="frame-top"]');

  // Access nested frame within top frame
  const leftFrame = topFrame.frameLocator('frame[name="frame-left"]');
  const middleFrame = topFrame.frameLocator('frame[name="frame-middle"]');
  const rightFrame = topFrame.frameLocator('frame[name="frame-right"]');

  // Verify content in nested frames
  await expect(leftFrame.locator('body')).toContainText('LEFT');
  await expect(middleFrame.locator('body')).toContainText('MIDDLE');
  await expect(rightFrame.locator('body')).toContainText('RIGHT');

  // Access bottom frame (sibling to top frame)
  const bottomFrame = page.frameLocator('frame[name="frame-bottom"]');
  await expect(bottomFrame.locator('body')).toContainText('BOTTOM');
});
```

### 3. Multiple Iframe Selection

```typescript
test('work with multiple iframes', async ({ page }) => {
  await page.goto('https://example.com/multiple-frames');

  // Select iframe by index
  const firstFrame = page.frameLocator('iframe').first();
  const secondFrame = page.frameLocator('iframe').nth(1);

  // Select by CSS selector
  const namedFrame = page.frameLocator('iframe[name="content-frame"]');

  // Select by title attribute
  const titledFrame = page.frameLocator('iframe[title="Embedded Content"]');

  await firstFrame.getByText('First Frame Content').click();
});
```

### 4. Dynamic Iframe Handling

```typescript
test('wait for dynamic iframe to load', async ({ page }) => {
  await page.goto('https://example.com');

  // Trigger iframe loading
  await page.getByRole('button', { name: 'Load Widget' }).click();

  // Wait for iframe to appear in DOM
  await page.waitForSelector('iframe#dynamic-widget');

  // Now access the frame
  const dynamicFrame = page.frameLocator('iframe#dynamic-widget');

  // Wait for content inside frame to be ready
  await expect(dynamicFrame.getByText('Widget Loaded')).toBeVisible();
});
```

### 5. Frame with Auto-Wait

```typescript
test('frameLocator with auto-waiting', async ({ page }) => {
  await page.goto('https://example.com');

  const frame = page.frameLocator('#payment-iframe');

  // Playwright auto-waits for iframe and element
  await frame.getByLabel('Card Number').fill('4242424242424242');
  await frame.getByLabel('Expiry Date').fill('12/25');
  await frame.getByLabel('CVC').fill('123');
  await frame.getByRole('button', { name: 'Pay Now' }).click();
});
```

## Page Object Pattern for Iframes

### Frame Component Object

```typescript
// components/PaymentFrame.ts
import { FrameLocator } from '@playwright/test';

export class PaymentFrameComponent {
  constructor(private frame: FrameLocator) {}

  async fillCardDetails(cardNumber: string, expiry: string, cvc: string) {
    await this.frame.getByLabel('Card Number').fill(cardNumber);
    await this.frame.getByLabel('Expiry Date').fill(expiry);
    await this.frame.getByLabel('CVC').fill(cvc);
  }

  async submitPayment() {
    await this.frame.getByRole('button', { name: 'Pay Now' }).click();
  }

  async getErrorMessage() {
    return this.frame.getByRole('alert').textContent();
  }
}

// pages/CheckoutPage.ts
import { Page } from '@playwright/test';
import { PaymentFrameComponent } from '../components/PaymentFrame';

export class CheckoutPage {
  private paymentFrame: PaymentFrameComponent;

  constructor(private page: Page) {
    const frameLocator = page.frameLocator('#payment-iframe');
    this.paymentFrame = new PaymentFrameComponent(frameLocator);
  }

  async completePayment(cardNumber: string, expiry: string, cvc: string) {
    await this.paymentFrame.fillCardDetails(cardNumber, expiry, cvc);
    await this.paymentFrame.submitPayment();
  }
}
```

### Nested Frame Page Object

```typescript
// pages/ComplexFramePage.ts
import { Page, FrameLocator } from '@playwright/test';

export class ComplexFramePage {
  private outerFrame: FrameLocator;
  private innerFrame: FrameLocator;

  constructor(private page: Page) {
    this.outerFrame = page.frameLocator('#outer-frame');
    this.innerFrame = this.outerFrame.frameLocator('#inner-frame');
  }

  async fillNestedForm(data: { name: string; email: string }) {
    // Outer frame interaction
    await this.outerFrame.getByLabel('Category').selectOption('Business');

    // Inner frame interaction
    await this.innerFrame.getByLabel('Name').fill(data.name);
    await this.innerFrame.getByLabel('Email').fill(data.email);
  }

  async submitNestedForm() {
    await this.innerFrame.getByRole('button', { name: 'Submit' }).click();
  }
}
```

## Common Pitfalls & Solutions

### ❌ Using `frame()` instead of `frameLocator()`

```typescript
// OLD API (deprecated) - Don't use
const frame = await page.frame({ name: 'content' });
await frame.click('button');

// NEW API (recommended)
const frame = page.frameLocator('[name="content"]');
await frame.getByRole('button').click();
```

### ❌ Trying to Access Frame Before It Loads

```typescript
// Bad - may fail if frame isn't ready
const frame = page.frameLocator('#late-frame');
await frame.getByText('Content').click();

// Good - wait for frame to exist first
await page.waitForSelector('#late-frame');
const frame = page.frameLocator('#late-frame');
await frame.getByText('Content').click();
```

### ❌ Incorrect Frame Selector

```typescript
// Bad - won't find the iframe element
const frame = page.frameLocator('div.iframe-container');

// Good - select the actual iframe element
const frame = page.frameLocator('iframe.embedded-content');
// Or by attribute
const frame = page.frameLocator('iframe[name="widget"]');
```

### ❌ Not Handling Cross-Origin Restrictions

```typescript
// Some cross-origin frames may be restricted
test('handle cross-origin frames', async ({ page }) => {
  await page.goto('https://example.com');

  const frame = page.frameLocator('#third-party-widget');

  try {
    // This may fail for cross-origin frames with security restrictions
    await frame.getByText('Content').click();
  } catch (error) {
    console.log('Cross-origin frame access blocked');
    // Use alternative testing approach
  }
});
```

## Best Practices

### ✅ Use frameLocator for Modern Playwright

```typescript
// Preferred approach
const frame = page.frameLocator('#my-iframe');
await frame.getByRole('button', { name: 'Click Me' }).click();
```

### ✅ Chain Locators for Nested Frames

```typescript
const outerFrame = page.frameLocator('#outer');
const innerFrame = outerFrame.frameLocator('#inner');
await innerFrame.getByText('Deep Content').click();
```

### ✅ Encapsulate Frame Logic in Components

```typescript
// Reusable frame component
export class VideoPlayerFrame {
  constructor(private frame: FrameLocator) {}

  async play() {
    await this.frame.getByRole('button', { name: 'Play' }).click();
  }

  async pause() {
    await this.frame.getByRole('button', { name: 'Pause' }).click();
  }

  async isPlaying(): Promise<boolean> {
    const playButton = this.frame.getByRole('button', { name: 'Play' });
    return !(await playButton.isVisible());
  }
}
```

### ✅ Wait for Frame Content

```typescript
test('wait for frame content to load', async ({ page }) => {
  await page.goto('https://example.com');

  const frame = page.frameLocator('#async-iframe');

  // Wait for specific content inside frame
  await expect(frame.getByText('Loaded')).toBeVisible();

  // Now safe to interact
  await frame.getByRole('button', { name: 'Start' }).click();
});
```

## Testing Strategies

### Strategy 1: Isolated Frame Testing

```typescript
test.describe('Payment Frame Tests', () => {
  test('validates card number format', async ({ page }) => {
    await page.goto('https://checkout.example.com');

    const paymentFrame = page.frameLocator('#stripe-iframe');

    await paymentFrame.getByLabel('Card Number').fill('1234');
    await paymentFrame.getByRole('button', { name: 'Pay' }).click();

    await expect(paymentFrame.getByText('Invalid card number'))
      .toBeVisible();
  });
});
```

### Strategy 2: Integration Testing with Frames

```typescript
test('complete checkout flow with iframe payment', async ({ page }) => {
  await page.goto('https://shop.example.com/checkout');

  // Fill main page form
  await page.getByLabel('Shipping Address').fill('123 Main St');

  // Switch to payment iframe
  const paymentFrame = page.frameLocator('#payment-frame');
  await paymentFrame.getByLabel('Card Number').fill('4242424242424242');
  await paymentFrame.getByLabel('Expiry').fill('12/25');

  // Submit (button might be in main page or frame)
  await page.getByRole('button', { name: 'Complete Order' }).click();

  // Verify success
  await expect(page.getByText('Order Confirmed')).toBeVisible();
});
```

## Debugging Iframes

### Inspect Frame Structure

```typescript
test('debug frame structure', async ({ page }) => {
  await page.goto('https://example.com');

  // Log all frames on the page
  const frames = page.frames();
  console.log(`Total frames: ${frames.length}`);

  frames.forEach((frame, index) => {
    console.log(`Frame ${index}:`, {
      name: frame.name(),
      url: frame.url(),
    });
  });
});
```

### Take Screenshot of Frame Content

```typescript
test('screenshot frame content', async ({ page }) => {
  await page.goto('https://example.com');

  const frame = page.frameLocator('#content-frame');
  const element = frame.getByRole('region', { name: 'Main Content' });

  // Screenshot specific element in frame
  await element.screenshot({ path: 'frame-content.png' });
});
```

## Related Skills
- [Selector Strategies](../selector-strategies/SKILL.md) - Choosing the right selectors for frame elements
- [Action Utilities](../action-utilities/SKILL.md) - Advanced interaction patterns
- [Page Object Model](../page-object-model/SKILL.md) - Structuring frame components
- [Shadow DOM Handling](../shadow-dom-handling/SKILL.md) - Similar isolation patterns

## External Resources
- [Playwright Frames Documentation](https://playwright.dev/docs/frames)
- [FrameLocator API Reference](https://playwright.dev/docs/api/class-framelocator)
- [Nested Frames Example](https://the-internet.herokuapp.com/nested_frames)
