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
  await page.goto('/es/prescriptions');
  
  await expect(page.getByRole('heading', { name: 'Recetas' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
});

test('app displays in French', async ({ page }) => {
  await page.goto('/fr/prescriptions');
  
  await expect(page.getByRole('heading', { name: 'Ordonnances' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rechercher' })).toBeVisible();
});
```

## Testing Strategies

### 1. Parameterized Locale Tests

```typescript
const locales = [
  { code: 'en', name: 'English', heading: 'Prescriptions', button: 'Search' },
  { code: 'es', name: 'Spanish', heading: 'Recetas', button: 'Buscar' },
  { code: 'fr', name: 'French', heading: 'Ordonnances', button: 'Rechercher' },
  { code: 'de', name: 'German', heading: 'Rezepte', button: 'Suchen' },
];

for (const locale of locales) {
  test(`prescription page displays correctly in ${locale.name}`, async ({ page }) => {
    await page.goto(`/${locale.code}/prescriptions`);
    
    await expect(page.getByRole('heading', { name: locale.heading })).toBeVisible();
    await expect(page.getByRole('button', { name: locale.button })).toBeVisible();
  });
}
```

### 2. Testing Date/Time Formats

```typescript
test('dates display in US format', async ({ page }) => {
  await page.goto('/en-US/prescriptions/123');
  
  // US: MM/DD/YYYY
  await expect(page.getByText('01/31/2026')).toBeVisible();
});

test('dates display in EU format', async ({ page }) => {
  await page.goto('/en-GB/prescriptions/123');
  
  // GB: DD/MM/YYYY
  await expect(page.getByText('31/01/2026')).toBeVisible();
});

test('dates display in ISO format', async ({ page }) => {
  await page.goto('/de-DE/prescriptions/123');
  
  // ISO: YYYY-MM-DD
  await expect(page.getByText('2026-01-31')).toBeVisible();
});
```

### 3. Testing Currency Formats

```typescript
test('prices display in USD', async ({ page }) => {
  await page.goto('/en-US/billing');
  
  await expect(page.getByText('$29.99')).toBeVisible();
});

test('prices display in EUR', async ({ page }) => {
  await page.goto('/de-DE/billing');
  
  await expect(page.getByText('29,99 €')).toBeVisible();
});

test('prices display in GBP', async ({ page }) => {
  await page.goto('/en-GB/billing');
  
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
  await page.goto('/ar/prescriptions');
  
  const main = page.getByRole('main');
  await expect(main).toHaveCSS('direction', 'rtl');
  
  // Verify text alignment
  const heading = page.getByRole('heading').first();
  await expect(heading).toHaveCSS('text-align', 'right');
});

test('Hebrew layout is RTL', async ({ page }) => {
  await page.goto('/he/prescriptions');
  
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

test('Spanish prescription page', async ({ localePage }) => {
  await localePage.goto('/prescriptions');
  
  await expect(localePage.getByRole('heading', { name: 'Recetas' })).toBeVisible();
});
```

## Testing Translation Coverage

### Verify All Text is Translated

```typescript
test('no English text on Spanish page', async ({ page }) => {
  await page.goto('/es/prescriptions');
  
  const content = await page.textContent('body');
  
  // Check for common English words that shouldn't appear
  const englishWords = ['prescription', 'search', 'refill', 'cancel'];
  
  for (const word of englishWords) {
    expect(content?.toLowerCase()).not.toContain(word);
  }
});

test('all labels are translated', async ({ page }) => {
  await page.goto('/fr/prescriptions/refill');
  
  // Verify form labels are in French
  await expect(page.getByLabel('Nom du médicament')).toBeVisible();
  await expect(page.getByLabel('Dosage')).toBeVisible();
  await expect(page.getByLabel('Quantité')).toBeVisible();
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
  await page.goto('/prescriptions');
  
  // Browser will send Accept-Language: fr-FR
  await expect(page.getByRole('heading', { name: 'Ordonnances' })).toBeVisible();
  
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
    prescriptions: 'Prescriptions',
    search: 'Search',
    refill: 'Refill',
    cancel: 'Cancel',
  },
  'es-ES': {
    prescriptions: 'Recetas',
    search: 'Buscar',
    refill: 'Reabastecer',
    cancel: 'Cancelar',
  },
  'fr-FR': {
    prescriptions: 'Ordonnances',
    search: 'Rechercher',
    refill: 'Renouveler',
    cancel: 'Annuler',
  },
};

// Use in tests
import { translations } from '../test-data/translations';

test('search in multiple languages', async ({ page }) => {
  for (const [locale, trans] of Object.entries(translations)) {
    await page.goto(`/${locale}/prescriptions`);
    
    await expect(page.getByRole('heading', { name: trans.prescriptions })).toBeVisible();
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
const message = `Hello ${userName}, you have ${count} prescriptions`;

// ✅ Good - Use translation placeholders
const message = t('prescriptions.greeting', { userName, count });
// "Hello {userName}, you have {count} prescriptions" (English)
// "{userName}, tienes {count} recetas" (Spanish)
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

## Localization Test Checklist

- [ ] All text is translated (no hardcoded English)
- [ ] Dates formatted correctly for locale
- [ ] Numbers formatted correctly for locale
- [ ] Currency symbols and formatting correct
- [ ] RTL languages display correctly (if applicable)
- [ ] Form validation messages are translated
- [ ] Error messages are translated
- [ ] Success messages are translated
- [ ] No text overflow/truncation in any language
- [ ] Images with text are localized (if applicable)
- [ ] Keyboard shortcuts work across keyboard layouts

## Related Resources

- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
- [Selector Strategies](../selector-strategies/SKILL.md)
- [Playwright Localization Docs](https://playwright.dev/docs/emulation#locale--timezone)
