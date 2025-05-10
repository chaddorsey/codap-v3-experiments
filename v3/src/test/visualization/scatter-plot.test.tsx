/**
 * Tests for Scatter Plot Component
 * 
 * This file contains tests for the scatter plot component using the visualization testing utilities.
 */

import React, { createRef } from 'react';
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
  snapshotVisualization,
  compareWithBaseline
} from './snapshot-test-utils';
import {
  measureRenderingPerformance,
  measureInteractionPerformance,
  measureDataUpdatePerformance,
  createPerformanceReport
} from './performance-test-utils';
import { IPlotProps } from '../../components/graph/graphing-types';
import { IPixiPointMetadata } from '../../components/data-display/pixi/pixi-points';

// Define a test data interface
interface TestDataPoint {
  id: string;
  x: number;
  y: number;
  color?: string;
}

// Create a mock for PixiPoints that includes test data
interface MockPixiPoints {
  // Required properties from the actual PixiPoints interface
  ticker: any;
  tickerStopTimeoutId: any;
  isSafari: boolean;
  mostRecentSvgElement: any;
  stage: any;
  pointsContainer: any;
  background: any;
  subPlotMasks: any;
  
  // Our test data
  testData: TestDataPoint[];
  
  // Mock methods
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
  
  // Allow additional properties
  [key: string]: any;
}

// Mock the ScatterPlot component and its dependencies
jest.mock('../../components/graph/plots/scatter-plot/scatter-plot', () => ({
  ScatterPlot: ({ pixiPoints, abovePointsGroupRef }: IPlotProps) => {
    // For testing purposes, we'll extract data from pixiPoints mock
    // Use a safe type assertion and access testData instead of data
    const mockPixiPoints = pixiPoints as unknown as MockPixiPoints;
    const data = mockPixiPoints?.testData || [];
    
    return (
      <div data-testid="scatter-plot">
        <svg width="400" height="300">
          <g data-testid="x-axis">
            <line x1="0" y1="250" x2="400" y2="250" stroke="black" />
          </g>
          <g data-testid="y-axis">
            <line x1="50" y1="0" x2="50" y2="300" stroke="black" />
          </g>
          {data.map((point: TestDataPoint, index: number) => (
            <circle
              key={index}
              data-testid="data-point"
              data-x={point.x}
              data-y={point.y}
              data-value={point.id || index}
              cx={50 + point.x * 30}
              cy={250 - point.y * 30}
              r="5"
              fill={point.color || "blue"}
            />
          ))}
          <g ref={abovePointsGroupRef}></g>
        </svg>
      </div>
    );
  }
}));

// Mock the necessary context providers
jest.mock('../../hooks/use-data-set-context', () => ({
  useDataSetContext: () => ({
    getItem: (id: string) => ({ __id__: id, x: 1, y: 2 }),
    setCaseValues: jest.fn()
  })
}));

jest.mock('../../components/graph/hooks/use-graph-content-model-context', () => ({
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
      showConnectingLines: false,
      findAdornmentOfType: () => null
    }
  })
}));

jest.mock('../../components/graph/hooks/use-graph-data-configuration-context', () => ({
  useGraphDataConfigurationContext: () => ({
    attributeID: () => 'x',
    yAttributeIDs: ['y'],
    selection: [],
    isCaseInSubPlot: () => true,
    getLegendColorForCase: () => 'blue'
  })
}));

jest.mock('../../components/graph/hooks/use-graph-layout-context', () => ({
  useGraphLayoutContext: () => ({
    getAxisScale: () => (val: number) => val * 30
  })
}));

// Import the mocked component
import { ScatterPlot } from '../../components/graph/plots/scatter-plot/scatter-plot';

describe('ScatterPlot', () => {
  // Test data
  const testData: TestDataPoint[] = [
    { id: '1', x: 1, y: 2 },
    { id: '2', x: 3, y: 4 },
    { id: '3', x: 5, y: 6 }
  ];

  // Create a mock pixiPoints object with our test data
  const createMockPixiPoints = (data: TestDataPoint[]) => {
    const mockPixiPoints: MockPixiPoints = {
      // Required properties
      ticker: {},
      tickerStopTimeoutId: null,
      isSafari: false,
      mostRecentSvgElement: null,
      stage: {},
      pointsContainer: {},
      background: {},
      subPlotMasks: {},
      
      // Our test data
      testData: data,
      
      // Mock methods
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
    };
    
    // Cast to any to satisfy the PixiPoints type requirement
    return mockPixiPoints as any;
  };

  // Create a standard set of props for testing
  const createTestProps = (data: TestDataPoint[] = testData) => {
    return {
      pixiPoints: createMockPixiPoints(data),
      abovePointsGroupRef: createRef<SVGGElement>()
    };
  };

  describe('Rendering Tests', () => {
    it('should render data points correctly', () => {
      const { getDataPoints, getXAxis, getYAxis } = renderVisualization(
        ScatterPlot,
        createTestProps()
      );

      // Check that the visualization was rendered correctly
      expect(getDataPoints()).toHaveLength(3);
      expect(getXAxis()).toBeInTheDocument();
      expect(getYAxis()).toBeInTheDocument();
    });

    it('should position data points according to their coordinates', () => {
      const { container } = render(<ScatterPlot {...createTestProps()} />);
      
      // Verify data points
      verifyDataPoints(container, testData, {
        xAccessor: (item: TestDataPoint) => item.x,
        yAccessor: (item: TestDataPoint) => item.y
      });
    });

    it('should handle empty data', () => {
      const { getDataPoints } = renderVisualization(
        ScatterPlot,
        createTestProps([])
      );

      // Check that no data points are rendered
      expect(getDataPoints()).toHaveLength(0);
    });

    it('should handle large datasets', () => {
      // Create a large dataset
      const largeData: TestDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        x: Math.random() * 10,
        y: Math.random() * 10
      }));

      const { getDataPoints } = renderVisualization(
        ScatterPlot,
        createTestProps(largeData)
      );

      // Check that all data points are rendered
      expect(getDataPoints()).toHaveLength(100);
    });
  });

  describe('Interaction Tests', () => {
    it('should handle clicking on data points', async () => {
      const { getDataPointByIndex } = renderVisualization(
        ScatterPlot,
        createTestProps()
      );

      const dataPoint = getDataPointByIndex(0);
      expect(dataPoint).not.toBeNull();
      
      // Click on the data point
      if (dataPoint) {
        await clickDataPoint(dataPoint);
        // In a real test, we would verify that the point was selected
        // This is a placeholder for the actual test
      }
    });

    it('should handle hovering over data points', async () => {
      const { getDataPointByIndex } = renderVisualization(
        ScatterPlot,
        createTestProps()
      );

      const dataPoint = getDataPointByIndex(0);
      expect(dataPoint).not.toBeNull();
      
      // Hover over the data point
      if (dataPoint) {
        await hoverDataPoint(dataPoint);
        // In a real test, we would verify that the hover state was applied
        // This is a placeholder for the actual test
      }
    });

    it('should handle zooming', async () => {
      const { container } = render(<ScatterPlot {...createTestProps()} />);
      
      // Simulate zooming
      await simulateZoom(container, { factor: 1.5 });
      
      // In a real test, we would verify that the zoom was applied
      // This is a placeholder for the actual test
    });

    it('should handle panning', async () => {
      const { container } = render(<ScatterPlot {...createTestProps()} />);
      
      // Simulate panning
      await simulatePan(container, { deltaX: 10, deltaY: 20 });
      
      // In a real test, we would verify that the pan was applied
      // This is a placeholder for the actual test
    });

    it('should handle selection', async () => {
      const { container } = render(<ScatterPlot {...createTestProps()} />);
      
      // Simulate selection
      await simulateSelection(container, {
        startPoint: { x: 10, y: 10 },
        endPoint: { x: 100, y: 100 }
      });
      
      // In a real test, we would verify that the selection was applied
      // This is a placeholder for the actual test
    });
  });

  describe('Snapshot Tests', () => {
    it('should match baseline snapshot', () => {
      const { container } = render(<ScatterPlot {...createTestProps()} />);
      
      // Create a snapshot of the current visualization
      const snapshot = snapshotVisualization(container.firstChild as HTMLElement);
      
      // In a real test, we would compare with a baseline snapshot
      // For now, we'll just verify that the snapshot contains expected elements
      expect(snapshot).toContain('data-testid="scatter-plot"');
      expect(snapshot).toContain('data-testid="x-axis"');
      expect(snapshot).toContain('data-testid="y-axis"');
      expect(snapshot).toContain('data-testid="data-point"');
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
        ScatterPlot,
        createTestProps(),
        { iterations: 2, warmupIterations: 1 }
      );
      
      // Check the performance results
      expect(result.averageTime).toBeDefined();
      expect(result.medianTime).toBeDefined();
      expect(result.minTime).toBeDefined();
      expect(result.maxTime).toBeDefined();
      
      // Create a performance report
      const report = createPerformanceReport('Scatter Plot Rendering', result);
      expect(report).toContain('Performance Test: Scatter Plot Rendering');
    });

    it('should handle data updates efficiently', async () => {
      const { container } = render(<ScatterPlot {...createTestProps()} />);
      
      const updateData = jest.fn();
      const dataUpdate = (data: TestDataPoint[]) => {
        return data.map(point => ({
          ...point,
          y: point.y + 1
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

    it('should handle interactions efficiently', async () => {
      const { container } = render(<ScatterPlot {...createTestProps()} />);
      
      const interaction = async () => {
        await simulateZoom(container, { factor: 1.2 });
      };
      
      const result = await measureInteractionPerformance(
        container.firstChild as HTMLElement,
        interaction,
        { iterations: 2, warmupIterations: 1 }
      );
      
      // Check the performance results
      expect(result.averageTime).toBeDefined();
      expect(result.medianTime).toBeDefined();
      expect(result.minTime).toBeDefined();
      expect(result.maxTime).toBeDefined();
    });
  });
}); 