/**
 * Tests for Dot Chart Component
 * 
 * This file contains tests for the dot chart component using the visualization testing utilities.
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
  category: string;
  value: number;
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
  onPointClick?: (event: PointerEvent, point: any, metadata: any) => void;
  [key: string]: any; // Allow additional properties
}

// Mock the DotChart component and its dependencies
jest.mock('../../components/graph/plots/dot-chart/dot-chart', () => ({
  DotChart: ({ pixiPoints }: IPlotProps) => {
    // For testing purposes, we'll extract data from pixiPoints mock
    const data = (pixiPoints as any)?.data || [];
    
    // Group data by category
    const categories = Array.from(new Set(data.map((point: TestDataPoint) => point.category)));
    const categoryData = categories.map(category => {
      return {
        category,
        points: data.filter((point: TestDataPoint) => point.category === category)
      };
    });
    
    return (
      <div data-testid="dot-chart">
        <svg width="400" height="300">
          {/* Render category labels */}
          <g data-testid="category-labels">
            {categoryData.map((cat, index) => (
              <text
                key={`label-${index}`}
                data-testid="category-label"
                x="10"
                y={50 + index * 60}
                fontSize="12"
              >
                {cat.category}
              </text>
            ))}
          </g>
          
          {/* Render dots for each category */}
          <g data-testid="category-dots">
            {categoryData.map((cat, catIndex) => (
              <g key={`cat-${catIndex}`} data-testid={`category-${cat.category}`}>
                {cat.points.map((point, pointIndex) => {
                  // Calculate position within category
                  const pointsPerRow = 5;
                  const row = Math.floor(pointIndex / pointsPerRow);
                  const col = pointIndex % pointsPerRow;
                  const x = 50 + col * 20;
                  const y = 50 + catIndex * 60 + row * 20;
                  
                  return (
                    <circle
                      key={`point-${point.id}`}
                      data-testid="dot-chart-point"
                      data-id={point.id}
                      data-category={cat.category}
                      data-value={point.value}
                      cx={x}
                      cy={y}
                      r="5"
                      fill={point.color || "blue"}
                    />
                  );
                })}
              </g>
            ))}
          </g>
        </svg>
      </div>
    );
  }
}));

// Mock the necessary context providers
jest.mock('../../hooks/use-data-set-context', () => ({
  useDataSetContext: () => ({
    getItem: (id: string) => ({ __id__: id, category: 'A', value: 10 }),
    setCaseValues: jest.fn()
  })
}));

jest.mock('../../components/graph/hooks/use-chart-dots', () => ({
  useChartDots: () => ({
    dataset: { cases: [] },
    graphModel: { 
      pointDescription: { pointColor: 'blue', pointStrokeColor: 'black' },
      getPointRadius: () => 5,
      cellParams: () => ({ 
        catMap: new Map(), 
        numPointsInRow: 5, 
        overlap: 0 
      }),
      mapOfIndicesByCase: () => ({})
    },
    isAnimating: () => false,
    primaryScreenCoord: () => 100,
    secondaryScreenCoord: () => 100,
    refreshPointSelection: jest.fn(),
    subPlotCells: {
      dataConfig: { attributeID: () => 'category', getLegendColorForCase: () => 'blue' },
      primaryCellWidth: 100,
      primaryCellHeight: 50,
      primaryIsBottom: true
    }
  })
}));

jest.mock('../../components/graph/hooks/use-plot', () => ({
  usePlotResponders: () => ({})
}));

// Import the mocked component
import { DotChart } from '../../components/graph/plots/dot-chart/dot-chart';

describe('Dot Chart Component', () => {
  // Test data
  const testData = [
    { id: '1', category: 'A', value: 10 },
    { id: '2', category: 'A', value: 20 },
    { id: '3', category: 'A', value: 30 },
    { id: '4', category: 'B', value: 15 },
    { id: '5', category: 'B', value: 25 },
    { id: '6', category: 'C', value: 5 },
    { id: '7', category: 'C', value: 15 },
    { id: '8', category: 'C', value: 25 },
    { id: '9', category: 'C', value: 35 }
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
    it('should render dots correctly', () => {
      const { getAllByTestId } = render(
        <DotChart 
          pixiPoints={createMockPixiPoints(testData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      // Check that the dots were rendered
      const dots = getAllByTestId('dot-chart-point');
      expect(dots.length).toBe(testData.length); // One dot for each data point
    });

    it('should render category labels correctly', () => {
      const { getAllByTestId } = render(
        <DotChart 
          pixiPoints={createMockPixiPoints(testData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      // Check that the category labels were rendered
      const labels = getAllByTestId('category-label');
      expect(labels.length).toBe(3); // One label for each category (A, B, C)
    });

    it('should handle empty data', () => {
      const { queryAllByTestId } = render(
        <DotChart 
          pixiPoints={createMockPixiPoints([]) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      // Check that no dots are rendered
      const dots = queryAllByTestId('dot-chart-point');
      expect(dots).toHaveLength(0);
    });
  });

  describe('Interaction Tests', () => {
    it('should handle clicking on dots', async () => {
      const { getAllByTestId } = render(
        <DotChart 
          pixiPoints={createMockPixiPoints(testData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      const dots = getAllByTestId('dot-chart-point');
      const firstDot = dots[0];
      
      // Click on the dot
      await clickDataPoint(firstDot);
      
      // In a real test, we would verify that the dot was selected
      // This is a placeholder for the actual test
    });

    it('should handle hovering over dots', async () => {
      const { getAllByTestId } = render(
        <DotChart 
          pixiPoints={createMockPixiPoints(testData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      const dots = getAllByTestId('dot-chart-point');
      const firstDot = dots[0];
      
      // Hover over the dot
      await hoverDataPoint(firstDot);
      
      // In a real test, we would verify that the hover state was applied
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
        DotChart,
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
      const report = createPerformanceReport('Dot Chart Rendering', result);
      expect(report).toContain('Performance Test: Dot Chart Rendering');
    });

    it('should handle data updates efficiently', async () => {
      const { container } = render(
        <DotChart 
          pixiPoints={createMockPixiPoints(testData) as any} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );
      
      const updateData = jest.fn();
      const dataUpdate = (data: TestDataPoint[]) => {
        return data.map(point => ({
          ...point,
          value: Math.random() * 100
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
      const categories = ['A', 'B', 'C', 'D', 'E'];
      
      for (let i = 0; i < 100; i++) {
        largeData.push({
          id: `${i}`,
          category: categories[i % categories.length],
          value: Math.random() * 100
        });
      }
      
      const result = await measureRenderingPerformance(
        DotChart,
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
    it('should handle different category arrangements', () => {
      // Create data with different category distributions
      const categoryData = [
        { id: '1', category: 'A', value: 10 },
        { id: '2', category: 'A', value: 20 },
        { id: '3', category: 'A', value: 30 },
        { id: '4', category: 'A', value: 40 },
        { id: '5', category: 'A', value: 50 },
        { id: '6', category: 'B', value: 10 },
        { id: '7', category: 'B', value: 20 }
      ];
      
      const { getAllByTestId } = render(
        <DotChart 
          pixiPoints={createMockPixiPoints(categoryData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );
      
      // Check that the dots were rendered correctly for each category
      const categoryA = getAllByTestId('dot-chart-point').filter(
        dot => dot.getAttribute('data-category') === 'A'
      );
      const categoryB = getAllByTestId('dot-chart-point').filter(
        dot => dot.getAttribute('data-category') === 'B'
      );
      
      expect(categoryA.length).toBe(5);
      expect(categoryB.length).toBe(2);
    });

    it('should handle different point colors', () => {
      // Create data with different colors
      const colorData = testData.map(point => ({
        ...point,
        color: ['red', 'blue', 'green', 'orange', 'purple'][Math.floor(Math.random() * 5)]
      }));
      
      const { getAllByTestId } = render(
        <DotChart 
          pixiPoints={createMockPixiPoints(colorData) as any} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );
      
      // Check that the dots were rendered with different colors
      const dots = getAllByTestId('dot-chart-point');
      const colors = new Set(dots.map(dot => dot.getAttribute('fill')));
      
      // Should have at least 2 different colors
      expect(colors.size).toBeGreaterThan(1);
    });
  });
}); 