# Performance Benchmarking Strategy

This document outlines the comprehensive performance benchmarking strategy for measuring and validating the mixin refactoring benefits.

## Performance Goals

### Primary Objectives

- **Bundle Size Reduction**: 40-60% smaller bundles for simple components
- **Runtime Performance**: No regression in component lifecycle performance
- **Memory Usage**: Reduce memory footprint for unused functionality
- **Tree Shaking**: Ensure unused mixin code is eliminated from builds

### Success Metrics

| Metric                       | Target                     | Measurement Method      |
| ---------------------------- | -------------------------- | ----------------------- |
| Simple Component Bundle Size | -50% vs BaseComponent      | Webpack Bundle Analyzer |
| Component Creation Time      | ±5% vs BaseComponent       | Performance API         |
| Memory Usage per Component   | -20% vs BaseComponent      | Chrome DevTools         |
| Tree Shaking Effectiveness   | 100% unused mixins removed | Bundle analysis         |
| First Paint Performance      | No regression              | Lighthouse/Web Vitals   |

## Benchmarking Infrastructure

### Measurement Tools

```typescript
// src/test/performance/benchmark-utils.ts

export interface PerformanceMeasurement {
  bundleSize: number;
  creationTime: number;
  memoryUsage: number;
  renderTime: number;
  lifecycleTime: number;
}

export class ComponentBenchmark {
  private measurements: PerformanceMeasurement[] = [];

  async measureComponent<T extends HTMLElement>(
    ComponentClass: CustomElementConstructor,
    iterations: number = 1000
  ): Promise<PerformanceMeasurement> {
    const bundleSize = await this.measureBundleSize(ComponentClass);
    const creationTime = await this.measureCreationTime(ComponentClass, iterations);
    const memoryUsage = await this.measureMemoryUsage(ComponentClass, iterations);
    const renderTime = await this.measureRenderTime(ComponentClass, iterations);
    const lifecycleTime = await this.measureLifecycleTime(ComponentClass, iterations);

    return {
      bundleSize,
      creationTime,
      memoryUsage,
      renderTime,
      lifecycleTime,
    };
  }

  private async measureBundleSize(ComponentClass: CustomElementConstructor): Promise<number> {
    // Use webpack-bundle-analyzer data or rollup-plugin-analyzer
    return await getBundleSizeForComponent(ComponentClass.name);
  }

  private async measureCreationTime(
    ComponentClass: CustomElementConstructor,
    iterations: number
  ): Promise<number> {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const element = new ComponentClass();
      // Prevent optimization
      element.toString();
    }

    const end = performance.now();
    return (end - start) / iterations;
  }

  private async measureMemoryUsage(
    ComponentClass: CustomElementConstructor,
    iterations: number
  ): Promise<number> {
    // Use performance.measureUserAgentSpecificMemory if available
    const initialMemory = await this.getMemoryUsage();

    const elements: HTMLElement[] = [];
    for (let i = 0; i < iterations; i++) {
      elements.push(new ComponentClass());
    }

    const finalMemory = await this.getMemoryUsage();

    // Cleanup
    elements.length = 0;

    return (finalMemory - initialMemory) / iterations;
  }

  private async measureRenderTime(
    ComponentClass: CustomElementConstructor,
    iterations: number
  ): Promise<number> {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const element = new ComponentClass();
      container.appendChild(element);
      element.remove();
    }

    const end = performance.now();
    container.remove();

    return (end - start) / iterations;
  }

  private async measureLifecycleTime(
    ComponentClass: CustomElementConstructor,
    iterations: number
  ): Promise<number> {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const elements = Array.from({ length: iterations }, () => new ComponentClass());

    const start = performance.now();

    // Measure connectedCallback time
    elements.forEach((el) => container.appendChild(el));

    // Measure disconnectedCallback time
    elements.forEach((el) => el.remove());

    const end = performance.now();
    container.remove();

    return (end - start) / iterations;
  }

  private async getMemoryUsage(): Promise<number> {
    if ('measureUserAgentSpecificMemory' in performance) {
      const memory = await (performance as any).measureUserAgentSpecificMemory();
      return memory.bytes;
    } else {
      // Fallback for browsers without the API
      return (performance as any).memory?.usedJSHeapSize || 0;
    }
  }
}
```

### Bundle Analysis Setup

```typescript
// src/test/performance/bundle-analysis.ts

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  componentSize: number;
  mixinSizes: Record<string, number>;
  treeShakenBytes: number;
}

export class BundleAnalyzer {
  async analyzeComponent(componentName: string): Promise<BundleAnalysis> {
    // Integration with webpack-bundle-analyzer or similar
    const bundleStats = await this.getBundleStats(componentName);

    return {
      totalSize: bundleStats.size,
      gzippedSize: bundleStats.gzippedSize,
      componentSize: bundleStats.modules[componentName]?.size || 0,
      mixinSizes: this.extractMixinSizes(bundleStats),
      treeShakenBytes: this.calculateTreeShakenBytes(bundleStats),
    };
  }

  private extractMixinSizes(bundleStats: any): Record<string, number> {
    const mixinSizes: Record<string, number> = {};

    Object.entries(bundleStats.modules).forEach(([path, module]: [string, any]) => {
      if (path.includes('/mixins/')) {
        const mixinName = path.split('/').pop()?.replace('.js', '') || 'unknown';
        mixinSizes[mixinName] = module.size;
      }
    });

    return mixinSizes;
  }

  private calculateTreeShakenBytes(bundleStats: any): number {
    // Calculate how much code was eliminated by tree shaking
    const totalMixinCode = bundleStats.allMixinSize || 0;
    const includedMixinCode = Object.values(bundleStats.modules)
      .filter((module: any) => module.path.includes('/mixins/'))
      .reduce((sum: number, module: any) => sum + module.size, 0);

    return totalMixinCode - includedMixinCode;
  }

  private async getBundleStats(componentName: string): Promise<any> {
    // Mock implementation - integrate with actual bundle analyzer
    return {
      size: 15000,
      gzippedSize: 5000,
      modules: {
        [componentName]: { size: 3000 },
      },
    };
  }
}
```

## Baseline Measurement Strategy

### Current BaseComponent Benchmarks

```typescript
// src/test/performance/baseline-measurements.test.ts

import { describe, it, expect, beforeAll } from 'vitest';
import { ComponentBenchmark } from './benchmark-utils.js';
import { BaseComponent } from '../../base/BaseComponent.js';

describe('Baseline Performance Measurements', () => {
  let benchmark: ComponentBenchmark;
  let baselineResults: PerformanceMeasurement;

  beforeAll(async () => {
    benchmark = new ComponentBenchmark();

    // Create baseline test component
    class BaselineTestComponent extends BaseComponent {
      constructor() {
        super({ tagName: 'baseline-test' });
      }

      protected getAccessibilityConfig() {
        return {};
      }
      protected getStateClasses() {
        return {};
      }
    }

    customElements.define('baseline-test-component', BaselineTestComponent);
    baselineResults = await benchmark.measureComponent(BaselineTestComponent);

    // Store baseline for comparison
    localStorage.setItem('performance-baseline', JSON.stringify(baselineResults));
  });

  it('should establish baseline measurements', () => {
    expect(baselineResults.bundleSize).toBeGreaterThan(0);
    expect(baselineResults.creationTime).toBeGreaterThan(0);
    expect(baselineResults.memoryUsage).toBeGreaterThan(0);

    console.log('Baseline Measurements:', baselineResults);
  });

  it('should save baseline data for future comparisons', () => {
    const saved = localStorage.getItem('performance-baseline');
    expect(saved).toBeTruthy();

    const parsed = JSON.parse(saved!);
    expect(parsed).toEqual(baselineResults);
  });
});
```

### Comparative Benchmarking

```typescript
// src/test/performance/mixin-comparison.test.ts

import { describe, it, expect, beforeAll } from 'vitest';
import { ComponentBenchmark } from './benchmark-utils.js';
import { SimpleComponent } from '../../base/composites/SimpleComponent.js';
import { InteractiveComponent } from '../../base/composites/InteractiveComponent.js';
import { FullComponent } from '../../base/composites/FullComponent.js';

describe('Mixin Performance Comparison', () => {
  let benchmark: ComponentBenchmark;
  let baseline: PerformanceMeasurement;

  beforeAll(async () => {
    benchmark = new ComponentBenchmark();
    const baselineData = localStorage.getItem('performance-baseline');
    baseline = JSON.parse(baselineData!);
  });

  describe('SimpleComponent Performance', () => {
    it('should be significantly smaller than BaseComponent', async () => {
      class TestSimpleComponent extends SimpleComponent {
        constructor() {
          super({ tagName: 'test-simple' });
        }
      }

      customElements.define('test-simple-perf', TestSimpleComponent);
      const results = await benchmark.measureComponent(TestSimpleComponent);

      // Should be at least 40% smaller
      expect(results.bundleSize).toBeLessThan(baseline.bundleSize * 0.6);

      // Performance should be similar or better
      expect(results.creationTime).toBeLessThanOrEqual(baseline.creationTime * 1.05);
      expect(results.memoryUsage).toBeLessThan(baseline.memoryUsage * 0.8);

      console.log('SimpleComponent vs Baseline:', {
        bundleSizeReduction:
          (((baseline.bundleSize - results.bundleSize) / baseline.bundleSize) * 100).toFixed(1) +
          '%',
        memoryReduction:
          (((baseline.memoryUsage - results.memoryUsage) / baseline.memoryUsage) * 100).toFixed(1) +
          '%',
      });
    });
  });

  describe('InteractiveComponent Performance', () => {
    it('should be smaller than BaseComponent but larger than SimpleComponent', async () => {
      class TestInteractiveComponent extends InteractiveComponent {
        constructor() {
          super({ tagName: 'test-interactive' });
        }

        protected getAccessibilityConfig() {
          return { role: 'button' };
        }
      }

      customElements.define('test-interactive-perf', TestInteractiveComponent);
      const results = await benchmark.measureComponent(TestInteractiveComponent);

      // Should be smaller than baseline but larger than simple
      expect(results.bundleSize).toBeLessThan(baseline.bundleSize * 0.8);
      expect(results.bundleSize).toBeGreaterThan(baseline.bundleSize * 0.3);

      console.log('InteractiveComponent Performance:', results);
    });
  });

  describe('FullComponent Performance', () => {
    it('should have similar bundle size to BaseComponent', async () => {
      class TestFullComponent extends FullComponent {
        constructor() {
          super({ tagName: 'test-full' });
        }

        protected getAccessibilityConfig() {
          return {};
        }
        protected getStateClasses() {
          return {};
        }
      }

      customElements.define('test-full-perf', TestFullComponent);
      const results = await benchmark.measureComponent(TestFullComponent);

      // Should be similar in size (within 10%)
      expect(results.bundleSize).toBeLessThan(baseline.bundleSize * 1.1);
      expect(results.bundleSize).toBeGreaterThan(baseline.bundleSize * 0.9);

      // But should have better performance characteristics
      expect(results.creationTime).toBeLessThanOrEqual(baseline.creationTime);

      console.log('FullComponent vs Baseline:', {
        bundleSizeDiff:
          (((results.bundleSize - baseline.bundleSize) / baseline.bundleSize) * 100).toFixed(1) +
          '%',
        creationTimeDiff:
          (((results.creationTime - baseline.creationTime) / baseline.creationTime) * 100).toFixed(
            1
          ) + '%',
      });
    });
  });
});
```

## Tree Shaking Validation

### Bundle Analysis Tests

```typescript
// src/test/performance/tree-shaking.test.ts

import { describe, it, expect } from 'vitest';
import { BundleAnalyzer } from './bundle-analysis.js';

describe('Tree Shaking Effectiveness', () => {
  let analyzer: BundleAnalyzer;

  beforeEach(() => {
    analyzer = new BundleAnalyzer();
  });

  it('should eliminate unused AccessibilityMixin from SimpleComponent', async () => {
    const analysis = await analyzer.analyzeComponent('SimpleComponent');

    expect(analysis.mixinSizes.AccessibilityMixin).toBeUndefined();
    expect(analysis.treeShakenBytes).toBeGreaterThan(1000); // Significant elimination
  });

  it('should include only necessary mixins in InteractiveComponent', async () => {
    const analysis = await analyzer.analyzeComponent('InteractiveComponent');

    // Should include these mixins
    expect(analysis.mixinSizes.AccessibilityMixin).toBeGreaterThan(0);
    expect(analysis.mixinSizes.EventManagerMixin).toBeGreaterThan(0);
    expect(analysis.mixinSizes.UpdateManagerMixin).toBeGreaterThan(0);

    // Should exclude these mixins
    expect(analysis.mixinSizes.ShadowDOMMixin).toBeUndefined();
    expect(analysis.mixinSizes.StyleManagerMixin).toBeUndefined();
    expect(analysis.mixinSizes.SlotManagerMixin).toBeUndefined();
  });

  it('should have effective tree shaking across all components', async () => {
    const components = [
      'SimpleComponent',
      'InteractiveComponent',
      'AttributeComponent',
      'ShadowComponent',
    ];

    for (const component of components) {
      const analysis = await analyzer.analyzeComponent(component);

      // Each component should have eliminated some unused code
      expect(analysis.treeShakenBytes).toBeGreaterThan(500);

      console.log(`${component} tree shaking:`, {
        eliminated: analysis.treeShakenBytes,
        finalSize: analysis.componentSize,
      });
    }
  });
});
```

## Runtime Performance Monitoring

### Real-World Performance Tests

```typescript
// src/test/performance/runtime-performance.test.ts

import { describe, it, expect } from 'vitest';

describe('Runtime Performance', () => {
  describe('Component Lifecycle Performance', () => {
    it('should have fast creation time for all component types', async () => {
      const componentTypes = [
        'SimpleComponent',
        'InteractiveComponent',
        'AttributeComponent',
        'ShadowComponent',
        'FullComponent',
      ];

      for (const type of componentTypes) {
        const ComponentClass = await import(`../../base/composites/${type}.js`);

        const start = performance.now();
        const iterations = 1000;

        for (let i = 0; i < iterations; i++) {
          const element = new ComponentClass.default({ tagName: 'perf-test' });
          element.toString(); // Prevent optimization
        }

        const end = performance.now();
        const avgTime = (end - start) / iterations;

        // Should create component in less than 0.1ms on average
        expect(avgTime).toBeLessThan(0.1);

        console.log(`${type} creation time: ${avgTime.toFixed(4)}ms`);
      }
    });

    it('should have fast DOM connection time', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const elements = Array.from({ length: 100 }, (_, i) => {
        const el = document.createElement('test-perf-component');
        el.textContent = `Element ${i}`;
        return el;
      });

      const start = performance.now();

      elements.forEach((el) => container.appendChild(el));

      const end = performance.now();
      const totalTime = end - start;

      // Should connect 100 elements in less than 10ms
      expect(totalTime).toBeLessThan(10);

      container.remove();

      console.log(`DOM connection time for 100 elements: ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Patterns', () => {
    it('should not leak memory during component lifecycle', async () => {
      const initialMemory = await getMemoryUsage();

      // Create and destroy many components
      for (let i = 0; i < 10; i++) {
        const elements = Array.from({ length: 100 }, () =>
          document.createElement('test-memory-component')
        );

        // Add to DOM
        const container = document.createElement('div');
        elements.forEach((el) => container.appendChild(el));
        document.body.appendChild(container);

        // Remove from DOM
        container.remove();

        // Force garbage collection if available
        if ('gc' in window) {
          (window as any).gc();
        }
      }

      const finalMemory = await getMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);

      console.log(`Memory increase after lifecycle test: ${(memoryIncrease / 1024).toFixed(2)}KB`);
    });
  });
});

async function getMemoryUsage(): Promise<number> {
  if ('measureUserAgentSpecificMemory' in performance) {
    const memory = await (performance as any).measureUserAgentSpecificMemory();
    return memory.bytes;
  } else {
    return (performance as any).memory?.usedJSHeapSize || 0;
  }
}
```

## Performance Reporting

### Automated Performance Reports

```typescript
// src/test/performance/performance-reporter.ts

export interface PerformanceReport {
  timestamp: string;
  baseline: PerformanceMeasurement;
  components: Record<string, PerformanceMeasurement>;
  bundleAnalysis: Record<string, BundleAnalysis>;
  summary: {
    averageBundleReduction: number;
    averagePerformanceImprovement: number;
    treeShakenBytes: number;
    regressions: string[];
    improvements: string[];
  };
}

export class PerformanceReporter {
  async generateReport(): Promise<PerformanceReport> {
    const benchmark = new ComponentBenchmark();
    const analyzer = new BundleAnalyzer();

    // Get baseline
    const baseline = JSON.parse(localStorage.getItem('performance-baseline') || '{}');

    // Measure all component types
    const componentTypes = [
      'SimpleComponent',
      'InteractiveComponent',
      'AttributeComponent',
      'ShadowComponent',
      'FullComponent',
    ];
    const components: Record<string, PerformanceMeasurement> = {};
    const bundleAnalysis: Record<string, BundleAnalysis> = {};

    for (const type of componentTypes) {
      const ComponentClass = await import(`../../base/composites/${type}.js`);
      components[type] = await benchmark.measureComponent(ComponentClass.default);
      bundleAnalysis[type] = await analyzer.analyzeComponent(type);
    }

    // Generate summary
    const summary = this.generateSummary(baseline, components, bundleAnalysis);

    return {
      timestamp: new Date().toISOString(),
      baseline,
      components,
      bundleAnalysis,
      summary,
    };
  }

  private generateSummary(
    baseline: PerformanceMeasurement,
    components: Record<string, PerformanceMeasurement>,
    bundleAnalysis: Record<string, BundleAnalysis>
  ) {
    const bundleReductions = Object.values(components).map(
      (comp) => ((baseline.bundleSize - comp.bundleSize) / baseline.bundleSize) * 100
    );

    const performanceChanges = Object.values(components).map(
      (comp) => ((baseline.creationTime - comp.creationTime) / baseline.creationTime) * 100
    );

    const totalTreeShaken = Object.values(bundleAnalysis).reduce(
      (sum, analysis) => sum + analysis.treeShakenBytes,
      0
    );

    const regressions: string[] = [];
    const improvements: string[] = [];

    Object.entries(components).forEach(([name, comp]) => {
      if (comp.creationTime > baseline.creationTime * 1.05) {
        regressions.push(
          `${name}: +${((comp.creationTime / baseline.creationTime - 1) * 100).toFixed(1)}% creation time`
        );
      } else if (comp.creationTime < baseline.creationTime * 0.95) {
        improvements.push(
          `${name}: -${((1 - comp.creationTime / baseline.creationTime) * 100).toFixed(1)}% creation time`
        );
      }

      if (comp.bundleSize < baseline.bundleSize * 0.9) {
        improvements.push(
          `${name}: -${((1 - comp.bundleSize / baseline.bundleSize) * 100).toFixed(1)}% bundle size`
        );
      }
    });

    return {
      averageBundleReduction: bundleReductions.reduce((a, b) => a + b, 0) / bundleReductions.length,
      averagePerformanceImprovement:
        performanceChanges.reduce((a, b) => a + b, 0) / performanceChanges.length,
      treeShakenBytes: totalTreeShaken,
      regressions,
      improvements,
    };
  }

  async saveReport(report: PerformanceReport): Promise<void> {
    // Save to file system or send to monitoring service
    const reportJson = JSON.stringify(report, null, 2);
    console.log('Performance Report:', reportJson);

    // Could save to file or send to external service
    localStorage.setItem(`performance-report-${Date.now()}`, reportJson);
  }
}
```

## Continuous Performance Monitoring

### Integration with CI/CD

```bash
# scripts/performance-check.sh
#!/bin/bash

echo "Running performance benchmarks..."

# Run baseline measurements
npm run test:performance:baseline

# Run mixin comparison tests
npm run test:performance:comparison

# Run tree shaking validation
npm run test:performance:tree-shaking

# Generate performance report
npm run test:performance:report

# Check for regressions
npm run test:performance:validate

echo "Performance benchmarking complete"
```

### Performance Gates

```typescript
// src/test/performance/performance-gates.test.ts

import { describe, it, expect } from 'vitest';
import { PerformanceReporter } from './performance-reporter.js';

describe('Performance Gates', () => {
  it('should pass all performance requirements', async () => {
    const reporter = new PerformanceReporter();
    const report = await reporter.generateReport();

    // Bundle size requirements
    expect(report.summary.averageBundleReduction).toBeGreaterThan(30); // At least 30% reduction on average

    // Performance requirements
    expect(report.summary.averagePerformanceImprovement).toBeGreaterThanOrEqual(-5); // No more than 5% regression

    // Tree shaking requirements
    expect(report.summary.treeShakenBytes).toBeGreaterThan(10000); // At least 10KB eliminated

    // No critical regressions
    const criticalRegressions = report.summary.regressions.filter(
      (reg) => reg.includes('+20%') || reg.includes('+30%')
    );
    expect(criticalRegressions).toHaveLength(0);

    // Log results
    console.log('Performance Gate Results:', {
      averageBundleReduction: `${report.summary.averageBundleReduction.toFixed(1)}%`,
      averagePerformanceChange: `${report.summary.averagePerformanceImprovement.toFixed(1)}%`,
      treeShakenKB: `${(report.summary.treeShakenBytes / 1024).toFixed(1)}KB`,
      improvements: report.summary.improvements.length,
      regressions: report.summary.regressions.length,
    });
  });
});
```

This comprehensive performance benchmarking strategy ensures that the mixin refactoring delivers on its promises of better performance, smaller bundles, and effective tree shaking while maintaining runtime performance standards.
