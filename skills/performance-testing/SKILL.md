---
name: performance-testing
description: >
  Web Vitals and load time testing patterns with Playwright. Use when measuring Core Web Vitals (LCP, FID, CLS), setting performance budgets, analyzing network performance, or profiling resource loading times.
---

# Performance Testing Skill

Best practices for performance testing with Playwright to ensure your application meets performance requirements.

## Why Performance Testing

- **User experience** - Slow pages lead to user frustration and abandonment
- **SEO impact** - Page speed affects search rankings
- **Business metrics** - Performance correlates with conversion rates
- **Early detection** - Catch performance regressions before production

## Table of Contents

- [Web Vitals Measurement](#web-vitals-measurement)
- [Network Performance](#network-performance)
- [Resource Loading](#resource-loading)
- [Performance Assertions](#performance-assertions)
- [Performance Budgets](#performance-budgets)
- [Profiling and Tracing](#profiling-and-tracing)

---

## Web Vitals Measurement

### Core Web Vitals

```typescript
import { test, expect } from '@playwright/test';

test('measure Core Web Vitals', async ({ page }) => {
  // Enable performance observer before navigation
  await page.addInitScript(() => {
    window.performanceMetrics = {};

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      window.performanceMetrics.lcp = lastEntry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay (FID) - measured via interaction
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      window.performanceMetrics.fid = entries[0].processingStart - entries[0].startTime;
    }).observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      window.performanceMetrics.cls = clsValue;
    }).observe({ type: 'layout-shift', buffered: true });
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Wait a bit for metrics to be collected
  await page.waitForTimeout(1000);

  const metrics = await page.evaluate(() => window.performanceMetrics);

  // Assert against thresholds
  expect(metrics.lcp).toBeLessThan(2500); // LCP should be < 2.5s
  expect(metrics.cls).toBeLessThan(0.1); // CLS should be < 0.1
});
```

### Using Performance API

```typescript
test('measure page load timing', async ({ page }) => {
  await page.goto('/products');
  await page.waitForLoadState('load');

  const timing = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      // DNS lookup
      dns: perf.domainLookupEnd - perf.domainLookupStart,
      // TCP connection
      tcp: perf.connectEnd - perf.connectStart,
      // TLS negotiation
      tls: perf.secureConnectionStart > 0 ? perf.connectEnd - perf.secureConnectionStart : 0,
      // Time to First Byte
      ttfb: perf.responseStart - perf.requestStart,
      // Content download
      download: perf.responseEnd - perf.responseStart,
      // DOM processing
      domProcessing: perf.domComplete - perf.domInteractive,
      // Total page load
      total: perf.loadEventEnd - perf.startTime,
    };
  });

  console.log('Performance Timing:', timing);

  // Assertions
  expect(timing.ttfb).toBeLessThan(600); // TTFB < 600ms
  expect(timing.total).toBeLessThan(3000); // Total load < 3s
});
```

### First Contentful Paint (FCP)

```typescript
test('measure First Contentful Paint', async ({ page }) => {
  await page.goto('/');

  const fcp = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          resolve(fcpEntry.startTime);
        }
      }).observe({ type: 'paint', buffered: true });

      // Fallback if already painted
      const existingEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (existingEntry) {
        resolve(existingEntry.startTime);
      }
    });
  });

  expect(fcp).toBeLessThan(1800); // FCP should be < 1.8s
});
```

---

## Network Performance

### Request Timing

```typescript
test('measure API response times', async ({ page }) => {
  const apiTimings: { url: string; duration: number }[] = [];

  // Intercept API requests
  page.on('response', async (response) => {
    const timing = response.request().timing();
    if (response.url().includes('/api/')) {
      apiTimings.push({
        url: response.url(),
        duration: timing.responseEnd - timing.requestStart,
      });
    }
  });

  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  // Log all API timings
  console.log('API Response Times:', apiTimings);

  // Assert all API calls are fast
  for (const timing of apiTimings) {
    expect(timing.duration).toBeLessThan(1000); // All APIs < 1s
  }
});
```

### Network Throttling

```typescript
test('performance under slow network', async ({ page, context }) => {
  // Simulate slow 3G
  const client = await context.newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (500 * 1024) / 8, // 500 Kbps
    uploadThroughput: (500 * 1024) / 8,
    latency: 400, // 400ms latency
  });

  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  const loadTime = Date.now() - startTime;

  // Even on slow network, should load within 10s
  expect(loadTime).toBeLessThan(10000);

  // Verify critical content is visible
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

### Resource Size Monitoring

```typescript
test('monitor resource sizes', async ({ page }) => {
  const resources: { url: string; size: number; type: string }[] = [];

  page.on('response', async (response) => {
    const headers = response.headers();
    const contentLength = headers['content-length'];
    const contentType = headers['content-type'] || 'unknown';

    if (contentLength) {
      resources.push({
        url: response.url(),
        size: parseInt(contentLength),
        type: contentType.split(';')[0],
      });
    }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Calculate total by type
  const byType = resources.reduce((acc, r) => {
    const type = r.type;
    acc[type] = (acc[type] || 0) + r.size;
    return acc;
  }, {} as Record<string, number>);

  console.log('Resources by type:', byType);

  // Assert reasonable sizes
  const totalJS = byType['application/javascript'] || 0;
  const totalCSS = byType['text/css'] || 0;

  expect(totalJS).toBeLessThan(500 * 1024); // JS < 500KB
  expect(totalCSS).toBeLessThan(100 * 1024); // CSS < 100KB
});
```

---

## Resource Loading

### Image Loading Performance

```typescript
test('image loading performance', async ({ page }) => {
  await page.goto('/products');

  // Wait for all images to load
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.every(img => img.complete && img.naturalHeight > 0);
  });

  // Get image performance data
  const imageMetrics = await page.evaluate(() => {
    const images = performance.getEntriesByType('resource')
      .filter((r): r is PerformanceResourceTiming =>
        r.initiatorType === 'img' || r.name.match(/\.(jpg|jpeg|png|webp|gif)$/i) !== null
      );

    return images.map(img => ({
      url: img.name,
      duration: img.responseEnd - img.startTime,
      size: img.transferSize,
    }));
  });

  console.log('Image metrics:', imageMetrics);

  // No image should take > 2s to load
  for (const img of imageMetrics) {
    expect(img.duration).toBeLessThan(2000);
  }
});
```

### JavaScript Execution Time

```typescript
test('measure JavaScript execution time', async ({ page }) => {
  // Start JavaScript profiling
  const client = await page.context().newCDPSession(page);
  await client.send('Profiler.enable');
  await client.send('Profiler.start');

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Stop profiling
  const { profile } = await client.send('Profiler.stop');

  // Calculate total JS execution time
  const totalTime = profile.nodes.reduce((acc, node) => {
    return acc + (node.hitCount || 0) * (profile.samplingInterval || 0);
  }, 0);

  console.log(`Total JS execution time: ${totalTime / 1000}ms`);

  // JS execution should be reasonable
  expect(totalTime / 1000).toBeLessThan(1000); // < 1s
});
```

---

## Performance Assertions

### Custom Performance Assertions

```typescript
// utils/performance-assertions.ts
import { Page, expect } from '@playwright/test';

interface PerformanceThresholds {
  fcp?: number;
  lcp?: number;
  ttfb?: number;
  totalLoad?: number;
}

export async function assertPerformance(
  page: Page,
  thresholds: PerformanceThresholds
): Promise<void> {
  const metrics = await page.evaluate(() => {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');

    return {
      fcp: fcpEntry?.startTime || 0,
      ttfb: navEntry.responseStart - navEntry.requestStart,
      totalLoad: navEntry.loadEventEnd - navEntry.startTime,
    };
  });

  if (thresholds.fcp) {
    expect(metrics.fcp, `FCP should be < ${thresholds.fcp}ms`).toBeLessThan(thresholds.fcp);
  }

  if (thresholds.ttfb) {
    expect(metrics.ttfb, `TTFB should be < ${thresholds.ttfb}ms`).toBeLessThan(thresholds.ttfb);
  }

  if (thresholds.totalLoad) {
    expect(metrics.totalLoad, `Total load should be < ${thresholds.totalLoad}ms`).toBeLessThan(thresholds.totalLoad);
  }
}
```

### Using Performance Assertions

```typescript
import { assertPerformance } from '../utils/performance-assertions';

test('homepage performance', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('load');

  await assertPerformance(page, {
    fcp: 1500,
    ttfb: 500,
    totalLoad: 3000,
  });
});
```

---

## Performance Budgets

### Define Performance Budgets

```typescript
// performance-budgets.ts
export const performanceBudgets = {
  homepage: {
    fcp: 1500,
    lcp: 2500,
    ttfb: 500,
    totalLoad: 3000,
    jsSize: 300 * 1024, // 300KB
    cssSize: 50 * 1024, // 50KB
    imageSize: 500 * 1024, // 500KB
  },
  productList: {
    fcp: 1800,
    lcp: 2800,
    ttfb: 600,
    totalLoad: 4000,
    jsSize: 400 * 1024,
    cssSize: 60 * 1024,
    imageSize: 800 * 1024,
  },
  checkout: {
    fcp: 1200,
    lcp: 2000,
    ttfb: 400,
    totalLoad: 2500,
    jsSize: 350 * 1024,
    cssSize: 50 * 1024,
    imageSize: 200 * 1024,
  },
};
```

### Budget Enforcement Tests

```typescript
import { performanceBudgets } from '../performance-budgets';

test.describe('Performance Budget Compliance', () => {
  test('homepage stays within budget', async ({ page }) => {
    const budget = performanceBudgets.homepage;

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Measure timing
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      return {
        fcp: fcp?.startTime || 0,
        ttfb: nav.responseStart - nav.requestStart,
        totalLoad: nav.loadEventEnd - nav.startTime,
      };
    });

    // Measure resource sizes
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((r: PerformanceResourceTiming) => ({
        type: r.initiatorType,
        size: r.transferSize,
      }));
    });

    const jsSize = resources.filter(r => r.type === 'script').reduce((sum, r) => sum + r.size, 0);
    const cssSize = resources.filter(r => r.type === 'link').reduce((sum, r) => sum + r.size, 0);
    const imgSize = resources.filter(r => r.type === 'img').reduce((sum, r) => sum + r.size, 0);

    // Assert against budget
    expect(timing.fcp).toBeLessThan(budget.fcp);
    expect(timing.ttfb).toBeLessThan(budget.ttfb);
    expect(timing.totalLoad).toBeLessThan(budget.totalLoad);
    expect(jsSize).toBeLessThan(budget.jsSize);
    expect(cssSize).toBeLessThan(budget.cssSize);
    expect(imgSize).toBeLessThan(budget.imageSize);
  });
});
```

---

## Profiling and Tracing

### Capture Performance Trace

```typescript
test('capture performance trace', async ({ page, browser }) => {
  // Start tracing
  await browser.startTracing(page, {
    screenshots: true,
    categories: ['devtools.timeline'],
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Stop tracing and save
  const traceBuffer = await browser.stopTracing();
  require('fs').writeFileSync('trace.json', traceBuffer);

  // The trace can be analyzed in Chrome DevTools
});
```

### Memory Profiling

```typescript
test('check for memory leaks', async ({ page }) => {
  await page.goto('/');

  // Get initial memory
  const initialMemory = await page.evaluate(() => {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  });

  // Perform actions that might leak memory
  for (let i = 0; i < 10; i++) {
    await page.getByRole('button', { name: 'Open Modal' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
  }

  // Force garbage collection (if available)
  await page.evaluate(() => {
    if (window.gc) window.gc();
  });

  // Get final memory
  const finalMemory = await page.evaluate(() => {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  });

  // Memory should not grow significantly
  const memoryGrowth = finalMemory - initialMemory;
  expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024); // < 5MB growth
});
```

---

## Best Practices

### 1. Run Performance Tests in Isolation

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'performance',
      testMatch: '**/*.perf.spec.ts',
      use: {
        // Disable features that might affect performance
        video: 'off',
        trace: 'off',
        screenshot: 'off',
      },
      // Run serially to avoid resource contention
      fullyParallel: false,
    },
  ],
});
```

### 2. Use Consistent Environment

```typescript
test.beforeEach(async ({ page }) => {
  // Clear cache and cookies
  await page.context().clearCookies();

  // Disable service workers
  await page.route('**/*', route => {
    if (route.request().url().includes('sw.js')) {
      route.abort();
    } else {
      route.continue();
    }
  });
});
```

### 3. Test Critical User Paths

```typescript
test.describe('Critical Path Performance', () => {
  test('homepage to checkout', async ({ page }) => {
    const timings: Record<string, number> = {};

    // Homepage
    let start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    timings.homepage = Date.now() - start;

    // Product page
    start = Date.now();
    await page.getByRole('link', { name: 'Featured Product' }).click();
    await page.waitForLoadState('networkidle');
    timings.productPage = Date.now() - start;

    // Add to cart
    start = Date.now();
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await page.waitForSelector('[data-testid="cart-notification"]');
    timings.addToCart = Date.now() - start;

    // Checkout
    start = Date.now();
    await page.getByRole('link', { name: 'Checkout' }).click();
    await page.waitForLoadState('networkidle');
    timings.checkout = Date.now() - start;

    console.log('Critical path timings:', timings);

    // Assert reasonable times
    expect(timings.homepage).toBeLessThan(3000);
    expect(timings.productPage).toBeLessThan(2000);
    expect(timings.addToCart).toBeLessThan(1000);
    expect(timings.checkout).toBeLessThan(2000);
  });
});
```

---

## Quick Reference

### Key Metrics

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | < 2.5s | 2.5s - 4s | > 4s |
| FID | < 100ms | 100ms - 300ms | > 300ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |
| FCP | < 1.8s | 1.8s - 3s | > 3s |
| TTFB | < 600ms | 600ms - 1.5s | > 1.5s |

### Performance APIs

```typescript
// Navigation timing
performance.getEntriesByType('navigation')

// Resource timing
performance.getEntriesByType('resource')

// Paint timing
performance.getEntriesByType('paint')

// Long tasks
PerformanceObserver with type: 'longtask'

// Layout shifts
PerformanceObserver with type: 'layout-shift'
```

---

## Related Resources

- [Playwright Best Practices](../playwright-best-practices/SKILL.md)
- [Web Vitals Documentation](https://web.dev/vitals/)
- [Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/)
