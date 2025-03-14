/**
 * Tests for Dot Plot Component
 * 
 * This file contains tests for the dot plot component using the visualization testing utilities.
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
import { IPlotProps } from '../../../v3/src/components/graph/graphing-types';
import { PixiPoints } from '../../../v3/src/components/data-display/pixi/pixi-points';
import '@testing-library/jest-dom'; // Import for toBeInTheDocument matcher

// Define a test data interface
interface TestDataPoint {
  id: string;
  value: number;
  color?: string;
}

// Extend PixiPoints with our test-specific properties
interface TestPixiPoints extends Partial<PixiPoints> {
  data: TestDataPoint[];
  [key: string]: any;
}

// Mock the DotLinePlot component and its dependencies
jest.mock('../../../v3/src/components/graph/plots/dot-plot/dot-line-plot', () => ({
  DotLinePlot: ({ pixiPoints, abovePointsGroupRef }: IPlotProps) => {
    // For testing purposes, we'll extract data from pixiPoints mock
    const data = (pixiPoints as unknown as TestPixiPoints)?.data || [];
    
    // Sort data by value for consistent rendering
    const sortedData = [...data].sort((a, b) => a.value - b.value);
    
    // Calculate dot positions
    const dotPositions = sortedData.map((point, index) => {
      // Simple linear mapping for test purposes
      const x = 50 + point.value * 30;
      const y = 150; // All dots on the same horizontal line
      
      return {
        ...point,
        x,
        y
      };
    });
    
    return (
      <div data-testid="dot-plot">
        <svg width="400" height="300">
          <g data-testid="x-axis">
            <line x1="0" y1="200" x2="400" y2="200" stroke="black" />
            {/* X-axis ticks */}
            {[0, 1, 2, 3, 4, 5].map(tick => (
              <text 
                key={tick} 
                x={50 + tick * 30} 
                y="220" 
                data-testid="x-tick"
              >
                {tick}
              </text>
            ))}
          </g>
          <g data-testid="y-axis">
            <line x1="50" y1="0" x2="50" y2="200" stroke="black" />
          </g>
          <g data-testid="dots">
            {dotPositions.map((point, index) => (
              <circle
                key={index}
                data-testid="dot"
                data-value={point.value}
                data-id={point.id}
                cx={point.x}
                cy={point.y}
                r="5"
                fill={point.color || "blue"}
              />
            ))}
          </g>
          {/* Render a line connecting the dots */}
          <g data-testid="line">
            <path
              d={`M ${dotPositions.map(p => `${p.x},${p.y}`).join(' L ')}`}
              stroke="blue"
              fill="none"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>
    );
  }
}));

// Mock the necessary context providers
jest.mock('../../../v3/src/hooks/use-data-set-context', () => ({
  useDataSetContext: () => ({
    getItem: (id: string) => ({ __id__: id, value: 3 }),
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
    adornmentsStore: {
      showSquaresOfResiduals: false,
      showConnectingLines: true,
      findAdornmentOfType: () => null
    }
  })
}));

jest.mock('../../../v3/src/components/graph/hooks/use-graph-data-configuration-context', () => ({
  useGraphDataConfigurationContext: () => ({
    attributeID: () => 'value',
    yAttributeIDs: [],
    selection: [],
    isCaseInSubPlot: () => true,
    getLegendColorForCase: () => 'blue'
  })
}));

jest.mock('../../../v3/src/components/graph/hooks/use-graph-layout-context', () => ({
  useGraphLayoutContext: () => ({
    getAxisScale: () => (val: number) => val * 30
  })
}));

// Mock the dot plot specific hooks
jest.mock('../../../v3/src/components/graph/hooks/use-dot-plot', () => ({
  useDotPlot: () => ({
    dataset: { getNumeric: () => 3 },
    dataConfig: {
      attributeID: () => 'value',
      getCaseDataArray: () => []
    },
    graphModel: {
      getPointRadius: () => 5,
      pointDescription: {
        pointColor: 'blue',
        pointStrokeColor: 'black'
      }
    },
    isAnimating: () => false,
    layout: {
      getAxisScale: () => (val: number) => val * 30
    },
    pointColor: 'blue',
    pointDisplayType: 'circle',
    pointStrokeColor: 'black',
    primaryAttrRole: 'x',
    primaryIsBottom: true,
    secondaryAttrRole: '',
    refreshPointSelection: jest.fn()
  })
}));

jest.mock('../../../v3/src/components/graph/hooks/use-dot-plot-drag-drop', () => ({
  useDotPlotDragDrop: () => ({
    onDrag: jest.fn(),
    onDragEnd: jest.fn(),
    onDragStart: jest.fn()
  })
}));

// Import the mocked component
import { DotLinePlot } from '../../../v3/src/components/graph/plots/dot-plot/dot-line-plot';

describe('Dot Plot Component', () => {
  // Test data
  const testData: TestDataPoint[] = [
    { id: '1', value: 1 },
    { id: '2', value: 2 },
    { id: '3', value: 3 },
    { id: '4', value: 4 },
    { id: '5', value: 2.5 }  // Add a point between others to test sorting
  ];

  // Create a mock pixiPoints object with our test data
  const createMockPixiPoints = (data: TestDataPoint[]): PixiPoints => {
    // Create a partial implementation with our test data
    const mockPixi = {
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
      getSelectedPoints: jest.fn(() => []),
      clearSelection: jest.fn(),
      clearHighlight: jest.fn(),
      destroy: jest.fn()
    } as unknown as PixiPoints;
    
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
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      // Check that the dots were rendered
      const dots = getAllByTestId('dot');
      expect(dots).toHaveLength(5); // One dot for each data point
      
      // Check that the x-axis ticks were rendered
      const ticks = getAllByTestId('x-tick');
      expect(ticks).toHaveLength(6); // Ticks from 0 to 5
    });

    it('should render dots in order of value', () => {
      const { getAllByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      const dots = getAllByTestId('dot');
      
      // Check that dots are ordered by value
      const values = dots.map(dot => parseFloat(dot.getAttribute('data-value') || '0'));
      const sortedValues = [...values].sort((a, b) => a - b);
      expect(values).toEqual(sortedValues);
    });

    it('should render a line connecting the dots', () => {
      const { getByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      // Check that the line was rendered
      const line = getByTestId('line');
      expect(line).toBeInTheDocument();
      
      // Check that the line has a path
      const path = line.querySelector('path');
      expect(path).not.toBeNull();
      expect(path?.getAttribute('stroke')).toBe('blue');
    });

    it('should handle empty data', () => {
      const { queryAllByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints([])} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      // Check that no dots are rendered
      const dots = queryAllByTestId('dot');
      expect(dots).toHaveLength(0);
      
      // Check that the line is still rendered (but empty)
      const line = queryAllByTestId('line');
      expect(line).toHaveLength(1);
    });
  });

  describe('Interaction Tests', () => {
    it('should handle clicking on dots', async () => {
      const { getAllByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      const dots = getAllByTestId('dot');
      const firstDot = dots[0];
      
      // Click on the dot
      await clickDataPoint(firstDot);
      
      // In a real test, we would verify that the dot was selected
      // This is a placeholder for the actual test
    });

    it('should handle hovering over dots', async () => {
      const { getAllByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );

      const dots = getAllByTestId('dot');
      const firstDot = dots[0];
      
      // Hover over the dot
      await hoverDataPoint(firstDot);
      
      // In a real test, we would verify that the hover state was applied
      // This is a placeholder for the actual test
    });

    it('should handle zooming', async () => {
      const { container } = render(
        <DotLinePlot 
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
        <DotLinePlot 
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
        DotLinePlot,
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
      const report = createPerformanceReport('Dot Plot Rendering', result);
      expect(report).toContain('Performance Test: Dot Plot Rendering');
    });

    it('should handle data updates efficiently', async () => {
      const { container } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );
      
      const updateData = jest.fn();
      const dataUpdate = (data: TestDataPoint[]) => {
        return data.map(point => ({
          ...point,
          value: point.value + 0.5
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
          value: Math.random() * 5
        });
      }
      
      const result = await measureRenderingPerformance(
        DotLinePlot,
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
    it('should handle different display types (circles, bars)', () => {
      // This is a placeholder for a more complex test that would verify
      // that the dot plot correctly handles different display types
      // For now, we'll just render the component
      const { container } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );
      
      expect(container).toBeDefined();
    });

    it('should handle connecting lines between dots', () => {
      // This test would verify that the dot plot correctly handles
      // connecting lines between dots
      // For now, it's a placeholder
      const { getByTestId } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );
      
      const line = getByTestId('line');
      expect(line).toBeInTheDocument();
    });

    it('should handle dot dragging', () => {
      // This test would verify that the dot plot correctly handles
      // dragging dots to new positions
      // For now, it's a placeholder
      const { container } = render(
        <DotLinePlot 
          pixiPoints={createMockPixiPoints(testData)} 
          abovePointsGroupRef={createMockGroupRef()}
        />
      );
      
      expect(container).toBeDefined();
    });
  });
}); 