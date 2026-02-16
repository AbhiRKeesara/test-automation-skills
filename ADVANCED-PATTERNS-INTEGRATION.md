# Advanced Patterns Integration Summary

This document summarizes the new skills and examples added for advanced Playwright patterns including selectors, interactions, iframes, shadow DOM, and dialog handling.

## New Skills Added

### 1. Iframe Handling (`skills/iframe-handling/`)
- **Purpose**: Working with iframes and nested frames
- **Key Patterns**:
  - Using `frameLocator()` API (modern approach)
  - Navigating nested frame hierarchies
  - Handling dynamic iframes
  - Building frame components in Page Object Model
- **Example File**: `examples/good-practices/iframe-nested-frames.spec.ts`

### 2. Shadow DOM Handling (`skills/shadow-dom-handling/`)
- **Purpose**: Testing web components with Shadow DOM
- **Key Patterns**:
  - Automatic shadow DOM piercing with Playwright
  - Chaining locators through shadow boundaries
  - Nested shadow components
  - Component objects for web components
- **Example File**: `examples/good-practices/shadow-dom-components.spec.ts`

### 3. Dialog Handling (`skills/dialog-handling/`)
- **Purpose**: Handling browser dialogs and modal components
- **Key Patterns**:
  - Alert, confirm, and prompt dialogs
  - Using `page.on('dialog')` listener
  - HTML dialog elements and custom modals
  - File chooser dialogs
- **Example File**: `examples/good-practices/dialog-alert-handling.spec.ts`

## Enhanced Existing Skills

### Action Utilities (`skills/action-utilities/`)
- **Added**: Advanced wait patterns section
- **New Methods in PageActions**:
  - `waitForRequest()` - Wait for API requests
  - `waitForResponse()` - Wait for API responses with conditions
  - `waitForSuccessResponse()` - Wait for 200 status
  - `waitForMultipleResponses()` - Wait for multiple APIs
  - `waitForCondition()` - Custom condition waits
  - `waitForNetworkIdle()` - Wait for network to settle
- **Example File**: `examples/good-practices/advanced-wait-patterns.spec.ts`

## Updated Documentation

### README.md
- Added 3 new skills to the skills table
- Updated folder structure diagram
- Updated skills count

### Examples Directory
Created 4 new example files demonstrating:
1. Nested frames navigation
2. Shadow DOM component testing
3. Browser dialog handling
4. Advanced wait patterns for API calls

## Key Concepts Covered

### Selector Strategies
- ✅ Prioritize `getBy` methods (covered in existing selector-strategies skill)
- ✅ Use test IDs for stability (already documented)
- ✅ Text-based selectors for accessibility (already covered)

### Advanced Interactions (NEW)
- ✅ Custom waits for API requests/responses
- ✅ Network idle states
- ✅ Iframe access and nested frames
- ✅ Alert/dialog handling
- ✅ Shadow DOM traversal

## Integration with Existing Skills

The new skills complement existing documentation:

| New Skill | Works With | Integration Point |
|-----------|------------|-------------------|
| Iframe Handling | Page Object Model | Frame component objects |
| Shadow DOM Handling | Selector Strategies | Semantic selectors in shadow DOM |
| Dialog Handling | Action Utilities | Dialog helpers in UIActions |
| Advanced Waits | Action Utilities | Network-based wait patterns |

## Real-World Use Cases

### E-commerce
- **Iframes**: Payment widgets (Stripe, PayPal)
- **Dialogs**: Order confirmation prompts
- **Waits**: Checkout flow with multiple API calls

### Dashboard Applications
- **Shadow DOM**: Web component libraries (Lit, Stencil)
- **Waits**: Dynamic data loading from multiple endpoints
- **Iframes**: Embedded analytics or chat widgets

### Forms and Modals
- **Dialogs**: Confirmation dialogs before destructive actions
- **Iframes**: File upload widgets, CAPTCHA
- **Waits**: Form validation API calls

## Best Practices Summary

### Wait Patterns
1. **Always set up listeners before triggering actions** (avoid race conditions)
2. **Use specific waits over timeouts** (waitForResponse vs waitForTimeout)
3. **Validate API responses** when waiting for network calls
4. **Combine waits appropriately** for complex multi-step flows

### Iframe Handling
1. **Use frameLocator() not frame()** (modern API)
2. **Wait for frame content** before interacting
3. **Chain locators** for nested frames
4. **Encapsulate in components** for reusability

### Shadow DOM
1. **Locate through host element** first
2. **Playwright auto-pierces** shadow boundaries
3. **Use semantic selectors** when possible
4. **Chain for nested components**

### Dialog Handling
1. **Set listener before action** to avoid hanging tests
2. **Always accept() or dismiss()** dialogs
3. **Validate message and type** for reliability
4. **Distinguish browser vs HTML dialogs**

## Migration Notes

If you're using these patterns:

- ✅ `page.frameLocator()` - Modern, use this
- ❌ `page.frame()` - Deprecated, avoid
- ✅ `widget.locator('.shadow-element')` - Auto-piercing
- ❌ `page.locator('widget >>> .shadow-element')` - Deprecated pierce syntax
- ✅ `page.on('dialog', handler)` - Event-based
- ✅ `page.waitForEvent('dialog')` - Promise-based

## Source Attribution

Examples and patterns adapted from:
- **Source**: Playwright Official Documentation
- **Patterns**: Modern Playwright best practices for advanced interactions
- **Repository**: Integrated with existing test-automation-skills structure

All patterns have been modernized for current Playwright best practices and integrated with existing repository structure.

## Next Steps

Consider exploring additional patterns:
- Advanced locator strategies
- API testing with fixtures
- Visual regression testing
- CI/CD integration patterns

---

**Added**: February 15, 2026
**Source**: Playwright Official Documentation - Advanced Patterns
