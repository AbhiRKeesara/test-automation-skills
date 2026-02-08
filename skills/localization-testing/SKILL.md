---
name: localization-testing
description: >
  Internationalization (i18n) and localization (l10n) testing with Playwright. Use when testing multi-language apps, validating date/number/currency formats across locales, testing RTL layouts, pluralization rules, or translation file completeness.
---

# Localization Testing Skill

Guide for testing internationalization (i18n) and localization (l10n) in Playwright.

## Core Concepts

**Internationalization (i18n):** Making your app support multiple languages
**Localization (l10n):** Adapting your app for specific languages/regions

## Quick Start

### Testing Multiple Locales

```typescript
import { test, expect } from '@playwright/test';

test('app displays in Spanish', async ({ page }) => {
  await page.goto('/es/products');

  await expect(page.getByRole('heading', { name: 'Productos' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
});

test('app displays in French', async ({ page }) => {
  await page.goto('/fr/products');

  await expect(page.getByRole('heading', { name: 'Produits' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rechercher' })).toBeVisible();
});
```

## Testing Strategies

### 1. Parameterized Locale Tests

```typescript
const locales = [
  { code: 'en', name: 'English', heading: 'Products', button: 'Search' },
  { code: 'es', name: 'Spanish', heading: 'Productos', button: 'Buscar' },
  { code: 'fr', name: 'French', heading: 'Produits', button: 'Rechercher' },
  { code: 'de', name: 'German', heading: 'Produkte', button: 'Suchen' },
];

for (const locale of locales) {
  test(`product page displays correctly in ${locale.name}`, async ({ page }) => {
    await page.goto(`/${locale.code}/products`);

    await expect(page.getByRole('heading', { name: locale.heading })).toBeVisible();
    await expect(page.getByRole('button', { name: locale.button })).toBeVisible();
  });
}
```

### 2. Testing Date/Time Formats

```typescript
test('dates display in US format', async ({ page }) => {
  await page.goto('/en-US/orders/123');

  // US: MM/DD/YYYY
  await expect(page.getByText('01/31/2026')).toBeVisible();
});

test('dates display in EU format', async ({ page }) => {
  await page.goto('/en-GB/orders/123');

  // GB: DD/MM/YYYY
  await expect(page.getByText('31/01/2026')).toBeVisible();
});

test('dates display in ISO format', async ({ page }) => {
  await page.goto('/de-DE/orders/123');

  // ISO: YYYY-MM-DD
  await expect(page.getByText('2026-01-31')).toBeVisible();
});
```

### 3. Testing Currency Formats

```typescript
test('prices display in USD', async ({ page }) => {
  await page.goto('/en-US/checkout');

  await expect(page.getByText('$29.99')).toBeVisible();
});

test('prices display in EUR', async ({ page }) => {
  await page.goto('/de-DE/checkout');

  await expect(page.getByText('29,99 €')).toBeVisible();
});

test('prices display in GBP', async ({ page }) => {
  await page.goto('/en-GB/checkout');

  await expect(page.getByText('£29.99')).toBeVisible();
});
```

### 4. Testing Number Formats

```typescript
test('numbers use US formatting', async ({ page }) => {
  await page.goto('/en-US/analytics');

  // US: 1,234,567.89
  await expect(page.getByText('1,234,567.89')).toBeVisible();
});

test('numbers use European formatting', async ({ page }) => {
  await page.goto('/de-DE/analytics');

  // DE: 1.234.567,89
  await expect(page.getByText('1.234.567,89')).toBeVisible();
});
```

### 5. Right-to-Left (RTL) Language Testing

```typescript
test('Arabic layout is RTL', async ({ page }) => {
  await page.goto('/ar/products');

  const main = page.getByRole('main');
  await expect(main).toHaveCSS('direction', 'rtl');

  // Verify text alignment
  const heading = page.getByRole('heading').first();
  await expect(heading).toHaveCSS('text-align', 'right');
});

test('Hebrew layout is RTL', async ({ page }) => {
  await page.goto('/he/products');

  const main = page.getByRole('main');
  await expect(main).toHaveCSS('direction', 'rtl');
});
```

## Locale Fixture Pattern

### Create a Locale Fixture

```typescript
// fixtures/locale.fixture.ts
import { test as base } from '@playwright/test';

type LocaleFixtures = {
  locale: string;
  localePage: Page;
};

export const test = base.extend<LocaleFixtures>({
  locale: ['en-US', { option: true }],

  localePage: async ({ page, locale }, use) => {
    // Set Accept-Language header
    await page.setExtraHTTPHeaders({
      'Accept-Language': locale
    });

    // Navigate to locale-specific URL
    page.goto = (url, options) => {
      const localeUrl = `/${locale}${url}`;
      return page.goto(localeUrl, options);
    };

    await use(page);
  },
});

export { expect } from '@playwright/test';
```

### Using the Fixture

```typescript
import { test, expect } from '../fixtures/locale.fixture';

test.use({ locale: 'es-ES' });

test('Spanish product page', async ({ localePage }) => {
  await localePage.goto('/products');

  await expect(localePage.getByRole('heading', { name: 'Productos' })).toBeVisible();
});
```

## Testing Translation Coverage

### Verify All Text is Translated

```typescript
test('no English text on Spanish page', async ({ page }) => {
  await page.goto('/es/products');

  const content = await page.textContent('body');

  // Check for common English words that shouldn't appear
  const englishWords = ['product', 'search', 'cart', 'cancel'];

  for (const word of englishWords) {
    expect(content?.toLowerCase()).not.toContain(word);
  }
});

test('all labels are translated', async ({ page }) => {
  await page.goto('/fr/checkout');

  // Verify form labels are in French
  await expect(page.getByLabel('Nom du produit')).toBeVisible();
  await expect(page.getByLabel('Quantité')).toBeVisible();
  await expect(page.getByLabel('Adresse')).toBeVisible();
});
```

## Browser Locale Testing

### Set Browser Locale

```typescript
import { test, expect, chromium } from '@playwright/test';

test('test with French browser locale', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris'
  });

  const page = await context.newPage();
  await page.goto('/products');

  // Browser will send Accept-Language: fr-FR
  await expect(page.getByRole('heading', { name: 'Produits' })).toBeVisible();

  await browser.close();
});
```

### Configure in playwright.config.ts

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium-en-US',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'en-US',
        timezoneId: 'America/New_York',
      },
    },
    {
      name: 'chromium-es-ES',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'es-ES',
        timezoneId: 'Europe/Madrid',
      },
    },
    {
      name: 'chromium-fr-FR',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'fr-FR',
        timezoneId: 'Europe/Paris',
      },
    },
  ],
});
```

## Locale-Specific Test Data

### Translation Test Data

```typescript
// test-data/translations.ts
export const translations = {
  'en-US': {
    products: 'Products',
    search: 'Search',
    addToCart: 'Add to Cart',
    cancel: 'Cancel',
  },
  'es-ES': {
    products: 'Productos',
    search: 'Buscar',
    addToCart: 'Añadir al carrito',
    cancel: 'Cancelar',
  },
  'fr-FR': {
    products: 'Produits',
    search: 'Rechercher',
    addToCart: 'Ajouter au panier',
    cancel: 'Annuler',
  },
};

// Use in tests
import { translations } from '../test-data/translations';

test('search in multiple languages', async ({ page }) => {
  for (const [locale, trans] of Object.entries(translations)) {
    await page.goto(`/${locale}/products`);

    await expect(page.getByRole('heading', { name: trans.products })).toBeVisible();
    await expect(page.getByRole('button', { name: trans.search })).toBeVisible();
  }
});
```

## Common Localization Issues

### Issue 1: Hardcoded Text

```typescript
// ❌ Bad - Hardcoded English
test('bad test', async ({ page }) => {
  await expect(page.getByText('Submit')).toBeVisible();
});

// ✅ Good - Locale-aware
test('good test', async ({ page, locale }) => {
  const translations = {
    'en': 'Submit',
    'es': 'Enviar',
    'fr': 'Soumettre',
  };

  await expect(page.getByText(translations[locale])).toBeVisible();
});
```

### Issue 2: String Concatenation

```typescript
// ❌ Bad - Breaks in some languages
const message = `Hello ${userName}, you have ${count} items in cart`;

// ✅ Good - Use translation placeholders
const message = t('cart.greeting', { userName, count });
// "Hello {userName}, you have {count} items in cart" (English)
// "{userName}, tienes {count} artículos en el carrito" (Spanish)
```

### Issue 3: Fixed Width Assumptions

```typescript
// ❌ Bad - German text is longer
test('button width', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Submit' });
  await expect(button).toHaveCSS('width', '100px'); // Breaks for "Einreichen"
});

// ✅ Good - Flexible width
test('button is visible', async ({ page }) => {
  const button = page.getByRole('button', { name: translations[locale].submit });
  await expect(button).toBeVisible(); // Doesn't care about width
});
```

## Pluralization Handling

### Testing Plural Forms

```typescript
test.describe('Pluralization', () => {
  const pluralCases = [
    { count: 0, en: 'No items', es: 'Sin artículos', ar: 'لا عناصر' },
    { count: 1, en: '1 item', es: '1 artículo', ar: 'عنصر واحد' },
    { count: 2, en: '2 items', es: '2 artículos', ar: 'عنصران' },
    { count: 5, en: '5 items', es: '5 artículos', ar: '5 عناصر' },
    { count: 11, en: '11 items', es: '11 artículos', ar: '11 عنصرًا' },
    { count: 100, en: '100 items', es: '100 artículos', ar: '100 عنصر' },
  ];

  for (const { count, en } of pluralCases) {
    test(`should display correct English plural for ${count} items`, async ({ page }) => {
      await page.goto(`/en/cart?itemCount=${count}`);
      await expect(page.getByTestId('item-count')).toHaveText(en);
    });
  }
});
```

### ICU Message Format Testing

```typescript
// Test apps using ICU MessageFormat for pluralization
// Pattern: "{count, plural, =0 {No items} one {# item} other {# items}}"

test('should handle ICU plural rules correctly', async ({ page }) => {
  const icuTestCases = [
    { locale: 'en', count: 1, expected: '1 item in your cart' },
    { locale: 'en', count: 5, expected: '5 items in your cart' },
    { locale: 'pl', count: 2, expected: '2 przedmioty w koszyku' },  // Polish has complex plural rules
    { locale: 'pl', count: 5, expected: '5 przedmiotów w koszyku' },
    { locale: 'ru', count: 1, expected: '1 товар в корзине' },       // Russian has 3 plural forms
    { locale: 'ru', count: 3, expected: '3 товара в корзине' },
    { locale: 'ru', count: 5, expected: '5 товаров в корзине' },
  ];

  for (const { locale, count, expected } of icuTestCases) {
    await page.goto(`/${locale}/cart?itemCount=${count}`);
    await expect(page.getByTestId('cart-summary')).toHaveText(expected);
  }
});
```

### Gender-Specific Translations

```typescript
test('should handle gendered translations', async ({ page }) => {
  // Some languages have gendered forms
  const genderCases = [
    { locale: 'fr', gender: 'male', expected: 'Bienvenu, Jean' },
    { locale: 'fr', gender: 'female', expected: 'Bienvenue, Marie' },
    { locale: 'de', gender: 'male', expected: 'Willkommen, Herr Schmidt' },
    { locale: 'de', gender: 'female', expected: 'Willkommen, Frau Schmidt' },
  ];

  for (const { locale, gender, expected } of genderCases) {
    await page.goto(`/${locale}/profile?gender=${gender}`);
    await expect(page.getByTestId('welcome-message')).toHaveText(expected);
  }
});
```

---

## Translation File Testing

### Verifying Translation Completeness

```typescript
// utils/translation-validator.ts
import * as fs from 'fs';
import * as path from 'path';

interface TranslationFile {
  [key: string]: string | TranslationFile;
}

/**
 * Get all keys from a translation JSON file (flattened).
 */
function getTranslationKeys(obj: TranslationFile, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      keys.push(...getTranslationKeys(value as TranslationFile, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

export function findMissingTranslations(
  baseLocale: string,
  targetLocale: string,
  translationsDir: string
): string[] {
  const basePath = path.join(translationsDir, `${baseLocale}.json`);
  const targetPath = path.join(translationsDir, `${targetLocale}.json`);

  const baseKeys = getTranslationKeys(JSON.parse(fs.readFileSync(basePath, 'utf-8')));
  const targetKeys = getTranslationKeys(JSON.parse(fs.readFileSync(targetPath, 'utf-8')));

  return baseKeys.filter((key) => !targetKeys.includes(key));
}
```

### Testing Translation Files in CI

```typescript
import { test, expect } from '@playwright/test';
import { findMissingTranslations } from '../utils/translation-validator';

const supportedLocales = ['es', 'fr', 'de', 'ja', 'ar', 'zh'];

for (const locale of supportedLocales) {
  test(`translation file for ${locale} should have all keys`, () => {
    const missing = findMissingTranslations('en', locale, './src/locales');

    expect(
      missing,
      `Missing ${missing.length} translation keys in ${locale}.json:\n${missing.join('\n')}`
    ).toHaveLength(0);
  });
}

test('should not have unused translation keys', () => {
  // Check for keys in translation files that are not used in the codebase
  // This is a simplified check — in real projects use tools like i18n-unused
  const enTranslations = JSON.parse(
    require('fs').readFileSync('./src/locales/en.json', 'utf-8')
  );

  const sourceCode = require('fs').readFileSync('./src/**/*.{ts,tsx}', 'utf-8');

  // Check each key is referenced in source
  for (const key of Object.keys(enTranslations)) {
    expect(
      sourceCode.includes(key),
      `Translation key "${key}" may be unused`
    ).toBeTruthy();
  }
});
```

### Dynamic Translation Loading Test

```typescript
test('should load translations on demand for lazy-loaded routes', async ({ page }) => {
  // Monitor network for translation file requests
  const translationRequests: string[] = [];

  page.on('request', (req) => {
    if (req.url().includes('/locales/')) {
      translationRequests.push(req.url());
    }
  });

  // Navigate to main page — should load common translations only
  await page.goto('/fr/products');
  expect(translationRequests.some((r) => r.includes('fr/common.json'))).toBeTruthy();

  // Navigate to admin — should load admin-specific translations
  await page.goto('/fr/admin/settings');
  expect(translationRequests.some((r) => r.includes('fr/admin.json'))).toBeTruthy();
});
```

---

## Advanced RTL Testing

### Comprehensive RTL Layout Verification

```typescript
test.describe('RTL Layout Testing', () => {
  test('full page layout should mirror for Arabic', async ({ page }) => {
    await page.goto('/ar/products');

    // Verify document direction
    const htmlDir = await page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('rtl');

    // Verify navigation is on the right
    const nav = page.getByRole('navigation');
    const navBox = await nav.boundingBox();
    const viewportSize = page.viewportSize();

    // In RTL, nav should be closer to right edge
    expect(navBox!.x + navBox!.width).toBeCloseTo(viewportSize!.width, -1);

    // Verify sidebar is on the right (mirrored)
    const sidebar = page.getByRole('complementary');
    if (await sidebar.isVisible()) {
      const sidebarBox = await sidebar.boundingBox();
      expect(sidebarBox!.x + sidebarBox!.width).toBeCloseTo(viewportSize!.width, -1);
    }
  });

  test('bidirectional text should render correctly', async ({ page }) => {
    await page.goto('/ar/products');

    // Product names may contain English brand names within Arabic text
    const productTitle = page.getByTestId('product-title').first();
    await expect(productTitle).toBeVisible();

    // Verify the element handles bidi text properly
    const direction = await productTitle.evaluate(
      (el) => window.getComputedStyle(el).direction
    );
    expect(direction).toBe('rtl');

    // Check unicode-bidi is set for mixed content
    const unicodeBidi = await productTitle.evaluate(
      (el) => window.getComputedStyle(el).unicodeBidi
    );
    expect(['embed', 'isolate', 'plaintext']).toContain(unicodeBidi);
  });

  test('form inputs should align correctly in RTL', async ({ page }) => {
    await page.goto('/ar/checkout');

    const emailInput = page.getByLabel('البريد الإلكتروني'); // Email in Arabic
    await expect(emailInput).toBeVisible();

    // Input text should be right-aligned
    const textAlign = await emailInput.evaluate(
      (el) => window.getComputedStyle(el).textAlign
    );
    expect(['right', 'start']).toContain(textAlign);

    // Labels should appear on the right side
    const label = page.locator('label[for="email"]');
    const labelBox = await label.boundingBox();
    const inputBox = await emailInput.boundingBox();

    // In RTL, label should be to the right of (or above) the input
    if (labelBox!.y === inputBox!.y) {
      expect(labelBox!.x).toBeGreaterThan(inputBox!.x);
    }
  });

  test('icons and arrows should mirror in RTL', async ({ page }) => {
    await page.goto('/ar/products');

    // Check that directional icons are mirrored via CSS transform
    const backArrow = page.getByTestId('back-arrow');
    if (await backArrow.isVisible()) {
      const transform = await backArrow.evaluate(
        (el) => window.getComputedStyle(el).transform
      );
      // Should have scaleX(-1) or matrix with negative first value
      expect(transform).toMatch(/-1/);
    }

    // Check that non-directional icons are NOT mirrored
    const searchIcon = page.getByTestId('search-icon');
    if (await searchIcon.isVisible()) {
      const transform = await searchIcon.evaluate(
        (el) => window.getComputedStyle(el).transform
      );
      expect(transform).not.toMatch(/-1/);
    }
  });
});
```

### RTL Snapshot Testing

```typescript
test('RTL layout snapshot should match', async ({ page }) => {
  await page.goto('/ar/products');

  // Compare RTL layout against baseline
  await expect(page).toHaveScreenshot('products-rtl.png', {
    maxDiffPixelRatio: 0.02,
    fullPage: true,
  });
});

test('LTR layout snapshot should match', async ({ page }) => {
  await page.goto('/en/products');

  await expect(page).toHaveScreenshot('products-ltr.png', {
    maxDiffPixelRatio: 0.02,
    fullPage: true,
  });
});
```

---

## Text Expansion & Overflow Testing

### Verify UI Handles Long Translations

```typescript
test.describe('Text Expansion', () => {
  // German and Finnish texts are often 30-40% longer than English
  test('buttons should not overflow with long translations', async ({ page }) => {
    await page.goto('/de/checkout');

    const buttons = page.getByRole('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();

      // Button text should not overflow its container
      const isOverflowing = await button.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
      });

      expect(
        isOverflowing,
        `Button "${await button.textContent()}" is overflowing at ${box?.width}px wide`
      ).toBeFalsy();
    }
  });

  test('table headers should handle long translations', async ({ page }) => {
    await page.goto('/de/orders');

    const headers = page.getByRole('columnheader');
    const count = await headers.count();

    for (let i = 0; i < count; i++) {
      const header = headers.nth(i);
      const isOverflowing = await header.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
      });

      expect(
        isOverflowing,
        `Column header "${await header.textContent()}" is overflowing`
      ).toBeFalsy();
    }
  });
});
```

---

## Localization Test Checklist

### Translation Coverage
- [ ] All text is translated (no hardcoded English)
- [ ] Form validation messages are translated
- [ ] Error messages are translated
- [ ] Success messages are translated
- [ ] Placeholder text is translated
- [ ] Tooltip content is translated
- [ ] ARIA labels are translated for accessibility

### Formatting
- [ ] Dates formatted correctly for locale
- [ ] Numbers formatted correctly for locale
- [ ] Currency symbols and formatting correct
- [ ] Phone number formats are locale-aware
- [ ] Address formats follow local conventions

### Pluralization
- [ ] Plural forms work correctly (0, 1, 2, many)
- [ ] Languages with complex plural rules tested (Polish, Russian, Arabic)
- [ ] Gender-specific translations verified

### RTL Support
- [ ] RTL languages display correctly (Arabic, Hebrew)
- [ ] Navigation and layout mirror properly
- [ ] Bidirectional text renders correctly
- [ ] Form inputs align correctly in RTL
- [ ] Directional icons mirror, non-directional don't

### Text Expansion
- [ ] No text overflow/truncation in any language
- [ ] Buttons handle long translations (German, Finnish)
- [ ] Table headers handle long translations
- [ ] Navigation items don't overflow

### Translation Files
- [ ] All translation files have matching keys
- [ ] No unused translation keys
- [ ] Translation files load correctly for lazy routes
- [ ] Images with text are localized (if applicable)
- [ ] Keyboard shortcuts work across keyboard layouts

## Related Resources

- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
- [Selector Strategies](../selector-strategies/SKILL.md)
- [Playwright Localization Docs](https://playwright.dev/docs/emulation#locale--timezone)
