---
name: api-testing
description: >
  REST API testing patterns using Playwright built-in request context. Use when testing backend APIs, setting up test data via API calls, validating request/response schemas, handling authentication, or mocking API responses for isolated UI testing.
---

# API Testing Skill

Best practices for API testing with Playwright's built-in request context.

## Why API Testing Matters

- **Faster feedback** - API tests run much faster than UI tests
- **More reliable** - No UI flakiness, direct server communication
- **Better coverage** - Test edge cases that are hard to reach via UI
- **Contract validation** - Ensure API responses match expected schemas

## Table of Contents

- [Playwright Request Context](#playwright-request-context)
- [Test Patterns](#test-patterns)
- [Authentication](#authentication)
- [Request/Response Validation](#requestresponse-validation)
- [Error Handling](#error-handling)
- [Data-Driven Testing](#data-driven-testing)
- [Mocking API Responses](#mocking-api-responses)

---

## Playwright Request Context

### Basic Setup

```typescript
import { test, expect } from '@playwright/test';

test.describe('Products API', () => {
  test('should return list of products', async ({ request }) => {
    const response = await request.get('/api/products');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(products).toHaveLength.greaterThan(0);
  });
});
```

### Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: process.env.API_URL || 'https://api.example.com',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
});
```

---

## Test Patterns

### CRUD Operations

```typescript
test.describe('Products API - CRUD', () => {
  let productId: string;

  test('POST - should create a new product', async ({ request }) => {
    const response = await request.post('/api/products', {
      data: {
        name: 'Wireless Mouse',
        price: 29.99,
        category: 'Electronics',
      },
    });

    expect(response.status()).toBe(201);
    const product = await response.json();
    expect(product.name).toBe('Wireless Mouse');
    expect(product.id).toBeDefined();

    productId = product.id; // Save for later tests
  });

  test('GET - should retrieve the created product', async ({ request }) => {
    const response = await request.get(`/api/products/${productId}`);

    expect(response.status()).toBe(200);
    const product = await response.json();
    expect(product.name).toBe('Wireless Mouse');
  });

  test('PUT - should update the product', async ({ request }) => {
    const response = await request.put(`/api/products/${productId}`, {
      data: {
        name: 'Wireless Mouse Pro',
        price: 39.99,
      },
    });

    expect(response.status()).toBe(200);
    const product = await response.json();
    expect(product.name).toBe('Wireless Mouse Pro');
    expect(product.price).toBe(39.99);
  });

  test('PATCH - should partially update the product', async ({ request }) => {
    const response = await request.patch(`/api/products/${productId}`, {
      data: {
        price: 34.99,
      },
    });

    expect(response.status()).toBe(200);
    const product = await response.json();
    expect(product.price).toBe(34.99);
  });

  test('DELETE - should remove the product', async ({ request }) => {
    const response = await request.delete(`/api/products/${productId}`);
    expect(response.status()).toBe(204);

    // Verify deletion
    const getResponse = await request.get(`/api/products/${productId}`);
    expect(getResponse.status()).toBe(404);
  });
});
```

### Query Parameters

```typescript
test('should filter products by category', async ({ request }) => {
  const response = await request.get('/api/products', {
    params: {
      category: 'Electronics',
      minPrice: 50,
      maxPrice: 200,
      sort: 'price',
      order: 'asc',
    },
  });

  expect(response.ok()).toBeTruthy();
  const products = await response.json();

  // Verify all products match filter criteria
  for (const product of products) {
    expect(product.category).toBe('Electronics');
    expect(product.price).toBeGreaterThanOrEqual(50);
    expect(product.price).toBeLessThanOrEqual(200);
  }
});
```

### Pagination

```typescript
test('should handle pagination correctly', async ({ request }) => {
  const pageSize = 10;

  // Get first page
  const page1Response = await request.get('/api/products', {
    params: { page: 1, limit: pageSize },
  });
  const page1 = await page1Response.json();

  expect(page1.data).toHaveLength(pageSize);
  expect(page1.pagination.currentPage).toBe(1);
  expect(page1.pagination.totalPages).toBeGreaterThan(0);

  // Get second page
  const page2Response = await request.get('/api/products', {
    params: { page: 2, limit: pageSize },
  });
  const page2 = await page2Response.json();

  // Ensure different results
  expect(page1.data[0].id).not.toBe(page2.data[0].id);
});
```

---

## Authentication

### Bearer Token Authentication

```typescript
// fixtures/api.fixture.ts
import { test as base, request } from '@playwright/test';

type ApiFixtures = {
  authenticatedRequest: ReturnType<typeof request.newContext>;
};

export const test = base.extend<ApiFixtures>({
  authenticatedRequest: async ({ playwright }, use) => {
    // Get auth token
    const context = await playwright.request.newContext({
      baseURL: process.env.API_URL,
    });

    const authResponse = await context.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    const { token } = await authResponse.json();

    // Create authenticated context
    const authenticatedContext = await playwright.request.newContext({
      baseURL: process.env.API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    await use(authenticatedContext);
    await authenticatedContext.dispose();
    await context.dispose();
  },
});
```

### Using the Authenticated Fixture

```typescript
import { test } from '../fixtures/api.fixture';
import { expect } from '@playwright/test';

test('should access protected endpoint', async ({ authenticatedRequest }) => {
  const response = await authenticatedRequest.get('/api/user/profile');

  expect(response.status()).toBe(200);
  const profile = await response.json();
  expect(profile.email).toBe('test@example.com');
});
```

### API Key Authentication

```typescript
test.describe('API Key Auth', () => {
  test.use({
    extraHTTPHeaders: {
      'X-API-Key': process.env.API_KEY!,
    },
  });

  test('should authenticate with API key', async ({ request }) => {
    const response = await request.get('/api/protected-resource');
    expect(response.ok()).toBeTruthy();
  });
});
```

---

## Request/Response Validation

### Response Schema Validation

```typescript
import Ajv from 'ajv';

const productSchema = {
  type: 'object',
  required: ['id', 'name', 'price', 'category'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    price: { type: 'number', minimum: 0 },
    category: { type: 'string' },
    description: { type: 'string' },
    inStock: { type: 'boolean' },
  },
};

test('should return valid product schema', async ({ request }) => {
  const ajv = new Ajv();
  const validate = ajv.compile(productSchema);

  const response = await request.get('/api/products/123');
  const product = await response.json();

  const isValid = validate(product);
  expect(isValid).toBeTruthy();
  if (!isValid) {
    console.log('Schema errors:', validate.errors);
  }
});
```

### Response Headers Validation

```typescript
test('should return correct headers', async ({ request }) => {
  const response = await request.get('/api/products');

  expect(response.headers()['content-type']).toContain('application/json');
  expect(response.headers()['cache-control']).toBeDefined();
  expect(response.headers()['x-request-id']).toBeDefined();
});
```

### Response Time Validation

```typescript
test('should respond within acceptable time', async ({ request }) => {
  const startTime = Date.now();
  const response = await request.get('/api/products');
  const responseTime = Date.now() - startTime;

  expect(response.ok()).toBeTruthy();
  expect(responseTime).toBeLessThan(2000); // 2 seconds max
});
```

---

## Error Handling

### Testing Error Responses

```typescript
test.describe('Error Handling', () => {
  test('should return 400 for invalid request body', async ({ request }) => {
    const response = await request.post('/api/products', {
      data: {
        // Missing required fields
        name: '',
      },
    });

    expect(response.status()).toBe(400);
    const error = await response.json();
    expect(error.message).toContain('validation');
    expect(error.errors).toBeDefined();
  });

  test('should return 404 for non-existent resource', async ({ request }) => {
    const response = await request.get('/api/products/non-existent-id');

    expect(response.status()).toBe(404);
    const error = await response.json();
    expect(error.message).toContain('not found');
  });

  test('should return 401 for unauthorized access', async ({ request }) => {
    const response = await request.get('/api/admin/users');

    expect(response.status()).toBe(401);
    const error = await response.json();
    expect(error.message).toContain('unauthorized');
  });

  test('should return 403 for forbidden access', async ({ authenticatedRequest }) => {
    // Regular user trying to access admin endpoint
    const response = await authenticatedRequest.get('/api/admin/settings');

    expect(response.status()).toBe(403);
    const error = await response.json();
    expect(error.message).toContain('forbidden');
  });

  test('should return 409 for conflict', async ({ request }) => {
    // Try to create duplicate resource
    const response = await request.post('/api/products', {
      data: {
        sku: 'EXISTING-SKU-001',
        name: 'Duplicate Product',
      },
    });

    expect(response.status()).toBe(409);
    const error = await response.json();
    expect(error.message).toContain('already exists');
  });
});
```

---

## Data-Driven Testing

### Parameterized Tests

```typescript
const testCases = [
  { category: 'Electronics', expectedMinCount: 10 },
  { category: 'Clothing', expectedMinCount: 5 },
  { category: 'Books', expectedMinCount: 20 },
];

for (const { category, expectedMinCount } of testCases) {
  test(`should return at least ${expectedMinCount} products in ${category}`, async ({ request }) => {
    const response = await request.get('/api/products', {
      params: { category },
    });

    const products = await response.json();
    expect(products.length).toBeGreaterThanOrEqual(expectedMinCount);
  });
}
```

### Test Data from JSON

```typescript
import testData from '../test-data/api-test-cases.json';

for (const testCase of testData.productSearchTests) {
  test(`search: ${testCase.description}`, async ({ request }) => {
    const response = await request.get('/api/products/search', {
      params: testCase.params,
    });

    expect(response.status()).toBe(testCase.expectedStatus);

    if (testCase.expectedStatus === 200) {
      const results = await response.json();
      expect(results.length).toBe(testCase.expectedCount);
    }
  });
}
```

---

## Mocking API Responses

### Route Interception in E2E Tests

```typescript
test('should handle API errors gracefully in UI', async ({ page }) => {
  // Mock the API to return an error
  await page.route('**/api/products', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Internal server error' }),
    });
  });

  await page.goto('/products');

  // Verify UI handles error correctly
  await expect(page.getByRole('alert')).toHaveText('Unable to load products');
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});
```

### Mock Specific Scenarios

```typescript
test('should show empty state when no products', async ({ page }) => {
  await page.route('**/api/products', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.goto('/products');

  await expect(page.getByText('No products found')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Browse all categories' })).toBeVisible();
});
```

### Delay API Responses

```typescript
test('should show loading state', async ({ page }) => {
  await page.route('**/api/products', async route => {
    // Delay the response
    await new Promise(resolve => setTimeout(resolve, 2000));
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ id: '1', name: 'Product' }]),
    });
  });

  await page.goto('/products');

  // Verify loading state appears
  await expect(page.getByRole('progressbar')).toBeVisible();

  // Wait for loading to complete
  await expect(page.getByRole('progressbar')).toBeHidden();
  await expect(page.getByText('Product')).toBeVisible();
});
```

---

## Best Practices

### 1. Test Independence

```typescript
// Good - Each test creates its own data
test('should update product', async ({ request }) => {
  // Create test data
  const createResponse = await request.post('/api/products', {
    data: { name: 'Test Product', price: 10 },
  });
  const { id } = await createResponse.json();

  // Test update
  const updateResponse = await request.put(`/api/products/${id}`, {
    data: { name: 'Updated Product' },
  });
  expect(updateResponse.ok()).toBeTruthy();

  // Cleanup
  await request.delete(`/api/products/${id}`);
});
```

### 2. Use Fixtures for Common Setup

```typescript
// fixtures/product.fixture.ts
export const test = base.extend<{ testProduct: Product }>({
  testProduct: async ({ request }, use) => {
    // Setup - Create product
    const response = await request.post('/api/products', {
      data: { name: 'Fixture Product', price: 99.99 },
    });
    const product = await response.json();

    // Use in test
    await use(product);

    // Teardown - Delete product
    await request.delete(`/api/products/${product.id}`);
  },
});
```

### 3. Validate Both Success and Error Paths

```typescript
test.describe('Product Creation', () => {
  test('should succeed with valid data', async ({ request }) => {
    // Test success path
  });

  test('should fail with missing name', async ({ request }) => {
    // Test validation error
  });

  test('should fail with negative price', async ({ request }) => {
    // Test business rule violation
  });
});
```

---

## Quick Reference

### HTTP Methods

```typescript
// GET
await request.get('/api/resource');
await request.get('/api/resource', { params: { key: 'value' } });

// POST
await request.post('/api/resource', { data: { key: 'value' } });

// PUT
await request.put('/api/resource/id', { data: { key: 'value' } });

// PATCH
await request.patch('/api/resource/id', { data: { key: 'value' } });

// DELETE
await request.delete('/api/resource/id');
```

### Common Assertions

```typescript
// Status codes
expect(response.status()).toBe(200);
expect(response.ok()).toBeTruthy();

// Response body
const data = await response.json();
expect(data).toHaveProperty('id');
expect(data.name).toBe('Expected Name');

// Headers
expect(response.headers()['content-type']).toContain('application/json');

// Response time
expect(responseTime).toBeLessThan(1000);
```

---

## Related Resources

- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
- [Playwright API Testing Docs](https://playwright.dev/docs/api-testing)
