# CODAP v3 Visualization Testing Utilities

## Problem Statement

CODAP v3 relies heavily on data visualizations to present and analyze data. Testing these visualizations is challenging due to:

1. Complex interactions between data models and visual components
2. Difficulty in verifying correct rendering of data points
3. Need to test user interactions like zooming, panning, and selection
4. Performance considerations with large datasets

We need a comprehensive set of testing utilities to ensure that visualizations correctly represent data, handle user interactions properly, and maintain performance standards.

## Goals

1. Create utilities for testing chart/graph components
2. Develop helpers for verifying correct rendering of data points
3. Build utilities for testing user interactions with visualizations
4. Implement snapshot testing for visualization components
5. Add performance testing utilities for visualizations

## Non-Goals

1. Testing the underlying data models (covered by existing test utilities)
2. Testing the UI framework itself (Chakra UI, React)
3. End-to-end testing of the entire application

## Design

### 1. Visualization Component Testing Utilities

#### 1.1 Component Rendering Utilities

```typescript
/**
 * Renders a visualization component with the provided props and returns
 * testing utilities along with component-specific helpers
 */
function renderVisualization<P>(
  Component: React.ComponentType<P>,
  props: P,
  options?: RenderOptions
): RenderResult & VisualizationTestUtils;

/**
 * Visualization-specific test utilities
 */
interface VisualizationTestUtils {
  // Get all data points rendered in the visualization
  getDataPoints(): HTMLElement[];
  
  // Get data point by value or index
  getDataPointByValue(value: number | string): HTMLElement | null;
  getDataPointByIndex(index: number): HTMLElement | null;
  
  // Get axes elements
  getXAxis(): HTMLElement | null;
  getYAxis(): HTMLElement | null;
  
  // Get legend elements
  getLegend(): HTMLElement | null;
  getLegendItems(): HTMLElement[];
}
```

#### 1.2 Data Point Verification Utilities

```typescript
/**
 * Verifies that data points are rendered correctly based on the provided dataset
 */
function verifyDataPoints(
  container: HTMLElement,
  dataset: any[],
  options: {
    xAccessor: (item: any) => number | string;
    yAccessor: (item: any) => number | string;
    tolerance?: number; // For numeric comparisons
  }
): void;

/**
 * Verifies that a specific data point is rendered correctly
 */
function verifyDataPoint(
  dataPoint: HTMLElement,
  expectedValue: number | string,
  options?: {
    tolerance?: number;
    attribute?: string;
  }
): void;
```

### 2. User Interaction Testing Utilities

#### 2.1 Mouse Interaction Utilities

```typescript
/**
 * Simulates zooming on a visualization
 */
function simulateZoom(
  element: HTMLElement,
  options: {
    factor: number;
    point?: { x: number; y: number };
  }
): Promise<void>;

/**
 * Simulates panning on a visualization
 */
function simulatePan(
  element: HTMLElement,
  options: {
    deltaX: number;
    deltaY: number;
  }
): Promise<void>;

/**
 * Simulates selecting data points
 */
function simulateSelection(
  element: HTMLElement,
  options: {
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
  }
): Promise<void>;
```

#### 2.2 Keyboard Interaction Utilities

```typescript
/**
 * Simulates keyboard navigation in a visualization
 */
function simulateKeyboardNavigation(
  element: HTMLElement,
  keys: string[]
): Promise<void>;
```

### 3. Snapshot Testing Utilities

#### 3.1 Visual Snapshot Utilities

```typescript
/**
 * Creates a snapshot of a visualization component
 */
function snapshotVisualization(
  component: HTMLElement,
  options?: {
    removeAnimations?: boolean;
    excludeElements?: string[];
  }
): string;

/**
 * Compares a visualization with a baseline snapshot
 */
function compareWithBaseline(
  component: HTMLElement,
  baselineSnapshot: string,
  options?: {
    tolerance?: number;
    ignoreColors?: boolean;
  }
): { matches: boolean; differences?: string[] };
```

### 4. Performance Testing Utilities

#### 4.1 Rendering Performance Utilities

```typescript
/**
 * Measures the rendering performance of a visualization
 */
function measureRenderingPerformance(
  Component: React.ComponentType<any>,
  props: any,
  options?: {
    iterations?: number;
    warmupIterations?: number;
  }
): {
  averageRenderTime: number;
  medianRenderTime: number;
  minRenderTime: number;
  maxRenderTime: number;
};

/**
 * Measures the performance of interactions with a visualization
 */
function measureInteractionPerformance(
  element: HTMLElement,
  interaction: () => Promise<void>,
  options?: {
    iterations?: number;
    warmupIterations?: number;
  }
): Promise<{
  averageTime: number;
  medianTime: number;
  minTime: number;
  maxTime: number;
}>;
```

### 5. Integration with Existing Test Utilities

The visualization testing utilities will integrate with our existing MobX and data testing utilities:

```typescript
/**
 * Creates a test visualization with the provided dataset
 */
function createTestVisualization(
  type: 'scatter' | 'bar' | 'line' | 'pie',
  dataset: ITestDataSet,
  options?: {
    xAttribute?: string;
    yAttribute?: string;
    colorAttribute?: string;
    sizeAttribute?: string;
  }
): JSX.Element;

/**
 * Tracks changes in a visualization when the underlying data changes
 */
function trackVisualizationChanges(
  visualization: HTMLElement,
  dataModel: any,
  action: () => void
): {
  visualChanges: VisualChange[];
  dataChanges: IModelChange[];
};

interface VisualChange {
  element: HTMLElement;
  property: string;
  oldValue: any;
  newValue: any;
}
```

## Implementation Plan

### Phase 1: Basic Visualization Testing Utilities

1. Create the basic structure for visualization testing utilities
2. Implement component rendering utilities
3. Develop data point verification utilities
4. Add integration with existing test utilities

### Phase 2: User Interaction Testing

1. Implement mouse interaction utilities
2. Develop keyboard interaction utilities
3. Create helpers for testing selection and filtering

### Phase 3: Snapshot Testing

1. Implement visual snapshot utilities
2. Create baseline snapshots for common visualization types
3. Develop comparison utilities

### Phase 4: Performance Testing

1. Implement rendering performance utilities
2. Develop interaction performance utilities
3. Create benchmarks for common visualization operations

## Testing Strategy

We will test the visualization testing utilities themselves by:

1. Creating simple test visualizations
2. Applying the utilities to these visualizations
3. Verifying that the utilities correctly identify issues
4. Testing with both valid and invalid visualizations

## Documentation

We will create comprehensive documentation for the visualization testing utilities, including:

1. API documentation for each utility
2. Usage examples for common testing scenarios
3. Best practices for testing visualizations
4. Integration examples with existing test utilities 