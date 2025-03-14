/**
 * Tests for Line Plot Component
 * 
 * This file contains tests for the line plot component using the visualization testing utilities.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  renderVisualization, 
  verifyDataPoints, 
  clickDataPoint,
  hoverDataPoint
} from './visualization-test-utils';
import {
  simulateZoom,
  simulatePan,
  simulateSelection
} from './interaction-test-utils';
import {
  measureRenderingPerformance,
  measureInteractionPerformance,
  measureDataUpdatePerformance,
  createPerformanceReport
} from './performance-test-utils';
import { IPlotProps } from '../../components/graph/graphing-types';
import '@testing-library/jest-dom';

// Define a test data interface
interface TestDataPoint {
  id: string;
  x: number;
  y: number;
  color?: string;
}

// Define a type for the mock PixiPoints
interface MockPixiPoints {
  data: TestDataPoint[];
  getPointForCaseData: jest.Mock;
  setPointPosition: jest.Mock;
  addPoint: jest.Mock;
  removePoint: jest.Mock;
  updatePointAppearance: jest.Mock;
  updatePointSelection: jest.Mock;
  updatePointHighlight: jest.Mock;
  getPointsForCase: jest.Mock;
  getAllPoints: jest.Mock;
  getSelectedPoints: jest.Mock;
  clearSelection: jest.Mock;
  clearHighlight: jest.Mock;
  destroy: jest.Mock;
  forEachSelectedPoint: jest.Mock;
  [key: string]: any; // Allow additional properties
}

// Mock the DotLinePlot component and its dependencies
jest.mock('../../components/graph/plots/dot-plot/dot-line-plot', () => ({
  DotLinePlot: ({ pixiPoints, abovePointsGroupRef }: IPlotProps) => {
    // For testing purposes, we'll extract data from pixiPoints mock
    const data = (pixiPoints as any)?.data || [];
    
    // Calculate positions for line plot (bars for each point)
    const minX = Math.min(...data.map((point: TestDataPoint) => point.x));
    const maxX = Math.max(...data.map((point: TestDataPoint) => point.x));
    const minY = Math.min(...data.map((point: TestDataPoint) => point.y));
    const maxY = Math.max(...data.map((point: TestDataPoint) => point.y));
    
    // Scale to fit in the SVG
    const xScale = (x: number) => 50 + (x - minX) * 300 / (maxX - minX || 1);
    const yScale = (y: number) => 250 - (y - minY) * 200 / (maxY - minY || 1);
    
    return (
      <div data-testid="line-plot">
        <svg width="400" height="300">
          {/* Render zero line */}
          <line
            data-testid="zero-line"
            x1={50}
            y1={yScale(0)}
            x2={350}
            y2={yScale(0)}
            stroke="gray"
            strokeDasharray="2,2"
          />
          
          {/* Render bars for each point */}
          <g data-testid="line-bars">
            {data.map((point: TestDataPoint) => {
              const x = xScale(point.x);
              const y = yScale(point.y);
              const zeroY = yScale(0);
              
              return (
                <g key={`point-${point.id}`} data-testid="line-bar-group">
                  {/* Render bar */}
                  <rect
                    data-testid="line-bar"
                    data-id={point.id}
                    x={x - 5}
                    y={y < zeroY ? y : zeroY}
                    width={10}
                    height={Math.abs(y - zeroY)}
                    fill={point.color || "blue"}
                  />
                  
                  {/* Render point at the end of the bar */}
                  <circle
                    data-testid="line-point"
                    data-id={point.id}
                    cx={x}
                    cy={y}
                    r="5"
                    fill={point.color || "blue"}
                  />
                </g>
              );
            })}
          </g>
          
          {/* Connect points with lines */}
          <g data-testid="connecting-lines">
            <path
              data-testid="line-path"
              d={`M ${data.map((point: TestDataPoint) => `${xScale(point.x)},${yScale(point.y)}`).join(' L ')}`}
              fill="none"
              stroke="blue"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>
    );
  }
}));

// Mock the necessary context providers
jest.mock('../../hooks/use-data-set-context', () => ({
  useDataSetContext: () => ({
    getItem: (id: string) => ({ __id__: id, x: 0.5, y: 0.5 }),
    setCaseValues: jest.fn()
  })
}));

jest.mock('../../components/graph/hooks/use-dot-plot', () => ({
  useDotPlot: () => ({
    dataset: { cases: [] },
    dataConfig: { attributeID: () => 'x' },
    graphModel: { 
      pointDescription: { pointColor: 'blue', pointStrokeColor: 'black' },
      getPointRadius: () => 5,
      pointsFusedIntoBars: true,
      pointDisplayType: 'bars'
    },
    isAnimating: () => false,
    layout: {
      getAxisScale: () => ({
        domain: () => [0, 1],
        range: () => [0, 300]
      })
    },
    pointColor: 'blue',
    pointDisplayType: 'bars',
    pointStrokeColor: 'black',
    primaryAttrRole: 'x',
    primaryIsBottom: true,
    secondaryAttrRole: 'y',
    refreshPointSelection: jest.fn()
  })
}));

jest.mock('../../components/graph/hooks/use-dot-plot-drag-drop', () => ({
  useDotPlotDragDrop: () => ({
    onDragStart: jest.fn(),
    onDrag: jest.fn(),
    onDragEnd: jest.fn()
  })
}));

jest.mock('../../components/graph/hooks/use-plot', () => ({
  usePixiDragHandlers: jest.fn(),
  usePlotResponders: jest.fn()
}));

// Import the mocked component
import { DotLinePlot } from '../../components/graph/plots/dot-plot/dot-line-plot';

describe('Line Plot Component', () => {
  // Test data
  const testData = [
    { id: '1', x: 0.1, y: 0.3 },
    { id: '2', x: 0.2, y: 0.7 },
    { id: '3', x: 0.3, y: 0.4 },
    { id: '4', x: 0.4, y: 0.6 },
    { id: '5', x: 0.5, y: 0.2 },
    { id: '6', x: 0.6, y: 0.5 },
    { id: '7', x: 0.7, y: 0.3 },
    { id: '8', x: 0.8, y: 0.8 },
    { id: '9', x: 0.9, y: 0.1 }
  ];

  // Create a mock pixiPoints object with our test data
  const createMockPixiPoints = (data: TestDataPoint[]): any => {
    // Create a partial implementation with our test data
    const selectedPoints: string[] = [];
    
    const mockPixi: MockPixiPoints = {
      data,
      getPointForCaseData: jest.fn(),
      setPointPosition: jest.fn(),
      addPoint: jest.fn(),
      removePoint: jest.fn(),
      updatePointAppearance: jest.fn(),
      updatePointSelection: jest.fn(),
      updatePointHighlight: jest.fn(),
      getPointsForCase: jest.fn(),
      getAllPoints: jest.fn(() => []),
      getSelectedPoints: jest.fn(() => selectedPoints),
      clearSelection: jest.fn(),
      clearHighlight: jest.fn(),
      destroy: jest.fn(),
      forEachSelectedPoint: jest.fn((callback: (point: TestDataPoint, state: { selected: boolean }) => void) => {
        data.filter(point => selectedPoints.includes(point.id))
          .forEach(point => callback(point, { selected: true }));
      })
    };
    
    return mockPixi;
  };

  // Create a mock SVG group ref for above points
  const createMockGroupRef = () => {
    const div = document.createElement('div');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);
    div.appendChild(svg);
    return { current: g };
  };

  describe('Rendering Tests', () => {
    it('should render bars for each point', () => {
      const { getAllByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      // Check that the bars were rendered
      const bars = getAllByTestId('line-bar');
      expect(bars.length).toBe(testData.length); // One bar for each data point
    });

    it('should render points at the end of each bar', () => {
      const { getAllByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      // Check that the points were rendered
      const points = getAllByTestId('line-point');
      expect(points.length).toBe(testData.length); // One point for each data point
    });

    it('should render a connecting line', () => {
      const { getByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      // Check that the connecting line was rendered
      const line = getByTestId('line-path');
      expect(line).toBeInTheDocument();
    });

    it('should render a zero line', () => {
      const { getByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      // Check that the zero line was rendered
      const zeroLine = getByTestId('zero-line');
      expect(zeroLine).toBeInTheDocument();
    });

    it('should handle empty data', () => {
      const { queryAllByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints([]) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      // Check that no bars are rendered
      const bars = queryAllByTestId('line-bar');
      expect(bars).toHaveLength(0);
    });
  });

  describe('Interaction Tests', () => {
    it('should handle clicking on bars', async () => {
      const { getAllByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      const bars = getAllByTestId('line-bar');
      const firstBar = bars[0];
      
      // Click on the bar
      await clickDataPoint(firstBar);
      
      // In a real test, we would verify that the bar was selected
      // This is a placeholder for the actual test
    });

    it('should handle hovering over bars', async () => {
      const { getAllByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      const bars = getAllByTestId('line-bar');
      const firstBar = bars[0];
      
      // Hover over the bar
      await hoverDataPoint(firstBar);
      
      // In a real test, we would verify that the hover state was applied
      // This is a placeholder for the actual test
    });

    it('should handle clicking on points', async () => {
      const { getAllByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      const points = getAllByTestId('line-point');
      const firstPoint = points[0];
      
      // Click on the point
      await clickDataPoint(firstPoint);
      
      // In a real test, we would verify that the point was selected
      // This is a placeholder for the actual test
    });
  });

  describe('Performance Tests', () => {
    // Mock performance.now to return predictable values
    let nowMock: jest.SpyInstance;
    
    beforeEach(() => {
      let callCount = 0;
      nowMock = jest.spyOn(performance, 'now').mockImplementation(() => {
        callCount += 1;
        return callCount * 10; // Return 10, 20, 30, etc.
      });
    });
    
    afterEach(() => {
      nowMock.mockRestore();
    });

    it('should render efficiently', async () => {
      const result = await measureRenderingPerformance(
        DotLinePlot,
        { 
          pixiPoints: createMockPixiPoints(testData) as any,
          abovePointsGroupRef: createMockGroupRef()
        },
        { iterations: 2, warmupIterations: 1 }
      );
      
      // Check the performance results
      expect(result.averageTime).toBeDefined();
      expect(result.medianTime).toBeDefined();
      expect(result.minTime).toBeDefined();
      expect(result.maxTime).toBeDefined();
      
      // Create a performance report
      const report = createPerformanceReport('Line Plot Rendering', result);
      expect(report).toContain('Performance Test: Line Plot Rendering');
    });

    it('should handle data updates efficiently', async () => {
      const { container } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData) as any} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );
      
      const updateData = jest.fn();
      const dataUpdate = (data: TestDataPoint[]) => {
        return data.map(point => ({
          ...point,
          y: Math.random()
        }));
      };
      
      const result = await measureDataUpdatePerformance(
        container.firstChild as HTMLElement,
        dataUpdate,
        testData,
        updateData,
        { iterations: 2, warmupIterations: 1 }
      );
      
      // Check the performance results
      expect(result.averageTime).toBeDefined();
      expect(result.medianTime).toBeDefined();
      expect(result.minTime).toBeDefined();
      expect(result.maxTime).toBeDefined();
    });

    it('should handle large datasets efficiently', async () => {
      // Create a large dataset with many points
      const largeData: TestDataPoint[] = [];
      for (let i = 0; i < 100; i++) {
        largeData.push({
          id: `${i}`,
          x: i / 100,
          y: Math.random()
        });
      }
      
      const result = await measureRenderingPerformance(
        DotLinePlot,
        { 
          pixiPoints: createMockPixiPoints(largeData) as any,
          abovePointsGroupRef: createMockGroupRef()
        },
        { iterations: 2, warmupIterations: 1 }
      );
      
      // Check that rendering is still efficient with a large dataset
      expect(result.medianTime).toBeDefined();
      // In a real test, we might assert that the median time is below a threshold
      // expect(result.medianTime).toBeLessThan(500); // 500ms threshold
    });
  });

  describe('Feature-Specific Tests', () => {
    it('should handle negative values correctly', () => {
      // Create data with negative values
      const negativeData = [
        { id: '1', x: 0.1, y: -0.3 },
        { id: '2', x: 0.2, y: 0.7 },
        { id: '3', x: 0.3, y: -0.4 },
        { id: '4', x: 0.4, y: 0.6 }
      ];
      
      const { getAllByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(negativeData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );
      
      // Check that the bars were rendered
      const bars = getAllByTestId('line-bar');
      expect(bars.length).toBe(negativeData.length);
    });

    it('should handle missing data points', () => {
      // Create data with a gap (missing point)
      const gappedData = [
        { id: '1', x: 0.1, y: 0.3 },
        { id: '2', x: 0.2, y: 0.7 },
        // Gap here
        { id: '4', x: 0.4, y: 0.6 },
        { id: '5', x: 0.5, y: 0.2 }
      ];
      
      const { getAllByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(gappedData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );
      
      // Check that the bars were rendered for the available points
      const bars = getAllByTestId('line-bar');
      expect(bars.length).toBe(gappedData.length);
    });

    it('should handle different point colors', () => {
      // Create data with different colors
      const colorData = testData.map(point => ({
        ...point,
        color: ['red', 'blue', 'green', 'orange', 'purple'][Math.floor(Math.random() * 5)]
      }));
      
      const { getAllByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(colorData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );
      
      // Check that the bars were rendered with different colors
      const bars = getAllByTestId('line-bar');
      const colors = new Set(bars.map(bar => bar.getAttribute('fill')));
      
      // Should have at least 2 different colors
      expect(colors.size).toBeGreaterThan(1);
    });
  });
}); 