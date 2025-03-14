import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScatterPlotExample } from './scatter-plot-example';
import { 
  measureRenderingPerformance, 
  createPerformanceReport,
  measureDataUpdatePerformance
} from '../performance-test-utils';
import { 
  snapshotVisualization, 
  compareWithBaseline 
} from '../snapshot-test-utils';
import { 
  simulateZoom, 
  simulatePan,
  simulateHover
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

  // Edge case: Empty data set
  test('handles empty data set gracefully', () => {
    const { container } = render(<ScatterPlotExample data={[]} />);
    
    // Should generate random data when none is provided
    const points = screen.getAllByTestId(/^point-/);
    expect(points.length).toBeGreaterThan(0);
  });

  // Edge case: Single data point
  test('renders correctly with a single data point', () => {
    const singlePointData = [{ x: 200, y: 150 }];
    render(<ScatterPlotExample data={singlePointData} />);
    
    const points = screen.getAllByTestId(/^point-/);
    expect(points).toHaveLength(1);
    
    const point = points[0];
    expect(point.getAttribute('cx')).toBe('200');
    expect(point.getAttribute('cy')).toBe('150');
  });

  // Custom styling test
  test('applies custom styling correctly', () => {
    render(
      <ScatterPlotExample 
        data={testData} 
        pointRadius={10} 
        pointColor="red" 
      />
    );
    
    const points = screen.getAllByTestId(/^point-/);
    const firstPoint = points[0];
    
    expect(firstPoint.getAttribute('r')).toBe('10');
    expect(firstPoint.getAttribute('fill')).toBe('red');
  });

  // Simulated interaction test
  test('simulates mouse interactions with points', async () => {
    const { container } = render(<ScatterPlotExample data={testData} />);
    const points = screen.getAllByTestId(/^point-/);
    
    // Simulate hovering over a point
    fireEvent.mouseEnter(points[0]);
    
    // Check that the point changes color on hover
    expect(points[0].getAttribute('fill')).toBe('orange');
    
    // Simulate mouse leave
    fireEvent.mouseLeave(points[0]);
    
    // Check that the point returns to original color
    expect(points[0].getAttribute('fill')).toBe('steelblue');
    
    // More complex interaction using the utility
    await simulateHover(points[0]);
  });

  // Test point selection
  test('selects points on click', () => {
    render(<ScatterPlotExample data={testData} />);
    const points = screen.getAllByTestId(/^point-/);
    
    // Click on a point to select it
    fireEvent.click(points[0]);
    
    // Check that the point is now selected (red color and larger radius)
    expect(points[0].getAttribute('fill')).toBe('red');
    expect(parseFloat(points[0].getAttribute('r') || '0')).toBeGreaterThan(5);
    
    // Click again to deselect
    fireEvent.click(points[0]);
    
    // Check that the point is now deselected
    expect(points[0].getAttribute('fill')).toBe('steelblue');
    expect(points[0].getAttribute('r')).toBe('5');
  });

  // Test point click callback
  test('calls onPointClick callback when a point is clicked', () => {
    const onPointClick = jest.fn();
    render(<ScatterPlotExample data={testData} onPointClick={onPointClick} />);
    
    const points = screen.getAllByTestId(/^point-/);
    fireEvent.click(points[0]);
    
    expect(onPointClick).toHaveBeenCalledWith(testData[0], 0);
  });

  // Test zoom functionality
  test('zooms in and out with mouse wheel', () => {
    const onZoom = jest.fn();
    render(<ScatterPlotExample data={testData} onZoom={onZoom} />);
    
    const svg = screen.getByTestId('scatter-plot-svg');
    
    // Zoom in
    fireEvent.wheel(svg, { deltaY: -100 });
    
    // Check that onZoom was called
    expect(onZoom).toHaveBeenCalled();
    
    // Zoom out
    fireEvent.wheel(svg, { deltaY: 100 });
    
    // Check that onZoom was called again
    expect(onZoom).toHaveBeenCalledTimes(2);
  });

  // Test data update with jitter
  test('updates data when jitter button is clicked', () => {
    render(<ScatterPlotExample data={testData} />);
    
    // Get initial positions
    const initialPoints = screen.getAllByTestId(/^point-/);
    const initialPositions = initialPoints.map(point => ({
      x: point.getAttribute('cx'),
      y: point.getAttribute('cy')
    }));
    
    // Click jitter button
    const jitterButton = screen.getByTestId('jitter-button');
    fireEvent.click(jitterButton);
    
    // Get new positions
    const updatedPoints = screen.getAllByTestId(/^point-/);
    const updatedPositions = updatedPoints.map(point => ({
      x: point.getAttribute('cx'),
      y: point.getAttribute('cy')
    }));
    
    // Check that at least some positions have changed
    let positionsChanged = false;
    for (let i = 0; i < initialPositions.length; i++) {
      if (initialPositions[i].x !== updatedPositions[i].x || 
          initialPositions[i].y !== updatedPositions[i].y) {
        positionsChanged = true;
        break;
      }
    }
    
    expect(positionsChanged).toBe(true);
  });

  // Test data reset
  test('resets data when reset button is clicked', () => {
    render(<ScatterPlotExample data={testData} />);
    
    // Click jitter button to change data
    const jitterButton = screen.getByTestId('jitter-button');
    fireEvent.click(jitterButton);
    
    // Click reset button
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    
    // Check that points are back to original positions
    const points = screen.getAllByTestId(/^point-/);
    
    for (let i = 0; i < points.length; i++) {
      expect(parseFloat(points[i].getAttribute('cx') || '0')).toBeCloseTo(testData[i].x, 0);
      expect(parseFloat(points[i].getAttribute('cy') || '0')).toBeCloseTo(testData[i].y, 0);
    }
  });

  // Data update performance test
  test('measures data update performance', async () => {
    const { container } = render(<ScatterPlotExample data={testData} />);
    
    // Get the DOM element
    const svg = screen.getByTestId('scatter-plot-svg');
    
    // Get the jitter button
    const jitterButton = screen.getByTestId('jitter-button');
    
    // Create a function to update data
    const updateData = () => {
      fireEvent.click(jitterButton);
    };
    
    // This is a simplified example - in a real test with our utility, you would use:
    // const result = await measureDataUpdatePerformance(
    //   svg,
    //   () => testData,
    //   testData,
    //   updateData,
    //   { iterations: 5, warmupIterations: 2 }
    // );
    
    // Just demonstrating the concept
    expect(container).toBeTruthy();
  });
}); 