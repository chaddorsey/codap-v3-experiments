import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarChartExample } from './bar-chart-example';
import { 
  measureRenderingPerformance, 
  createPerformanceReport
} from '../performance-test-utils';
import { 
  snapshotVisualization
} from '../snapshot-test-utils';
import { 
  simulateHover
} from '../interaction-test-utils';
import { 
  renderVisualization,
  verifyDataPoints
} from '../visualization-test-utils';

describe('BarChartExample', () => {
  const testData = [
    { label: 'A', value: 20 },
    { label: 'B', value: 50 },
    { label: 'C', value: 30 },
    { label: 'D', value: 70 },
    { label: 'E', value: 40 }
  ];

  // Basic rendering test
  test('renders bar chart with correct number of bars', () => {
    render(<BarChartExample data={testData} />);
    
    // Check that all bars are rendered
    const bars = screen.getAllByTestId(/^bar-\d+$/);
    expect(bars).toHaveLength(testData.length);
    
    // Check that all labels are rendered
    const labels = screen.getAllByTestId(/^bar-label-/);
    expect(labels).toHaveLength(testData.length);
    
    // Check that all values are rendered
    const values = screen.getAllByTestId(/^bar-value-/);
    expect(values).toHaveLength(testData.length);
  });

  // Performance test
  test('measures rendering performance', async () => {
    const result = await measureRenderingPerformance(
      BarChartExample,
      { data: testData },
      { iterations: 5, warmupIterations: 2 }
    );
    
    // Log performance results
    console.log(createPerformanceReport('BarChart Rendering', result));
    
    // Basic performance assertion (adjust threshold as needed)
    expect(result.medianTime).toBeLessThan(100); // 100ms threshold
  });

  // Snapshot test
  test('captures and compares visualization snapshot', () => {
    const { container } = render(<BarChartExample data={testData} />);
    
    // Capture snapshot
    const snapshot = snapshotVisualization(container);
    
    // In a real test, you would compare with a reference snapshot
    // For this example, we'll just verify the snapshot is not empty
    expect(snapshot).toBeTruthy();
  });

  // Visualization test utilities
  test('uses visualization test utilities', () => {
    const { getDataPoints } = renderVisualization(
      BarChartExample,
      { data: testData },
      { dataPointSelector: '[data-testid^="bar-"]' }
    );
    
    const dataPoints = getDataPoints();
    expect(dataPoints).toHaveLength(testData.length);
  });

  // Data validation test
  test('validates bar heights correspond to data values', () => {
    render(<BarChartExample data={testData} width={400} height={300} />);
    
    const bars = screen.getAllByTestId(/^bar-\d+$/);
    const maxValue = Math.max(...testData.map(d => d.value));
    const innerHeight = 300 - 20 - 30; // height - margin.top - margin.bottom
    
    // Check that bar heights are proportional to values
    testData.forEach((item, index) => {
      const expectedHeight = (item.value / maxValue) * innerHeight;
      const actualHeight = parseFloat(bars[index].getAttribute('height') || '0');
      
      // Allow for small rounding differences
      expect(actualHeight).toBeCloseTo(expectedHeight, 0);
    });
  });

  // Interaction test - hover
  test('changes bar color on hover', async () => {
    render(<BarChartExample data={testData} />);
    const bars = screen.getAllByTestId(/^bar-\d+$/);
    
    // Check initial color
    expect(bars[0].getAttribute('fill')).toBe('steelblue');
    
    // Hover over bar
    fireEvent.mouseEnter(bars[0]);
    
    // Check hover color
    expect(bars[0].getAttribute('fill')).toBe('orange');
    
    // Mouse leave
    fireEvent.mouseLeave(bars[0]);
    
    // Check color returns to normal
    expect(bars[0].getAttribute('fill')).toBe('steelblue');
  });

  // Interaction test - click
  test('selects bar on click', () => {
    render(<BarChartExample data={testData} />);
    const bars = screen.getAllByTestId(/^bar-\d+$/);
    
    // Click on a bar
    fireEvent.click(bars[0]);
    
    // Check that the bar is selected (red color)
    expect(bars[0].getAttribute('fill')).toBe('red');
    
    // Click again to deselect
    fireEvent.click(bars[0]);
    
    // Check that the bar is deselected
    expect(bars[0].getAttribute('fill')).toBe('steelblue');
  });

  // Callback test
  test('calls onBarClick callback when a bar is clicked', () => {
    const onBarClick = jest.fn();
    render(<BarChartExample data={testData} onBarClick={onBarClick} />);
    
    const bars = screen.getAllByTestId(/^bar-\d+$/);
    fireEvent.click(bars[0]);
    
    expect(onBarClick).toHaveBeenCalledWith(testData[0], 0);
  });

  // Data update test - randomize
  test('updates data when randomize button is clicked', () => {
    render(<BarChartExample data={testData} />);
    
    // Get initial values
    const initialValues = screen.getAllByTestId(/^bar-value-/).map(el => el.textContent);
    
    // Click randomize button
    const randomizeButton = screen.getByTestId('randomize-button');
    fireEvent.click(randomizeButton);
    
    // Get new values
    const newValues = screen.getAllByTestId(/^bar-value-/).map(el => el.textContent);
    
    // Check that at least some values have changed
    expect(initialValues).not.toEqual(newValues);
  });

  // Data update test - sort
  test('sorts bars when sort button is clicked', () => {
    render(<BarChartExample data={testData} />);
    
    // Get initial values
    const initialValues = screen.getAllByTestId(/^bar-value-/).map(el => 
      parseInt(el.textContent || '0', 10)
    );
    
    // Click sort button
    const sortButton = screen.getByTestId('sort-button');
    fireEvent.click(sortButton);
    
    // Get new values
    const newValues = screen.getAllByTestId(/^bar-value-/).map(el => 
      parseInt(el.textContent || '0', 10)
    );
    
    // Check that values are sorted in descending order
    const sortedValues = [...initialValues].sort((a, b) => b - a);
    expect(newValues).toEqual(sortedValues);
  });

  // Edge case - empty data
  test('handles empty data by generating random data', () => {
    render(<BarChartExample data={[]} />);
    
    // Should generate random data
    const bars = screen.getAllByTestId(/^bar-\d+$/);
    expect(bars.length).toBeGreaterThan(0);
  });

  // Custom styling test
  test('applies custom styling correctly', () => {
    render(
      <BarChartExample 
        data={testData} 
        barColor="green" 
        barPadding={10}
      />
    );
    
    const bars = screen.getAllByTestId(/^bar-\d+$/);
    expect(bars[0].getAttribute('fill')).toBe('green');
  });
}); 