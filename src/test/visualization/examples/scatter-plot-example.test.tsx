import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScatterPlotExample } from './scatter-plot-example';
import { 
  measureRenderingPerformance, 
  createPerformanceReport 
} from '../performance-test-utils';
import { 
  snapshotVisualization, 
  compareWithBaseline 
} from '../snapshot-test-utils';
import { 
  simulateZoom, 
  simulatePan 
} from '../interaction-test-utils';
import { 
  renderVisualization,
  verifyDataPoints
} from '../visualization-test-utils';

describe('ScatterPlotExample', () => {
  const testData = Array.from({ length: 20 }, (_, i) => ({
    x: 50 + i * 15,
    y: 150 + Math.sin(i * 0.5) * 100
  }));

  // Basic rendering test
  test('renders scatter plot with correct number of points', () => {
    render(<ScatterPlotExample data={testData} />);
    
    // Check that all points are rendered
    const points = screen.getAllByTestId(/^point-/);
    expect(points).toHaveLength(testData.length);
  });

  // Performance test
  test('measures rendering performance', async () => {
    const result = await measureRenderingPerformance(
      ScatterPlotExample,
      { data: testData },
      { iterations: 5, warmupIterations: 2 }
    );
    
    // Log performance results
    console.log(createPerformanceReport('ScatterPlot Rendering', result));
    
    // Basic performance assertion (adjust threshold as needed)
    expect(result.medianTime).toBeLessThan(100); // 100ms threshold
  });

  // Snapshot test
  test('captures and compares visualization snapshot', async () => {
    const { container } = render(<ScatterPlotExample data={testData} />);
    
    // Capture snapshot
    const snapshot = snapshotVisualization(container);
    
    // In a real test, you would compare with a reference snapshot
    // For this example, we'll just verify the snapshot is not empty
    expect(snapshot).toBeTruthy();
    
    // Example of comparing with a reference (would need a real reference)
    // const referenceSnapshot = '...'; // Reference snapshot data
    // const comparisonResult = compareWithBaseline(container, referenceSnapshot);
    // expect(comparisonResult.matches).toBe(true);
  });

  // Visualization test utilities
  test('uses visualization test utilities', () => {
    const { getDataPoints } = renderVisualization(
      ScatterPlotExample,
      { data: testData },
      { dataPointSelector: '[data-testid^="point-"]' }
    );
    
    const dataPoints = getDataPoints();
    expect(dataPoints).toHaveLength(testData.length);
  });

  // Data rendering validation
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
}); 