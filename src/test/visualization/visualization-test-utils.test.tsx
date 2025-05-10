/**
 * Tests for Visualization Testing Utilities
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderVisualization, verifyDataPoints, verifyDataPoint } from './visualization-test-utils';

// Simple test visualization component
interface TestVisualizationProps {
  data: Array<{ x: number; y: number; value: string | number }>;
}

const TestVisualization: React.FC<TestVisualizationProps> = ({ data }) => {
  return (
    <div data-testid="visualization-container">
      <svg width="200" height="200">
        <g data-testid="x-axis">
          <line x1="0" y1="100" x2="200" y2="100" stroke="black" />
        </g>
        <g data-testid="y-axis">
          <line x1="100" y1="0" x2="100" y2="200" stroke="black" />
        </g>
        {data.map((point, index) => (
          <circle
            key={index}
            data-testid="data-point"
            data-x={point.x}
            data-y={point.y}
            data-value={point.value}
            cx={100 + point.x * 10}
            cy={100 - point.y * 10}
            r="5"
            fill="blue"
          />
        ))}
      </svg>
      <div data-testid="legend">
        <div data-testid="legend-item">Item 1</div>
        <div data-testid="legend-item">Item 2</div>
      </div>
    </div>
  );
};

describe('Visualization Testing Utilities', () => {
  const testData = [
    { x: 1, y: 2, value: 'A' },
    { x: 3, y: 4, value: 'B' },
    { x: 5, y: 6, value: 'C' }
  ];

  describe('renderVisualization', () => {
    it('should render a visualization component with test utilities', () => {
      const { getDataPoints, getXAxis, getYAxis, getLegend, getLegendItems } = renderVisualization(
        TestVisualization,
        { data: testData }
      );

      // Check that the visualization was rendered
      expect(screen.getByTestId('visualization-container')).toBeInTheDocument();

      // Check that the test utilities work
      expect(getDataPoints()).toHaveLength(3);
      expect(getXAxis()).toBeInTheDocument();
      expect(getYAxis()).toBeInTheDocument();
      expect(getLegend()).toBeInTheDocument();
      expect(getLegendItems()).toHaveLength(2);
    });

    it('should get data points by value', () => {
      const { getDataPointByValue } = renderVisualization(
        TestVisualization,
        { data: testData }
      );

      // Check that we can get data points by value
      const pointA = getDataPointByValue('A');
      expect(pointA).toBeInTheDocument();
      expect(pointA).toHaveAttribute('data-x', '1');
      expect(pointA).toHaveAttribute('data-y', '2');

      const pointB = getDataPointByValue('B');
      expect(pointB).toBeInTheDocument();
      expect(pointB).toHaveAttribute('data-x', '3');
      expect(pointB).toHaveAttribute('data-y', '4');
    });

    it('should get data points by index', () => {
      const { getDataPointByIndex } = renderVisualization(
        TestVisualization,
        { data: testData }
      );

      // Check that we can get data points by index
      const point0 = getDataPointByIndex(0);
      expect(point0).toBeInTheDocument();
      expect(point0).toHaveAttribute('data-x', '1');
      expect(point0).toHaveAttribute('data-y', '2');

      const point1 = getDataPointByIndex(1);
      expect(point1).toBeInTheDocument();
      expect(point1).toHaveAttribute('data-x', '3');
      expect(point1).toHaveAttribute('data-y', '4');
    });
  });

  describe('verifyDataPoints', () => {
    it('should verify data points based on the provided dataset', () => {
      const { container } = render(<TestVisualization data={testData} />);

      // This should not throw an error
      verifyDataPoints(container, testData, {
        xAccessor: item => item.x,
        yAccessor: item => item.y
      });
    });

    it('should throw an error if data points do not match', () => {
      const { container } = render(<TestVisualization data={testData} />);

      // This should throw an error because the x values are wrong
      expect(() => {
        verifyDataPoints(container, testData, {
          xAccessor: item => item.x + 1, // Incorrect accessor
          yAccessor: item => item.y
        });
      }).toThrow();
    });
  });

  describe('verifyDataPoint', () => {
    it('should verify a specific data point', () => {
      const { getDataPointByIndex } = renderVisualization(
        TestVisualization,
        { data: testData }
      );

      const point = getDataPointByIndex(0);
      
      // This should not throw an error
      verifyDataPoint(point!, 'A', { attribute: 'data-value' });
    });

    it('should throw an error if the data point does not match', () => {
      const { getDataPointByIndex } = renderVisualization(
        TestVisualization,
        { data: testData }
      );

      const point = getDataPointByIndex(0);
      
      // This should throw an error because the value is wrong
      expect(() => {
        verifyDataPoint(point!, 'X', { attribute: 'data-value' });
      }).toThrow();
    });
  });
}); 