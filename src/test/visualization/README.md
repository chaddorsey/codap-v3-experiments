# Visualization Testing Utilities

This directory contains utilities for testing visualization components in CODAP v3. These utilities provide a comprehensive approach to testing different aspects of visualizations, including rendering, performance, interactions, and accessibility.

## Overview

Testing visualizations is challenging because they involve complex rendering, user interactions, and performance considerations. The utilities in this directory aim to make testing visualizations more manageable by providing specialized tools for different testing scenarios.

## Utility Files

- **visualization-test-utils.ts**: Core utilities for testing visualization components
- **performance-test-utils.ts**: Utilities for measuring and testing visualization performance
- **snapshot-test-utils.ts**: Utilities for snapshot testing visualizations
- **interaction-test-utils.ts**: Utilities for testing user interactions with visualizations

## Testing Approach

Our approach to testing visualizations involves several complementary strategies:

### 1. Rendering Tests

Verify that visualizations render correctly with different data inputs and configurations.

```typescript
// Basic rendering test
test('renders scatter plot with correct number of points', () => {
  render(<ScatterPlotExample data={testData} />);
  
  // Check that all points are rendered
  const points = screen.getAllByTestId(/^point-/);
  expect(points).toHaveLength(testData.length);
});
```

### 2. Performance Tests

Measure and verify the performance of visualizations, including rendering time, interaction responsiveness, and data update efficiency.

```typescript
// Performance test
test('measures rendering performance', async () => {
  const result = await measureRenderingPerformance(
    ScatterPlotExample,
    { data: testData },
    { iterations: 5, warmupIterations: 2 }
  );
  
  // Log performance results
  console.log(createPerformanceReport('ScatterPlot Rendering', result));
  
  // Basic performance assertion
  expect(result.medianTime).toBeLessThan(100); // 100ms threshold
});
```

### 3. Snapshot Tests

Capture and compare visual snapshots of visualizations to detect unintended visual changes.

```typescript
// Snapshot test
test('captures and compares visualization snapshot', async () => {
  const { container } = render(<ScatterPlotExample data={testData} />);
  
  // Capture snapshot
  const snapshot = snapshotVisualization(container);
  
  // Compare with a reference snapshot
  const referenceSnapshot = '...'; // Reference snapshot data
  const comparisonResult = compareWithBaseline(container, referenceSnapshot);
  expect(comparisonResult.matches).toBe(true);
});
```

### 4. Interaction Tests

Test user interactions with visualizations, such as clicking, hovering, zooming, and panning.

```typescript
// Interaction test
test('selects points on click', () => {
  render(<ScatterPlotExample data={testData} />);
  const points = screen.getAllByTestId(/^point-/);
  
  // Click on a point to select it
  fireEvent.click(points[0]);
  
  // Check that the point is now selected
  expect(points[0].getAttribute('fill')).toBe('red');
});
```

### 5. Data Validation Tests

Verify that visualizations correctly represent the underlying data.

```typescript
// Data validation test
test('validates data point rendering', () => {
  const { container } = render(<ScatterPlotExample data={testData} />);
  
  verifyDataPoints(
    container,
    testData,
    {
      xAccessor: (point) => point.x,
      yAccessor: (point) => point.y,
      dataPointSelector: '[data-testid^="point-"]'
    }
  );
});
```

### 6. Edge Case Tests

Test visualizations with edge cases, such as empty data sets, single data points, or extreme values.

```typescript
// Edge case test
test('handles empty data set gracefully', () => {
  const { container } = render(<ScatterPlotExample data={[]} />);
  
  // Should generate random data when none is provided
  const points = screen.getAllByTestId(/^point-/);
  expect(points.length).toBeGreaterThan(0);
});
```

## Best Practices

1. **Add data-testid attributes**: Add data-testid attributes to key elements in your visualization components to make them easier to select in tests.

2. **Test with realistic data**: Use realistic data sets that represent the kinds of data your visualization will encounter in production.

3. **Test interactions thoroughly**: Visualizations often involve complex user interactions, so test these thoroughly.

4. **Test performance with large data sets**: Test performance with large data sets to ensure your visualization remains responsive.

5. **Test accessibility**: Ensure your visualizations are accessible by testing keyboard navigation, screen reader compatibility, and color contrast.

6. **Test responsiveness**: Test how your visualizations respond to different screen sizes and window resizing.

## Examples

See the `examples` directory for example visualization components and tests that demonstrate how to use these utilities.

- **scatter-plot-example.tsx**: A simple scatter plot component for testing
- **scatter-plot-example.test.tsx**: Tests for the scatter plot example

## Contributing

When adding new visualization components to CODAP v3, please follow these guidelines:

1. Add appropriate data-testid attributes to key elements
2. Write comprehensive tests using the utilities in this directory
3. Test rendering, performance, interactions, and edge cases
4. Document any special testing considerations for your component 