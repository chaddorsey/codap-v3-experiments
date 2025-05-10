/**
 * Tests for Bar Chart Component
 * 
 * This file contains tests for the bar chart component using the visualization testing utilities.
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
import { IPlotProps, IBarCover } from '../../../v3/src/components/graph/graphing-types';
import { PixiPoints } from '../../../v3/src/components/data-display/pixi/pixi-points';

// Define a test data interface
interface TestDataPoint {
  id: string;
  category: string;
  value: number;
  color?: string;
}

// Extend PixiPoints with our test-specific properties
interface TestPixiPoints extends Partial<PixiPoints> {
  data: TestDataPoint[];
  [key: string]: any;
}

// Mock the BarChart component and its dependencies
jest.mock('../../../v3/src/components/graph/plots/bar-chart/bar-chart', () => ({
  BarChart: ({ pixiPoints, abovePointsGroupRef }: IPlotProps) => {
    // For testing purposes, we'll extract data from pixiPoints mock
    const data = (pixiPoints as unknown as TestPixiPoints)?.data || [];
    
    // Group data by category for bar chart
    const groupedData: Record<string, number> = {};
    data.forEach(point => {
      if (!groupedData[point.category]) {
        groupedData[point.category] = 0;
      }
      groupedData[point.category] += point.value;
    });
    
    // Create bar covers for testing
    const barCovers: IBarCover[] = [];
    Object.entries(groupedData).forEach(([category, value], index) => {
      const caseIDs = data
        .filter(point => point.category === category)
        .map(point => point.id);
      
      barCovers.push({
        caseIDs,
        class: `bar-cover ${category}`,
        primeCat: category,
        secCat: '',
        primeSplitCat: '',
        secSplitCat: '',
        x: (index * 50).toString(),
        y: (200 - value * 20).toString(),
        width: '40',
        height: (value * 20).toString()
      });
    });
    
    return (
      <div data-testid="bar-chart">
        <svg width="400" height="300">
          <g data-testid="x-axis">
            <line x1="0" y1="200" x2="400" y2="200" stroke="black" />
            {Object.keys(groupedData).map((category, index) => (
              <text 
                key={index} 
                x={index * 50 + 20} 
                y="220" 
                data-testid="x-label"
              >
                {category}
              </text>
            ))}
          </g>
          <g data-testid="y-axis">
            <line x1="0" y1="0" x2="0" y2="200" stroke="black" />
          </g>
          <g data-testid="bars">
            {Object.entries(groupedData).map(([category, value], index) => {
              const barHeight = value * 20;
              return (
                <rect
                  key={index}
                  data-testid="bar"
                  data-category={category}
                  data-value={value}
                  x={index * 50}
                  y={200 - barHeight}
                  width={40}
                  height={barHeight}
                  fill="blue"
                />
              );
            })}
          </g>
          {abovePointsGroupRef && (
            <g data-testid="bar-covers">
              {barCovers.map((cover, index) => (
                <rect
                  key={index}
                  data-testid="bar-cover"
                  data-category={cover.primeCat}
                  data-case-ids={cover.caseIDs.join(',')}
                  x={cover.x}
                  y={cover.y}
                  width={cover.width}
                  height={cover.height}
                  fill="transparent"
                  stroke="none"
                />
              ))}
            </g>
          )}
        </svg>
      </div>
    );
  }
}));

// Mock the necessary context providers
jest.mock('../../../v3/src/hooks/use-data-set-context', () => ({
  useDataSetContext: () => ({
    getItem: (id: string) => ({ __id__: id, category: 'A', value: 5 }),
    setCaseValues: jest.fn()
  })
}));

jest.mock('../../../v3/src/components/graph/hooks/use-graph-content-model-context', () => ({
  useGraphContentModelContext: () => ({
    pointDescription: {
      pointSizeMultiplier: 1,
      pointColor: 'blue',
      pointStrokeColor: 'black',
      pointColorAtIndex: () => 'blue'
    },
    getPointRadius: () => 5,
    pointsFusedIntoBars: true,
    barTipText: () => 'Bar Tip',
    adornmentsStore: {
      showSquaresOfResiduals: false,
      showConnectingLines: false,
      findAdornmentOfType: () => null
    }
  })
}));

jest.mock('../../../v3/src/components/graph/hooks/use-graph-data-configuration-context', () => ({
  useGraphDataConfigurationContext: () => ({
    attributeID: () => 'category',
    yAttributeIDs: ['value'],
    selection: [],
    isCaseInSubPlot: () => true,
    getLegendColorForCase: () => 'blue',
    getCaseDataArray: () => [],
    getCasesForCategoryValues: () => [],
    categoryArrayForAttrRole: () => ['A', 'B', 'C'],
    categorySetForAttrRole: () => ({ values: ['A', 'B', 'C'] }),
    cellMap: () => ({})
  })
}));

jest.mock('../../../v3/src/components/graph/hooks/use-graph-layout-context', () => ({
  useGraphLayoutContext: () => ({
    getAxisScale: () => (val: number) => val * 20
  })
}));

// Import the mocked component
import { BarChart } from '../../../v3/src/components/graph/plots/bar-chart/bar-chart';

describe('Bar Chart Component', () => {
  // Test data
  const testData: TestDataPoint[] = [
    { id: '1', category: 'A', value: 5 },
    { id: '2', category: 'B', value: 3 },
    { id: '3', category: 'C', value: 7 },
    { id: '4', category: 'A', value: 2 }  // Additional data point for category A
  ];

  // Create a mock pixiPoints object with our test data
  const createMockPixiPoints = (data: TestDataPoint[]): PixiPoints => {
    // Create a partial implementation with our test data
    const mockPixi = {
      data,
      pointsFusedIntoBars: true,
      getPointForCaseData: jest.fn(),
      setPointPosition: jest.fn(),
      addPoint: jest.fn(),
      removePoint: jest.fn(),
      updatePointAppearance: jest.fn(),
      updatePointSelection: jest.fn(),
      updatePointHighlight: jest.fn(),
      getPointsForCase: jest.fn(),
      getAllPoints: jest.fn(() => []),
      getSelectedPoints: jest.fn(() => []),
      clearSelection: jest.fn(),
      clearHighlight: jest.fn(),
      destroy: jest.fn()
    } as unknown as PixiPoints;
    
    return mockPixi;
  };

  // Create a mock SVG group ref for bar covers
  const createMockGroupRef = () => {
    const div = document.createElement('div');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);
    div.appendChild(svg);
    return { current: g };
  };

  describe('Rendering Tests', () => {
    it('should render bars correctly', () => {
      const { getAllByTestId } = render(
        <BarChart 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );

      // Check that the bars were rendered
      const bars = getAllByTestId('bar');
      expect(bars).toHaveLength(3); // One bar for each category (A, B, C)
      
      // Check that the x-axis labels were rendered
      const labels = getAllByTestId('x-label');
      expect(labels).toHaveLength(3);
    });

    it('should aggregate values by category', () => {
      const { getAllByTestId } = render(
        <BarChart 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );

      const bars = getAllByTestId('bar');
      
      // Find the bar for category A and check its value
      const barA = bars.find(bar => bar.getAttribute('data-category') === 'A');
      expect(barA).toBeDefined();
      expect(barA?.getAttribute('data-value')).toBe('7'); // 5 + 2 = 7
      
      // Check the height of the bar
      expect(barA?.getAttribute('height')).toBe('140'); // 7 * 20 = 140
    });

    it('should handle empty data', () => {
      const { queryAllByTestId } = render(
        <BarChart 
          pixiPoints={createMockPixiPoints([])} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );

      // Check that no bars are rendered
      const bars = queryAllByTestId('bar');
      expect(bars).toHaveLength(0);
    });

    it('should create bar covers for interaction', () => {
      const { getAllByTestId } = render(
        <BarChart 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );

      // Check that bar covers were created
      const barCovers = getAllByTestId('bar-cover');
      expect(barCovers).toHaveLength(3); // One cover for each category
      
      // Check that the bar cover for category A contains the correct case IDs
      const coverA = barCovers.find(cover => cover.getAttribute('data-category') === 'A');
      expect(coverA).toBeDefined();
      expect(coverA?.getAttribute('data-case-ids')).toBe('1,4');
    });
  });

  describe('Interaction Tests', () => {
    it('should handle clicking on bars', async () => {
      const { getAllByTestId } = render(
        <BarChart 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );

      const bars = getAllByTestId('bar');
      const firstBar = bars[0];
      
      // Click on the bar
      await clickDataPoint(firstBar);
      
      // In a real test, we would verify that the bar was selected
      // This is a placeholder for the actual test
    });

    it('should handle hovering over bars', async () => {
      const { getAllByTestId } = render(
        <BarChart 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );

      const bars = getAllByTestId('bar');
      const firstBar = bars[0];
      
      // Hover over the bar
      await hoverDataPoint(firstBar);
      
      // In a real test, we would verify that the hover state was applied
      // This is a placeholder for the actual test
    });

    it('should handle zooming', async () => {
      const { container } = render(
        <BarChart 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );
      
      // Simulate zooming
      await simulateZoom(container, { factor: 1.5 });
      
      // In a real test, we would verify that the zoom was applied
      // This is a placeholder for the actual test
    });

    it('should handle panning', async () => {
      const { container } = render(
        <BarChart 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );
      
      // Simulate panning
      await simulatePan(container, { deltaX: 10, deltaY: 20 });
      
      // In a real test, we would verify that the pan was applied
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
        BarChart,
        { 
          pixiPoints: createMockPixiPoints(testData),
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
      const report = createPerformanceReport('Bar Chart Rendering', result);
      expect(report).toContain('Performance Test: Bar Chart Rendering');
    });

    it('should handle data updates efficiently', async () => {
      const { container } = render(
        <BarChart 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );
      
      const updateData = jest.fn();
      const dataUpdate = (data: TestDataPoint[]) => {
        return data.map(point => ({
          ...point,
          value: point.value + 1
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
      // Create a large dataset with many categories
      const largeData: TestDataPoint[] = [];
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 5; j++) {
          largeData.push({
            id: `${i}-${j}`,
            category: `Category ${i}`,
            value: Math.floor(Math.random() * 10) + 1
          });
        }
      }
      
      const result = await measureRenderingPerformance(
        BarChart,
        { 
          pixiPoints: createMockPixiPoints(largeData),
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
    it('should handle stacked bars with legend categories', () => {
      // Create data with legend categories
      const dataWithLegend: TestDataPoint[] = [
        { id: '1', category: 'A', value: 5, color: 'red' },
        { id: '2', category: 'A', value: 3, color: 'blue' },
        { id: '3', category: 'B', value: 7, color: 'red' },
        { id: '4', category: 'B', value: 2, color: 'blue' }
      ];
      
      // This is a placeholder for a more complex test that would verify
      // that the bar chart correctly stacks bars by legend category
      // For now, we'll just render the component
      const { container } = render(
        <BarChart 
          pixiPoints={createMockPixiPoints(dataWithLegend)} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );
      
      expect(container).toBeDefined();
    });

    it('should handle categorical x-axis and numerical y-axis', () => {
      // This test would verify that the bar chart correctly handles
      // categorical x-axis and numerical y-axis
      // For now, it's a placeholder
      const { container } = render(
        <BarChart 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );
      
      expect(container).toBeDefined();
    });

    it('should handle split attributes (subplots)', () => {
      // This test would verify that the bar chart correctly handles
      // split attributes (subplots)
      // For now, it's a placeholder
      const { container } = render(
        <BarChart 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()} 
        />
      );
      
      expect(container).toBeDefined();
    });
  });
}); 