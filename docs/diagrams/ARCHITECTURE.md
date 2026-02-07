# Architecture Diagrams

Visual guides to help understand the test automation architecture patterns used in this repository.

---

## 1. Overall Repository Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                    test-automation-skills                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  skills/  │  │  templates/  │  │ examples/ │  │   configs/   │   │
│  │          │  │              │  │           │  │              │   │
│  │ 14 best  │  │ Test code    │  │ Good vs   │  │ ESLint,      │   │
│  │ practice │  │ templates    │  │ Bad code  │  │ Prettier,    │   │
│  │ guides   │  │ + AI prompts │  │ patterns  │  │ Playwright   │   │
│  └──────────┘  └──────────────┘  └──────────┘  └──────────────┘   │
│                                                                     │
│  ┌──────────┐  ┌──────────────┐                                    │
│  │  docs/   │  │ checklists/  │                                    │
│  │          │  │              │                                    │
│  │ Trouble- │  │ Code review  │                                    │
│  │ shooting │  │ checklist    │                                    │
│  └──────────┘  └──────────────┘                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Skills Dependency Map

Shows how skills relate to each other. Start from the top (foundations) and work down (specialized).

```
                    ┌───────────────────────────┐
                    │  Playwright Best Practices │  ◄── START HERE
                    │      (Foundation)          │
                    └─────────┬─────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Selector    │  │  Page Object │  │    Code      │
    │  Strategies  │  │    Model     │  │ Organization │
    └──────┬──────┘  └──────┬───────┘  └──────────────┘
           │                │
           │         ┌──────┴───────┐
           │         │              │
           ▼         ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────────┐
    │ Action   │  │Assertion │  │  Migration   │
    │ Utilities│  │Utilities │  │  Patterns    │
    └──────────┘  └──────────┘  └──────────────┘

    ┌─────────────── Specialty Skills ──────────────┐
    │                                                │
    │  ┌──────────┐  ┌─────────┐  ┌──────────────┐  │
    │  │ A11y     │  │  API    │  │  Visual       │  │
    │  │ Testing  │  │ Testing │  │  Regression   │  │
    │  └──────────┘  └─────────┘  └──────────────┘  │
    │                                                │
    │  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
    │  │ Perf     │  │  L10n   │  │   Error      │  │
    │  │ Testing  │  │ Testing │  │  Handling     │  │
    │  └──────────┘  └──────────┘  └──────────────┘  │
    │                                                │
    │  ┌─────────────────────┐                       │
    │  │ Debugging &         │                       │
    │  │ Troubleshooting     │                       │
    │  └─────────────────────┘                       │
    └────────────────────────────────────────────────┘
```

---

## 3. Page Object Model Architecture

```
    ┌─────────────────────────────────────────────┐
    │              Test Files (.spec.ts)           │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
    │  │ Login    │  │ Checkout │  │ Product  │  │
    │  │ Test     │  │ Test     │  │ Test     │  │
    │  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
    └───────┼──────────────┼──────────────┼────────┘
            │              │              │
            ▼              ▼              ▼
    ┌─────────────────────────────────────────────┐
    │            Page Objects (POM Layer)          │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
    │  │ Login    │  │ Checkout │  │ Product  │  │
    │  │ Page     │  │ Page     │  │ Page     │  │
    │  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
    │       └──────────┬───┘              │       │
    │                  │                  │       │
    │                  ▼                  │       │
    │           ┌──────────┐             │       │
    │           │ BasePage │◄────────────┘       │
    │           └──────────┘                      │
    └─────────────────────────────────────────────┘
            │              │              │
            ▼              ▼              ▼
    ┌─────────────────────────────────────────────┐
    │           Utility Layer                      │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
    │  │UIActions │  │ Assert   │  │  Test    │  │
    │  │          │  │ Utils    │  │  Data    │  │
    │  └──────────┘  └──────────┘  └──────────┘  │
    └─────────────────────────────────────────────┘
            │              │              │
            ▼              ▼              ▼
    ┌─────────────────────────────────────────────┐
    │           Playwright API                     │
    │  page.goto()  page.click()  expect()        │
    └─────────────────────────────────────────────┘
```

---

## 4. Test Folder Organization (Domain-Based)

```
tests/
├── auth/                          ◄── Domain: Authentication
│   ├── page-objects/
│   │   ├── LoginPage.ts
│   │   └── RegisterPage.ts
│   ├── login.spec.ts
│   └── registration.spec.ts
│
├── products/                      ◄── Domain: Product Catalog
│   ├── page-objects/
│   │   ├── ProductPage.ts
│   │   ├── ProductListPage.ts
│   │   └── components/
│   │       ├── ProductCard.ts
│   │       └── FilterPanel.ts
│   ├── product-search.spec.ts
│   └── product-details.spec.ts
│
├── checkout/                      ◄── Domain: Checkout Flow
│   ├── page-objects/
│   │   ├── CartPage.ts
│   │   └── CheckoutPage.ts
│   ├── cart.spec.ts
│   └── checkout-flow.spec.ts
│
├── shared/                        ◄── Shared Across Domains
│   ├── page-objects/
│   │   ├── BasePage.ts
│   │   └── components/
│   │       ├── HeaderComponent.ts
│   │       └── FooterComponent.ts
│   ├── utils/
│   │   ├── ui-actions.ts
│   │   ├── assert-utils.ts
│   │   └── test-data-helpers.ts
│   └── fixtures/
│       └── auth.fixture.ts
│
└── api/                           ◄── API Tests
    ├── products-api.spec.ts
    └── orders-api.spec.ts
```

---

## 5. Migration Workflow

```
    ┌──────────────────────────────────────────────────────────┐
    │                  MIGRATION WORKFLOW                       │
    └──────────────────────────────────────────────────────────┘

    Day 1-2: Setup                Day 3-5: Core Migration
    ┌──────────────┐              ┌──────────────────────┐
    │ Install      │              │ Migrate high-value   │
    │ Playwright   │─────────────▶│ tests first          │
    │ + config     │              │ (login, checkout)    │
    └──────────────┘              └──────────┬───────────┘
                                             │
    Day 6-8: Expand                          │
    ┌──────────────────────┐                 │
    │ Migrate remaining    │◄────────────────┘
    │ tests by domain      │
    │ + add POM layer      │
    └──────────┬───────────┘
               │
    Day 9-10: Cleanup              Day 11+: Verify
    ┌──────────────────────┐       ┌──────────────────────┐
    │ Remove old framework │       │ Run in CI/CD         │
    │ + update CI pipeline │──────▶│ Monitor for flakes   │
    │ + code review        │       │ Remove old tests     │
    └──────────────────────┘       └──────────────────────┘

    Key Principle: INCREMENTAL migration
    ├── Both frameworks run side-by-side
    ├── Migrate one domain at a time
    ├── Never rewrite all tests at once
    └── Track progress in MIGRATION-LOG.md
```

---

## 6. Selector Priority Hierarchy

```
    MOST RELIABLE (prefer these)
    ▲
    │   ┌─────────────────────────────────────────────┐
    │   │  1. getByRole('button', { name: 'Submit' }) │  ◄── Accessibility-based
    │   └─────────────────────────────────────────────┘
    │   ┌─────────────────────────────────────────────┐
    │   │  2. getByLabel('Email address')             │  ◄── Form labels
    │   └─────────────────────────────────────────────┘
    │   ┌─────────────────────────────────────────────┐
    │   │  3. getByPlaceholder('Search...')            │  ◄── Placeholder text
    │   └─────────────────────────────────────────────┘
    │   ┌─────────────────────────────────────────────┐
    │   │  4. getByText('Welcome back')               │  ◄── Visible text
    │   └─────────────────────────────────────────────┘
    │   ┌─────────────────────────────────────────────┐
    │   │  5. getByTestId('submit-button')            │  ◄── Test IDs (stable)
    │   └─────────────────────────────────────────────┘
    │   ┌─────────────────────────────────────────────┐
    │   │  6. page.locator('#email')                  │  ◄── CSS selectors
    │   └─────────────────────────────────────────────┘
    │   ┌─────────────────────────────────────────────┐
    │   │  7. page.locator('//div[@class="form"]')    │  ◄── XPath (avoid!)
    │   └─────────────────────────────────────────────┘
    ▼
    LEAST RELIABLE (avoid these)
```

---

## 7. Error Handling Flow

```
    ┌──────────────────────┐
    │    Test Execution     │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐     ┌──────────────────────┐
    │   Setup (beforeEach) │────▶│ try-catch with clear  │
    │                      │     │ error message         │
    └──────────┬───────────┘     └──────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │   Test Actions        │
    │   (navigate, click,   │
    │    fill, etc.)        │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐     ┌──────────────────────┐
    │   Assertions          │────▶│ Custom error messages │
    │   (expect, toHave)    │     │ for context           │
    └──────────┬───────────┘     └──────────────────────┘
               │
               ▼
    ┌──────────────────────┐     ┌──────────────────────┐
    │ Cleanup (afterEach)  │────▶│ try-catch (non-fatal) │
    │                      │     │ Don't fail the test   │
    └──────────┬───────────┘     └──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    ┌────────┐   ┌─────────┐
    │  PASS  │   │  FAIL   │
    └────────┘   └────┬────┘
                      │
                      ▼
               ┌──────────────┐
               │ Auto-capture │
               │ • Screenshot │
               │ • Trace      │
               │ • Video      │
               └──────────────┘
```

---

## How to Use These Diagrams

1. **New team members**: Start with diagrams 1 and 2 to understand the repository structure
2. **Building test architecture**: Reference diagram 3 (POM) and 4 (folder structure)
3. **Migrating frameworks**: Follow diagram 5 step by step
4. **Writing selectors**: Use diagram 6 as a quick reference
5. **Debugging failures**: Follow diagram 7 for error handling flow

## Related Resources

- [Skills Overview](../../README.md)
- [Quick Start Guide](../../QUICK-START.md)
- [Code Organization Skill](../../skills/code-organization/SKILL.md)
- [Page Object Model Skill](../../skills/page-object-model/SKILL.md)
