# Scatter Plot Testing Example

This document demonstrates how to test the scatter plot component using the visualization testing utilities.

## Overview

The scatter plot component is a key visualization in CODAP v3. It displays data points on a 2D coordinate system, allowing users to visualize relationships between variables. Testing this component requires verifying:

1. Correct rendering of data points
2. Proper handling of user interactions (zooming, panning, selection)
3. Performance with various dataset sizes
4. Visual consistency through snapshots

## Test Structure

The tests for the scatter plot component are organized into four main categories:

1. **Rendering Tests**: Verify that data points are displayed correctly
2. **Interaction Tests**: Ensure that user interactions work as expected
3. **Snapshot Tests**: Confirm visual consistency
4. **Performance Tests**: Measure rendering and interaction efficiency

## Example Test Implementation

Below is an example of how to implement tests for the scatter plot component using the visualization testing utilities:

```typescript
/**
 * Tests for Scatter Plot Component
 * 
 * This file contains tests for the scatter plot component using the visualization testing utilities.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { 
  renderVisualization, 
  verifyDataPoints, 
  clickDataPoint,
  hoverDataPoint
} from '../visualization/visualization-test-utils';
import {
  simulateZoom,
  simulatePan,
  simulateSelection
} from '../visualization/interaction-test-utils';
import {
  snapshotVisualization,
  compareWithBaseline
} from '../visualization/snapshot-test-utils';
import {
  measureRenderingPerformance,
  measureInteractionPerformance,
  measureDataUpdatePerformance,
  createPerformanceReport
} from '../visualization/performance-test-utils';
import { ScatterPlot } from '../../components/graph/plots/scatter-plot/scatter-plot';

// Mock dependencies as needed

describe('Scatter Plot Component', () => {
  // Test data
  const testData = [
    { id: '1', x: 1, y: 2 },
    { id: '2', x: 3, y: 4 },
    { id: '3', x: 5, y: 6 }
  ];

  describe('Rendering Tests', () => {
    it('should render data points correctly', () => {
      const { getDataPoints, getXAxis, getYAxis } = renderVisualization(
        ScatterPlot,
        { data: testData }
      );

      // Check that the visualization was rendered correctly
      expect(getDataPoints()).toHaveLength(3);
      expect(getXAxis()).toBeInTheDocument();
      expect(getYAxis()).toBeInTheDocument();
    });

    it('should position data points according to their coordinates', () => {
      const { container } = render(<ScatterPlot data={testData} />);
      
      // Verify data points
      verifyDataPoints(container, testData, {
        xAccessor: item => item.x,
        yAccessor: item => item.y
      });
    });

    it('should handle empty data', () => {
      const { getDataPoints } = renderVisualization(
        ScatterPlot,
        { data: [] }
      );

      // Check that no data points are rendered
      expect(getDataPoints()).toHaveLength(0);
    });
  });

  describe('Interaction Tests', () => {
    it('should handle clicking on data points', async () => {
      const { getDataPointByIndex } = renderVisualization(
        ScatterPlot,
        { data: testData }
      );

      const dataPoint = getDataPointByIndex(0);
      
      // Click on the data point
      await clickDataPoint(dataPoint);
      
      // Verify that the point was selected
      expect(dataPoint).toHaveClass('selected');
    });

    it('should handle zooming', async () => {
      const { container } = render(<ScatterPlot data={testData} />);
      
      // Get initial positions
      const initialPositions = getDataPointPositions(container);
      
      // Simulate zooming
      await simulateZoom(container, { factor: 1.5 });
      
      // Get new positions
      const newPositions = getDataPointPositions(container);
      
      // Verify that points have moved outward from center
      expect(newPositions).toShowZoomEffect(initialPositions, 1.5);
    });
  });

  describe('Snapshot Tests', () => {
    it('should match baseline snapshot', () => {
      const { container } = render(<ScatterPlot data={testData} />);
      
      // Create a snapshot of the current visualization
      const snapshot = snapshotVisualization(container);
      
      // Compare with baseline
      const result = compareWithBaseline(container, baselineSnapshot);
      expect(result.matches).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should render efficiently', async () => {
      const result = await measureRenderingPerformance(
        ScatterPlot,
        { data: testData },
        { iterations: 10, warmupIterations: 3 }
      );
      
      // Check the performance results
      expect(result.medianTime).toBeLessThan(50); // 50ms threshold
      
      // Create a performance report
      const report = createPerformanceReport('Scatter Plot Rendering', result);
      console.log(report);
    });

    it('should handle large datasets efficiently', async () => {
      // Create a large dataset
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      
      const result = await measureRenderingPerformance(
        ScatterPlot,
        { data: largeData },
        { iterations: 5, warmupIterations: 2 }
      );
      
      // Check the performance results
      expect(result.medianTime).toBeLessThan(200); // 200ms threshold for 1000 points
    });
  });
});
```

## Key Testing Utilities

### Rendering Testing

- `renderVisualization`: Renders a visualization component with testing utilities
- `verifyDataPoints`: Verifies that data points are rendered correctly
- `getDataPointByIndex`: Gets a data point by its index
- `getDataPointByValue`: Gets a data point by its value

### Interaction Testing

- `clickDataPoint`: Simulates clicking on a data point
- `hoverDataPoint`: Simulates hovering over a data point
- `simulateZoom`: Simulates zooming on a visualization
- `simulatePan`: Simulates panning on a visualization
- `simulateSelection`: Simulates selecting data points

### Snapshot Testing

- `snapshotVisualization`: Creates a snapshot of a visualization
- `compareWithBaseline`: Compares a visualization with a baseline snapshot

### Performance Testing

- `measureRenderingPerformance`: Measures rendering performance
- `measureInteractionPerformance`: Measures interaction performance
- `measureDataUpdatePerformance`: Measures data update performance
- `createPerformanceReport`: Creates a performance report

## Best Practices

1. **Test with realistic data**: Use data that represents real-world scenarios
2. **Test edge cases**: Empty datasets, single data points, large datasets
3. **Test interactions**: Verify that user interactions work as expected
4. **Set reasonable performance thresholds**: Base thresholds on realistic expectations
5. **Create baseline snapshots**: Update baselines when intentional visual changes are made

## Next Steps

After implementing the basic tests for the scatter plot component, consider:

1. Testing with different configurations (colors, sizes, etc.)
2. Testing with categorical data on one axis
3. Testing with multiple series of data
4. Testing with different adornments (trend lines, etc.)
5. Testing accessibility features 