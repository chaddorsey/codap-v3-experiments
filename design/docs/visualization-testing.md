# Visualization Testing Utilities for CODAP v3

This document describes the visualization testing utilities available in the CODAP v3 codebase.

## Overview

The visualization testing utilities provide a comprehensive set of tools for testing visualization components in CODAP v3. These utilities are designed to make it easier to:

1. Render and interact with visualization components in tests
2. Verify that data points are rendered correctly
3. Test user interactions like zooming, panning, and selection
4. Create and compare snapshots of visualizations
5. Measure the performance of visualization components

## Basic Visualization Testing Utilities

Located in `src/test/visualization/visualization-test-utils.ts`.

### Rendering Visualizations

- `renderVisualization(Component, props, options)`: Renders a visualization component with the provided props and returns testing utilities along with component-specific helpers.

```typescript
import { renderVisualization } from 'src/test/visualization';

const { getDataPoints, getXAxis, getYAxis, getLegend } = renderVisualization(
  ScatterPlot,
  { data: testData }
);

// Check that the visualization was rendered correctly
expect(getDataPoints()).toHaveLength(10);
expect(getXAxis()).toBeInTheDocument();
```

### Verifying Data Points

- `verifyDataPoints(container, dataset, options)`: Verifies that data points are rendered correctly based on the provided dataset.

```typescript
import { verifyDataPoints } from 'src/test/visualization';

verifyDataPoints(container, testData, {
  xAccessor: item => item.x,
  yAccessor: item => item.y,
  tolerance: 0.001 // For numeric comparisons
});
```

- `verifyDataPoint(dataPoint, expectedValue, options)`: Verifies that a specific data point is rendered correctly.

```typescript
import { verifyDataPoint } from 'src/test/visualization';

const dataPoint = getDataPointByValue('A');
verifyDataPoint(dataPoint, 'A', { attribute: 'data-value' });
```

### Interacting with Data Points

- `clickDataPoint(dataPoint)`: Simulates clicking on a data point.
- `hoverDataPoint(dataPoint)`: Simulates hovering over a data point.

```typescript
import { clickDataPoint, hoverDataPoint } from 'src/test/visualization';

const dataPoint = getDataPointByIndex(0);
await clickDataPoint(dataPoint);
await hoverDataPoint(dataPoint);
```

## User Interaction Testing Utilities

Located in `src/test/visualization/interaction-test-utils.ts`.

### Mouse Interactions

- `simulateZoom(element, options)`: Simulates zooming on a visualization.
- `simulatePan(element, options)`: Simulates panning on a visualization.
- `simulateSelection(element, options)`: Simulates selecting data points.
- `simulateDoubleClick(element, point)`: Simulates a double click on a visualization element.
- `simulateRightClick(element, point)`: Simulates a right click on a visualization element.
- `simulateHover(element, point)`: Simulates a hover over a visualization element.
- `simulateMouseLeave(element)`: Simulates a mouse leave from a visualization element.

```typescript
import { 
  simulateZoom, 
  simulatePan, 
  simulateSelection 
} from 'src/test/visualization';

const visualization = screen.getByTestId('visualization');

// Zoom in by a factor of 1.5
await simulateZoom(visualization, { factor: 1.5 });

// Pan 10 pixels to the right and 20 pixels down
await simulatePan(visualization, { deltaX: 10, deltaY: 20 });

// Select a rectangular area
await simulateSelection(visualization, {
  startPoint: { x: 10, y: 10 },
  endPoint: { x: 50, y: 50 }
});
```

### Keyboard Interactions

- `simulateKeyboardNavigation(element, keys)`: Simulates keyboard navigation in a visualization.

```typescript
import { simulateKeyboardNavigation } from 'src/test/visualization';

const visualization = screen.getByTestId('visualization');

// Press the arrow keys
await simulateKeyboardNavigation(visualization, ['ArrowUp', 'ArrowRight']);
```

## Snapshot Testing Utilities

Located in `src/test/visualization/snapshot-test-utils.ts`.

### Creating and Comparing Snapshots

- `snapshotVisualization(component, options)`: Creates a snapshot of a visualization component.
- `compareWithBaseline(component, baselineSnapshot, options)`: Compares a visualization with a baseline snapshot.
- `saveBaselineSnapshot(component, options)`: Saves a baseline snapshot for a visualization component.
- `loadBaselineSnapshot(snapshot)`: Loads a baseline snapshot from a string.

```typescript
import { 
  snapshotVisualization, 
  compareWithBaseline 
} from 'src/test/visualization';

// Create a snapshot of the current visualization
const snapshot = snapshotVisualization(visualization, {
  removeAnimations: true,
  excludeElements: ['.tooltip']
});

// Save the snapshot as a baseline for future tests
saveBaselineSnapshot(visualization);

// Compare with a baseline snapshot
const result = compareWithBaseline(visualization, baselineSnapshot, {
  tolerance: 0.001,
  ignoreColors: true
});

if (!result.matches) {
  console.error('Differences:', result.differences);
}
```

## Performance Testing Utilities

Located in `src/test/visualization/performance-test-utils.ts`.

### Measuring Performance

- `measureRenderingPerformance(Component, props, options)`: Measures the rendering performance of a visualization component.
- `measureInteractionPerformance(element, interaction, options)`: Measures the performance of interactions with a visualization.
- `measureDataUpdatePerformance(element, dataUpdate, initialData, updateData, options)`: Measures the performance of data updates in a visualization.
- `measureZoomPerformance(element, zoomIn, zoomOut, options)`: Measures the performance of zooming in a visualization.
- `measurePanPerformance(element, panRight, panLeft, options)`: Measures the performance of panning in a visualization.

```typescript
import { 
  measureRenderingPerformance,
  measureInteractionPerformance,
  createPerformanceReport
} from 'src/test/visualization';

// Measure rendering performance
const renderResult = await measureRenderingPerformance(
  ScatterPlot,
  { data: testData },
  { iterations: 10, warmupIterations: 3 }
);

// Measure interaction performance
const interactionResult = await measureInteractionPerformance(
  visualization,
  async () => {
    await simulateZoom(visualization, { factor: 1.5 });
  },
  { iterations: 10, warmupIterations: 3 }
);

// Create a performance report
const report = createPerformanceReport('Scatter Plot Rendering', renderResult, 50);
console.log(report);
```

## Integration with Existing Test Utilities

The visualization testing utilities are designed to work seamlessly with the existing test utilities in CODAP v3, including:

- React Testing Library for rendering and querying components
- Jest for assertions and mocking
- MobX testing utilities for testing state changes

## Examples

### Testing a Scatter Plot

```typescript
import { renderVisualization, verifyDataPoints, simulateZoom } from 'src/test/visualization';
import { ScatterPlot } from 'src/components/graph/plots/scatter-plot/scatter-plot';
import { createTestDataSet } from 'src/test/data/testDataUtils';

describe('ScatterPlot', () => {
  it('should render data points correctly', () => {
    // Create test data
    const testData = [
      { x: 1, y: 2, value: 'A' },
      { x: 3, y: 4, value: 'B' },
      { x: 5, y: 6, value: 'C' }
    ];
    
    // Render the scatter plot
    const { getDataPoints, getXAxis, getYAxis } = renderVisualization(
      ScatterPlot,
      { data: testData }
    );
    
    // Check that the visualization was rendered correctly
    expect(getDataPoints()).toHaveLength(3);
    expect(getXAxis()).toBeInTheDocument();
    expect(getYAxis()).toBeInTheDocument();
    
    // Verify data points
    verifyDataPoints(container, testData, {
      xAccessor: item => item.x,
      yAccessor: item => item.y
    });
  });
  
  it('should handle zooming', async () => {
    // Render the scatter plot
    const { container } = renderVisualization(
      ScatterPlot,
      { data: testData }
    );
    
    // Simulate zooming
    await simulateZoom(container, { factor: 1.5 });
    
    // Verify that the zoom was applied
    // (This would depend on how your component handles zooming)
  });
});
```

### Testing Performance

```typescript
import { measureRenderingPerformance, createPerformanceReport } from 'src/test/visualization';
import { ScatterPlot } from 'src/components/graph/plots/scatter-plot/scatter-plot';

describe('ScatterPlot Performance', () => {
  it('should render efficiently with large datasets', async () => {
    // Create a large dataset
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      value: `Point ${i}`
    }));
    
    // Measure rendering performance
    const result = await measureRenderingPerformance(
      ScatterPlot,
      { data: largeData },
      { iterations: 5, warmupIterations: 2 }
    );
    
    // Create a performance report
    const report = createPerformanceReport('Scatter Plot Rendering (1000 points)', result, 100);
    console.log(report);
    
    // Assert that the median render time is below the threshold
    expect(result.medianTime).toBeLessThan(100);
  });
});
```

## Best Practices

1. **Use the right utility for the job**: Choose the appropriate utility based on what you're testing (rendering, interaction, performance, etc.).
2. **Test with realistic data**: Use data that represents real-world scenarios to ensure your tests are meaningful.
3. **Test edge cases**: Test with empty datasets, large datasets, and datasets with extreme values.
4. **Test interactions**: Don't just test static rendering; test how the visualization responds to user interactions.
5. **Set reasonable performance thresholds**: Base performance thresholds on realistic expectations and adjust as needed.
6. **Use snapshot testing judiciously**: Snapshots are useful for detecting unexpected changes, but they can be brittle if overused.
7. **Combine with other testing approaches**: Use these utilities alongside unit tests, integration tests, and end-to-end tests for comprehensive coverage. 