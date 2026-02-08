---
name: page-object-model
description: >
  Complete POM design patterns for Playwright test automation. Use when building maintainable test architecture, creating page objects, base pages, component objects, page factories, or flow objects for multi-page journeys.
---

# Page Object Model (POM) Skill

A comprehensive guide to implementing the Page Object Model pattern in Playwright for maintainable, scalable test automation.

## What is Page Object Model?

Page Object Model (POM) is a design pattern that creates an object repository for web UI elements. It reduces code duplication and improves test maintenance by separating test logic from page interactions.

### Benefits of POM

| Benefit | Description |
|---------|-------------|
| **Maintainability** | Change locators in one place when UI changes |
| **Reusability** | Share page objects across multiple tests |
| **Readability** | Tests read like user stories |
| **Abstraction** | Hide complex interactions behind simple methods |
| **Scalability** | Easy to add new tests and pages |

## Core Patterns

### 1. Basic Page Object

The foundation of POM - encapsulates page elements and actions.

```typescript
// page-objects/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use accessible selectors
    this.emailInput = page.getByLabel('Email address');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
  }

  async navigate(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
  }
}
```

### 2. Base Page Object (Inheritance Pattern)

Create a base class for shared functionality across all pages.

```typescript
// page-objects/BasePage.ts
import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly footer: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole('banner');
    this.footer = page.getByRole('contentinfo');
    this.loadingSpinner = page.getByTestId('loading-spinner');
  }

  // Abstract method - each page must implement
  abstract navigate(): Promise<void>;

  // Shared methods available to all pages
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForSpinnerToDisappear(): Promise<void> {
    await this.loadingSpinner.waitFor({ state: 'hidden' });
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  // Common navigation elements
  async clickLogo(): Promise<void> {
    await this.header.getByRole('link', { name: 'Home' }).click();
  }

  async isLoggedIn(): Promise<boolean> {
    return this.header.getByRole('button', { name: 'Account' }).isVisible();
  }
}
```

```typescript
// page-objects/ProductPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly addToCartButton: Locator;
  readonly quantityInput: Locator;
  readonly reviewsSection: Locator;

  constructor(page: Page) {
    super(page);
    this.productTitle = page.getByRole('heading', { level: 1 });
    this.productPrice = page.getByTestId('product-price');
    this.productDescription = page.getByTestId('product-description');
    this.addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    this.quantityInput = page.getByLabel('Quantity');
    this.reviewsSection = page.getByRole('region', { name: 'Customer Reviews' });
  }

  async navigate(productId?: string): Promise<void> {
    const path = productId ? `/products/${productId}` : '/products';
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  async addToCart(quantity: number = 1): Promise<void> {
    if (quantity > 1) {
      await this.quantityInput.fill(quantity.toString());
    }
    await this.addToCartButton.click();
    await this.waitForSpinnerToDisappear();
  }

  async getPrice(): Promise<number> {
    const priceText = await this.productPrice.textContent();
    return parseFloat(priceText?.replace('$', '') ?? '0');
  }

  async expectProductName(name: string): Promise<void> {
    await expect(this.productTitle).toHaveText(name);
  }
}
```

### 3. Component Objects Pattern

Break down complex pages into reusable component objects.

```typescript
// page-objects/components/HeaderComponent.ts
import { Page, Locator } from '@playwright/test';

export class HeaderComponent {
  readonly page: Page;
  readonly root: Locator;
  readonly logo: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly cartIcon: Locator;
  readonly cartCount: Locator;
  readonly accountMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByRole('banner');
    this.logo = this.root.getByRole('link', { name: 'Home' });
    this.searchInput = this.root.getByPlaceholder('Search products...');
    this.searchButton = this.root.getByRole('button', { name: 'Search' });
    this.cartIcon = this.root.getByRole('link', { name: /Cart/ });
    this.cartCount = this.root.getByTestId('cart-count');
    this.accountMenu = this.root.getByRole('button', { name: 'Account' });
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async getCartItemCount(): Promise<number> {
    const count = await this.cartCount.textContent();
    return parseInt(count ?? '0', 10);
  }

  async goToCart(): Promise<void> {
    await this.cartIcon.click();
  }

  async openAccountMenu(): Promise<void> {
    await this.accountMenu.click();
  }
}
```

```typescript
// page-objects/components/ProductCardComponent.ts
import { Locator } from '@playwright/test';

export class ProductCardComponent {
  readonly root: Locator;
  readonly image: Locator;
  readonly title: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly wishlistButton: Locator;
  readonly rating: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.image = root.getByRole('img');
    this.title = root.getByRole('heading');
    this.price = root.getByTestId('price');
    this.addToCartButton = root.getByRole('button', { name: 'Add to Cart' });
    this.wishlistButton = root.getByRole('button', { name: 'Add to Wishlist' });
    this.rating = root.getByRole('img', { name: /stars/ });
  }

  async click(): Promise<void> {
    await this.root.click();
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async addToWishlist(): Promise<void> {
    await this.wishlistButton.click();
  }

  async getName(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }

  async getPrice(): Promise<number> {
    const priceText = await this.price.textContent();
    return parseFloat(priceText?.replace('$', '') ?? '0');
  }
}
```

```typescript
// page-objects/components/NavigationComponent.ts
import { Page, Locator } from '@playwright/test';

export class NavigationComponent {
  readonly page: Page;
  readonly root: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByRole('navigation', { name: 'Main' });
  }

  getCategory(name: string): Locator {
    return this.root.getByRole('link', { name });
  }

  async navigateToCategory(category: string): Promise<void> {
    await this.getCategory(category).click();
  }

  async expandSubmenu(menuName: string): Promise<void> {
    await this.root.getByRole('button', { name: menuName }).hover();
  }

  async getVisibleCategories(): Promise<string[]> {
    const links = await this.root.getByRole('link').all();
    const categories: string[] = [];
    for (const link of links) {
      const text = await link.textContent();
      if (text) categories.push(text.trim());
    }
    return categories;
  }
}
```

```typescript
// page-objects/ProductListPage.ts - Using Component Objects
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';
import { NavigationComponent } from './components/NavigationComponent';
import { ProductCardComponent } from './components/ProductCardComponent';

export class ProductListPage extends BasePage {
  readonly header: HeaderComponent;
  readonly navigation: NavigationComponent;
  readonly productGrid: Locator;
  readonly sortDropdown: Locator;
  readonly filterPanel: Locator;
  readonly resultsCount: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.navigation = new NavigationComponent(page);
    this.productGrid = page.getByRole('region', { name: 'Products' });
    this.sortDropdown = page.getByLabel('Sort by');
    this.filterPanel = page.getByRole('complementary', { name: 'Filters' });
    this.resultsCount = page.getByTestId('results-count');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/products');
  }

  // Get all product cards
  async getProductCards(): Promise<ProductCardComponent[]> {
    const cards = await this.productGrid.getByTestId('product-card').all();
    return cards.map(card => new ProductCardComponent(card));
  }

  // Get specific product card
  getProductCard(productName: string): ProductCardComponent {
    const card = this.productGrid
      .getByTestId('product-card')
      .filter({ hasText: productName });
    return new ProductCardComponent(card);
  }

  async sortBy(option: string): Promise<void> {
    await this.sortDropdown.selectOption(option);
    await this.waitForSpinnerToDisappear();
  }

  async filterByCategory(category: string): Promise<void> {
    await this.filterPanel.getByLabel(category).check();
    await this.waitForSpinnerToDisappear();
  }

  async filterByPriceRange(min: number, max: number): Promise<void> {
    await this.filterPanel.getByLabel('Min price').fill(min.toString());
    await this.filterPanel.getByLabel('Max price').fill(max.toString());
    await this.filterPanel.getByRole('button', { name: 'Apply' }).click();
    await this.waitForSpinnerToDisappear();
  }

  async getProductCount(): Promise<number> {
    const text = await this.resultsCount.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
```

### 4. Page Factory Pattern

Create pages on demand with proper type safety.

```typescript
// page-objects/PageFactory.ts
import { Page } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { ProductListPage } from './ProductListPage';
import { ProductPage } from './ProductPage';
import { CartPage } from './CartPage';
import { CheckoutPage } from './CheckoutPage';
import { AccountPage } from './AccountPage';

export type PageType =
  | 'login'
  | 'productList'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'account';

export class PageFactory {
  private page: Page;
  private pageInstances: Map<PageType, unknown> = new Map();

  constructor(page: Page) {
    this.page = page;
  }

  getLoginPage(): LoginPage {
    if (!this.pageInstances.has('login')) {
      this.pageInstances.set('login', new LoginPage(this.page));
    }
    return this.pageInstances.get('login') as LoginPage;
  }

  getProductListPage(): ProductListPage {
    if (!this.pageInstances.has('productList')) {
      this.pageInstances.set('productList', new ProductListPage(this.page));
    }
    return this.pageInstances.get('productList') as ProductListPage;
  }

  getProductPage(): ProductPage {
    if (!this.pageInstances.has('product')) {
      this.pageInstances.set('product', new ProductPage(this.page));
    }
    return this.pageInstances.get('product') as ProductPage;
  }

  getCartPage(): CartPage {
    if (!this.pageInstances.has('cart')) {
      this.pageInstances.set('cart', new CartPage(this.page));
    }
    return this.pageInstances.get('cart') as CartPage;
  }

  getCheckoutPage(): CheckoutPage {
    if (!this.pageInstances.has('checkout')) {
      this.pageInstances.set('checkout', new CheckoutPage(this.page));
    }
    return this.pageInstances.get('checkout') as CheckoutPage;
  }

  getAccountPage(): AccountPage {
    if (!this.pageInstances.has('account')) {
      this.pageInstances.set('account', new AccountPage(this.page));
    }
    return this.pageInstances.get('account') as AccountPage;
  }

  // Clear cached instances (useful for test isolation)
  clearCache(): void {
    this.pageInstances.clear();
  }
}
```

```typescript
// Using Page Factory with Fixtures
// fixtures/pages.fixture.ts
import { test as base } from '@playwright/test';
import { PageFactory } from '../page-objects/PageFactory';

type PageFixtures = {
  pages: PageFactory;
};

export const test = base.extend<PageFixtures>({
  pages: async ({ page }, use) => {
    const factory = new PageFactory(page);
    await use(factory);
    factory.clearCache();
  },
});

export { expect } from '@playwright/test';
```

```typescript
// Using in tests
import { test, expect } from '../fixtures/pages.fixture';

test('complete purchase flow', async ({ pages }) => {
  const loginPage = pages.getLoginPage();
  const productList = pages.getProductListPage();
  const cart = pages.getCartPage();
  const checkout = pages.getCheckoutPage();

  await loginPage.navigate();
  await loginPage.login('user@example.com', 'password');

  await productList.navigate();
  const product = productList.getProductCard('Wireless Headphones');
  await product.addToCart();

  await cart.navigate();
  await expect(cart.itemCount).toHaveText('1');

  await cart.proceedToCheckout();
  await checkout.completeOrder();
});
```

### 5. Fluent Interface Pattern

Chain methods for more readable test code.

```typescript
// page-objects/FluentCheckoutPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class FluentCheckoutPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly zipInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cardExpiryInput: Locator;
  readonly cardCvcInput: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByLabel('First name');
    this.lastNameInput = page.getByLabel('Last name');
    this.emailInput = page.getByLabel('Email');
    this.addressInput = page.getByLabel('Address');
    this.cityInput = page.getByLabel('City');
    this.zipInput = page.getByLabel('ZIP code');
    this.cardNumberInput = page.getByLabel('Card number');
    this.cardExpiryInput = page.getByLabel('Expiry');
    this.cardCvcInput = page.getByLabel('CVC');
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
  }

  async navigate(): Promise<this> {
    await this.page.goto('/checkout');
    return this;
  }

  async withFirstName(name: string): Promise<this> {
    await this.firstNameInput.fill(name);
    return this;
  }

  async withLastName(name: string): Promise<this> {
    await this.lastNameInput.fill(name);
    return this;
  }

  async withEmail(email: string): Promise<this> {
    await this.emailInput.fill(email);
    return this;
  }

  async withAddress(address: string): Promise<this> {
    await this.addressInput.fill(address);
    return this;
  }

  async withCity(city: string): Promise<this> {
    await this.cityInput.fill(city);
    return this;
  }

  async withZipCode(zip: string): Promise<this> {
    await this.zipInput.fill(zip);
    return this;
  }

  async withCardNumber(number: string): Promise<this> {
    await this.cardNumberInput.fill(number);
    return this;
  }

  async withCardExpiry(expiry: string): Promise<this> {
    await this.cardExpiryInput.fill(expiry);
    return this;
  }

  async withCardCvc(cvc: string): Promise<this> {
    await this.cardCvcInput.fill(cvc);
    return this;
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
    await expect(this.page.getByRole('heading', { name: 'Order Confirmed' })).toBeVisible();
  }
}
```

```typescript
// Using Fluent Interface
test('checkout with fluent interface', async ({ page }) => {
  const checkout = new FluentCheckoutPage(page);

  await checkout
    .navigate()
    .then(c => c.withFirstName('John'))
    .then(c => c.withLastName('Doe'))
    .then(c => c.withEmail('john@example.com'))
    .then(c => c.withAddress('123 Main St'))
    .then(c => c.withCity('Seattle'))
    .then(c => c.withZipCode('98101'))
    .then(c => c.withCardNumber('4111111111111111'))
    .then(c => c.withCardExpiry('12/25'))
    .then(c => c.withCardCvc('123'))
    .then(c => c.placeOrder());
});

// Or using async/await chain
test('checkout with chaining', async ({ page }) => {
  const checkout = await new FluentCheckoutPage(page).navigate();

  await (await (await (await (await (await checkout
    .withFirstName('John'))
    .withLastName('Doe'))
    .withEmail('john@example.com'))
    .withAddress('123 Main St'))
    .withCity('Seattle'))
    .withZipCode('98101');

  await checkout.placeOrder();
});
```

### 6. Builder Pattern for Test Data

Combine with page objects for clean test data setup.

```typescript
// test-data/builders/UserBuilder.ts
export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export class UserBuilder {
  private user: Partial<User> = {};

  static aUser(): UserBuilder {
    return new UserBuilder();
  }

  static aDefaultUser(): User {
    return UserBuilder.aUser()
      .withFirstName('Test')
      .withLastName('User')
      .withEmail(`test-${Date.now()}@example.com`)
      .withPassword('SecurePass123!')
      .build();
  }

  withFirstName(firstName: string): this {
    this.user.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): this {
    this.user.lastName = lastName;
    return this;
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  withPassword(password: string): this {
    this.user.password = password;
    return this;
  }

  withPhone(phone: string): this {
    this.user.phone = phone;
    return this;
  }

  withAddress(street: string, city: string, state: string, zip: string): this {
    this.user.address = { street, city, state, zip };
    return this;
  }

  build(): User {
    if (!this.user.firstName || !this.user.lastName || !this.user.email || !this.user.password) {
      throw new Error('User must have firstName, lastName, email, and password');
    }
    return this.user as User;
  }
}
```

```typescript
// Using Builder with Page Objects
import { UserBuilder } from '../test-data/builders/UserBuilder';

test('register new user', async ({ page }) => {
  const registrationPage = new RegistrationPage(page);

  const user = UserBuilder.aUser()
    .withFirstName('Jane')
    .withLastName('Smith')
    .withEmail('jane.smith@example.com')
    .withPassword('SecurePassword123!')
    .withPhone('555-123-4567')
    .withAddress('456 Oak Ave', 'Portland', 'OR', '97201')
    .build();

  await registrationPage.navigate();
  await registrationPage.registerUser(user);

  await expect(page.getByText('Registration successful')).toBeVisible();
});
```

## Advanced Patterns

### 7. Page Object with State Management

Track page state for complex interactions.

```typescript
// page-objects/StatefulCartPage.ts
import { Page, Locator, expect } from '@playwright/test';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export class StatefulCartPage {
  readonly page: Page;
  private items: CartItem[] = [];

  readonly cartContainer: Locator;
  readonly emptyCartMessage: Locator;
  readonly checkoutButton: Locator;
  readonly totalPrice: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartContainer = page.getByRole('region', { name: 'Shopping Cart' });
    this.emptyCartMessage = page.getByText('Your cart is empty');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.totalPrice = page.getByTestId('cart-total');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/cart');
    await this.syncState();
  }

  // Sync internal state with actual page state
  async syncState(): Promise<void> {
    this.items = [];
    const itemElements = await this.cartContainer.getByTestId('cart-item').all();

    for (const element of itemElements) {
      const id = await element.getAttribute('data-product-id') ?? '';
      const name = await element.getByTestId('item-name').textContent() ?? '';
      const quantityText = await element.getByTestId('item-quantity').inputValue();
      const priceText = await element.getByTestId('item-price').textContent() ?? '0';

      this.items.push({
        id,
        name,
        quantity: parseInt(quantityText, 10),
        price: parseFloat(priceText.replace('$', '')),
      });
    }
  }

  // Get cached items (fast)
  getCachedItems(): CartItem[] {
    return [...this.items];
  }

  // Get fresh items from page (slower but accurate)
  async getItems(): Promise<CartItem[]> {
    await this.syncState();
    return this.getCachedItems();
  }

  async getItemCount(): Promise<number> {
    await this.syncState();
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  async getTotal(): Promise<number> {
    await this.syncState();
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  async updateQuantity(productId: string, quantity: number): Promise<void> {
    const item = this.cartContainer.locator(`[data-product-id="${productId}"]`);
    await item.getByLabel('Quantity').fill(quantity.toString());
    await item.getByRole('button', { name: 'Update' }).click();
    await this.syncState();
  }

  async removeItem(productId: string): Promise<void> {
    const item = this.cartContainer.locator(`[data-product-id="${productId}"]`);
    await item.getByRole('button', { name: 'Remove' }).click();
    await this.syncState();
  }

  async isEmpty(): Promise<boolean> {
    return this.emptyCartMessage.isVisible();
  }

  async expectTotal(expected: number): Promise<void> {
    await expect(this.totalPrice).toHaveText(`$${expected.toFixed(2)}`);
  }
}
```

### 8. Multi-Page Flow Objects

Handle complex flows spanning multiple pages.

```typescript
// page-objects/flows/CheckoutFlow.ts
import { Page, expect } from '@playwright/test';
import { CartPage } from '../CartPage';
import { ShippingPage } from '../ShippingPage';
import { PaymentPage } from '../PaymentPage';
import { ConfirmationPage } from '../ConfirmationPage';

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface PaymentInfo {
  cardNumber: string;
  expiry: string;
  cvc: string;
  nameOnCard: string;
}

export class CheckoutFlow {
  readonly page: Page;
  readonly cart: CartPage;
  readonly shipping: ShippingPage;
  readonly payment: PaymentPage;
  readonly confirmation: ConfirmationPage;

  constructor(page: Page) {
    this.page = page;
    this.cart = new CartPage(page);
    this.shipping = new ShippingPage(page);
    this.payment = new PaymentPage(page);
    this.confirmation = new ConfirmationPage(page);
  }

  async startFromCart(): Promise<this> {
    await this.cart.navigate();
    return this;
  }

  async proceedToShipping(): Promise<this> {
    await this.cart.proceedToCheckout();
    await expect(this.page).toHaveURL(/.*shipping/);
    return this;
  }

  async fillShipping(info: ShippingInfo): Promise<this> {
    await this.shipping.fillForm(info);
    return this;
  }

  async proceedToPayment(): Promise<this> {
    await this.shipping.continue();
    await expect(this.page).toHaveURL(/.*payment/);
    return this;
  }

  async fillPayment(info: PaymentInfo): Promise<this> {
    await this.payment.fillForm(info);
    return this;
  }

  async placeOrder(): Promise<string> {
    await this.payment.placeOrder();
    await expect(this.page).toHaveURL(/.*confirmation/);
    return this.confirmation.getOrderNumber();
  }

  // Complete flow in one call
  async completeCheckout(shipping: ShippingInfo, payment: PaymentInfo): Promise<string> {
    await this.startFromCart();
    await this.proceedToShipping();
    await this.fillShipping(shipping);
    await this.proceedToPayment();
    await this.fillPayment(payment);
    return this.placeOrder();
  }
}
```

```typescript
// Using Flow Object
test('complete checkout flow', async ({ page }) => {
  const checkoutFlow = new CheckoutFlow(page);

  const orderId = await checkoutFlow.completeCheckout(
    {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Seattle',
      state: 'WA',
      zip: '98101',
    },
    {
      cardNumber: '4111111111111111',
      expiry: '12/25',
      cvc: '123',
      nameOnCard: 'John Doe',
    }
  );

  expect(orderId).toMatch(/^ORD-\d+$/);
});
```

### 9. Modal and Dialog Handling

Handle modals as separate components.

```typescript
// page-objects/components/ConfirmationModal.ts
import { Page, Locator } from '@playwright/test';

export class ConfirmationModal {
  readonly page: Page;
  readonly root: Locator;
  readonly title: Locator;
  readonly message: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByRole('dialog');
    this.title = this.root.getByRole('heading');
    this.message = this.root.getByTestId('modal-message');
    this.confirmButton = this.root.getByRole('button', { name: /confirm|yes|ok/i });
    this.cancelButton = this.root.getByRole('button', { name: /cancel|no/i });
    this.closeButton = this.root.getByRole('button', { name: 'Close' });
  }

  async waitForOpen(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }

  async waitForClose(): Promise<void> {
    await this.root.waitFor({ state: 'hidden' });
  }

  async isOpen(): Promise<boolean> {
    return this.root.isVisible();
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
    await this.waitForClose();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.waitForClose();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.waitForClose();
  }

  async getMessage(): Promise<string> {
    return (await this.message.textContent()) ?? '';
  }
}
```

```typescript
// Using in Page Object
import { ConfirmationModal } from './components/ConfirmationModal';

export class CartPage {
  readonly page: Page;
  readonly confirmationModal: ConfirmationModal;
  // ... other locators

  constructor(page: Page) {
    this.page = page;
    this.confirmationModal = new ConfirmationModal(page);
  }

  async removeItem(productId: string): Promise<void> {
    await this.getRemoveButton(productId).click();
    await this.confirmationModal.waitForOpen();
    await this.confirmationModal.confirm();
  }

  async removeItemWithCancel(productId: string): Promise<void> {
    await this.getRemoveButton(productId).click();
    await this.confirmationModal.waitForOpen();
    await this.confirmationModal.cancel();
  }
}
```

## Folder Structure for POM

```
your-project/
├── page-objects/
│   ├── BasePage.ts                    # Abstract base class
│   ├── PageFactory.ts                 # Page factory
│   ├── index.ts                       # Barrel exports
│   │
│   ├── components/                    # Reusable components
│   │   ├── HeaderComponent.ts
│   │   ├── FooterComponent.ts
│   │   ├── NavigationComponent.ts
│   │   ├── ProductCardComponent.ts
│   │   ├── ConfirmationModal.ts
│   │   └── index.ts
│   │
│   ├── flows/                         # Multi-page flows
│   │   ├── CheckoutFlow.ts
│   │   ├── RegistrationFlow.ts
│   │   └── index.ts
│   │
│   ├── auth/                          # Auth pages
│   │   ├── LoginPage.ts
│   │   ├── RegisterPage.ts
│   │   ├── ForgotPasswordPage.ts
│   │   └── index.ts
│   │
│   ├── products/                      # Product pages
│   │   ├── ProductListPage.ts
│   │   ├── ProductPage.ts
│   │   ├── SearchResultsPage.ts
│   │   └── index.ts
│   │
│   ├── checkout/                      # Checkout pages
│   │   ├── CartPage.ts
│   │   ├── ShippingPage.ts
│   │   ├── PaymentPage.ts
│   │   ├── ConfirmationPage.ts
│   │   └── index.ts
│   │
│   └── account/                       # Account pages
│       ├── ProfilePage.ts
│       ├── OrderHistoryPage.ts
│       ├── AddressBookPage.ts
│       └── index.ts
│
├── test-data/
│   ├── builders/                      # Test data builders
│   │   ├── UserBuilder.ts
│   │   ├── ProductBuilder.ts
│   │   └── OrderBuilder.ts
│   └── fixtures/
│       ├── users.json
│       └── products.json
│
├── fixtures/                          # Playwright fixtures
│   ├── pages.fixture.ts
│   ├── auth.fixture.ts
│   └── index.ts
│
└── tests/
    ├── auth/
    ├── products/
    ├── checkout/
    └── account/
```

## Best Practices Checklist

### Do's

- [ ] Use accessible selectors (`getByRole`, `getByLabel`, `getByText`)
- [ ] Keep page objects focused on a single page/component
- [ ] Use meaningful method names that describe user actions
- [ ] Implement proper waiting strategies (no hard-coded waits)
- [ ] Use TypeScript for type safety
- [ ] Create barrel exports for clean imports
- [ ] Use fixtures for page object initialization
- [ ] Document complex page objects
- [ ] Keep assertions in tests, not in page objects (with exceptions for common checks)

### Don'ts

- [ ] Don't use XPath or CSS selectors when accessible selectors work
- [ ] Don't put test logic in page objects
- [ ] Don't create page objects for simple pages (use inline locators)
- [ ] Don't duplicate locators across page objects
- [ ] Don't use global state in page objects
- [ ] Don't over-engineer simple scenarios

## Anti-Patterns to Avoid

### 1. God Page Object

```typescript
// BAD - Too many responsibilities
class AllInOnePage {
  // Login methods
  async login() {}
  // Product methods
  async searchProduct() {}
  // Cart methods
  async addToCart() {}
  // Checkout methods
  async checkout() {}
  // Account methods
  async updateProfile() {}
}
```

### 2. Assertions in Page Objects

```typescript
// BAD - Assertions belong in tests
class ProductPage {
  async verifyProductVisible() {
    expect(this.productTitle).toBeVisible(); // Don't do this
  }
}

// GOOD - Return locator, assert in test
class ProductPage {
  get productTitle(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }
}

// In test:
await expect(productPage.productTitle).toBeVisible();
```

### 3. Exposing Implementation Details

```typescript
// BAD - Exposes selectors
class LoginPage {
  readonly emailSelector = '#email-input';
  readonly passwordSelector = '[data-testid="password"]';
}

// GOOD - Encapsulate selectors
class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;

  constructor(page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
  }
}
```

## Related Resources

- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
- [Selector Strategies](../selector-strategies/SKILL.md)
- [Code Organization](../code-organization/SKILL.md)
