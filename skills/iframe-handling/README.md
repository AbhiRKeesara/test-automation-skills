# Iframe Handling

Learn how to work with iframes and nested frames in Playwright tests.

## What You'll Learn
- Accessing iframe content with `frameLocator()`
- Navigating nested frame hierarchies
- Handling dynamic iframes
- Building frame components in Page Object Model
- Debugging frame-related issues

## Quick Example

```typescript
// Access iframe content
const frame = page.frameLocator('#payment-iframe');
await frame.getByLabel('Card Number').fill('4242424242424242');

// Nested frames
const outerFrame = page.frameLocator('#outer');
const innerFrame = outerFrame.frameLocator('#inner');
await innerFrame.getByText('Content').click();
```

## See Full Documentation
[View SKILL.md](./SKILL.md) for comprehensive patterns and examples.
