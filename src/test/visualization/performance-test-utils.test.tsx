/**
 * Tests for Visualization Performance Testing Utilities
 */

import React, { useState, useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { 
  measureRenderingPerformance,
  measureInteractionPerformance,
  measureDataUpdatePerformance,
  createPerformanceReport
} from './performance-test-utils';

// Simple performance test visualization component
interface PerformanceVisualizationProps {
  dataPoints?: number;
  onRender?: () => void;
}

const PerformanceVisualization: React.FC<PerformanceVisualizationProps> = ({ 
  dataPoints = 10,
  onRender
}) => {
  useEffect(() => {
    onRender?.();
  }, [onRender]);

  // Generate data points
  const points = Array.from({ length: dataPoints }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100
  }));

  return (
    <div data-testid="performance-visualization">
      <svg width="200" height="200">
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="5"
            fill="blue"
          />
        ))}
      </svg>
    </div>
  );
};

// Component with data updates
interface DataUpdateVisualizationProps {
  data: Array<{ x: number; y: number }>;
  onUpdate?: () => void;
}

const DataUpdateVisualization: React.FC<DataUpdateVisualizationProps> = ({ 
  data,
  onUpdate
}) => {
  useEffect(() => {
    onUpdate?.();
  }, [data, onUpdate]);

  return (
    <div data-testid="data-update-visualization">
      <svg width="200" height="200">
        {data.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="5"
            fill="blue"
          />
        ))}
      </svg>
    </div>
  );
};

// Component with zoom functionality
interface ZoomableVisualizationProps {
  scale?: number;
  onZoom?: () => void;
}

const ZoomableVisualization: React.FC<ZoomableVisualizationProps> = ({ 
  scale = 1,
  onZoom
}) => {
  useEffect(() => {
    onZoom?.();
  }, [scale, onZoom]);

  return (
    <div data-testid="zoomable-visualization">
      <svg width="200" height="200">
        <g transform={`scale(${scale})`}>
          <circle cx="50" cy="50" r="40" fill="blue" />
        </g>
      </svg>
    </div>
  );
};

describe('Visualization Performance Testing Utilities', () => {
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

  describe('measureRenderingPerformance', () => {
    it('should measure the rendering performance of a component', async () => {
      const result = await measureRenderingPerformance(
        PerformanceVisualization,
        { dataPoints: 10 },
        { iterations: 2, warmupIterations: 1 }
      );
      
      // Since we mocked performance.now to return 10, 20, 30, etc.,
      // and each iteration calls it twice (start and end),
      // the times should be 10ms per iteration
      expect(result.averageTime).toBe(10);
      expect(result.medianTime).toBe(10);
      expect(result.minTime).toBe(10);
      expect(result.maxTime).toBe(10);
      expect(result.samples).toEqual([10, 10]);
    });
  });

  describe('measureInteractionPerformance', () => {
    it('should measure the performance of interactions', async () => {
      const { container } = render(<div data-testid="test-element" />);
      const element = container.firstChild as HTMLElement;
      
      const interaction = jest.fn().mockResolvedValue(undefined);
      
      const result = await measureInteractionPerformance(
        element,
        interaction,
        { iterations: 2, warmupIterations: 1 }
      );
      
      // Check that the interaction was called the expected number of times
      expect(interaction).toHaveBeenCalledTimes(3); // 1 warmup + 2 iterations
      
      // Check the performance results
      expect(result.averageTime).toBe(10);
      expect(result.medianTime).toBe(10);
      expect(result.minTime).toBe(10);
      expect(result.maxTime).toBe(10);
    });
  });

  describe('measureDataUpdatePerformance', () => {
    it('should measure the performance of data updates', async () => {
      const initialData = [{ x: 10, y: 10 }];
      const { container } = render(
        <DataUpdateVisualization data={initialData} />
      );
      const element = container.firstChild as HTMLElement;
      
      const dataUpdate = (data: typeof initialData) => {
        return [...data, { x: Math.random() * 100, y: Math.random() * 100 }];
      };
      
      const updateData = jest.fn();
      
      const result = await measureDataUpdatePerformance(
        element,
        dataUpdate,
        initialData,
        updateData,
        { iterations: 2, warmupIterations: 1 }
      );
      
      // Check that updateData was called the expected number of times
      expect(updateData).toHaveBeenCalledTimes(3); // 1 warmup + 2 iterations
      
      // Check the performance results
      expect(result.averageTime).toBe(10);
      expect(result.medianTime).toBe(10);
      expect(result.minTime).toBe(10);
      expect(result.maxTime).toBe(10);
    });
  });

  describe('createPerformanceReport', () => {
    it('should create a performance report', () => {
      const result = {
        averageTime: 15.5,
        medianTime: 15,
        minTime: 10,
        maxTime: 20,
        samples: [10, 15, 15, 20]
      };
      
      const report = createPerformanceReport('Test Performance', result);
      
      expect(report).toContain('Performance Test: Test Performance');
      expect(report).toContain('Average Time: 15.50ms');
      expect(report).toContain('Median Time: 15.00ms');
      expect(report).toContain('Min Time: 10.00ms');
      expect(report).toContain('Max Time: 20.00ms');
    });
    
    it('should include threshold information if provided', () => {
      const result = {
        averageTime: 15.5,
        medianTime: 15,
        minTime: 10,
        maxTime: 20,
        samples: [10, 15, 15, 20]
      };
      
      // Test with a passing threshold
      const passingReport = createPerformanceReport('Test Performance', result, 20);
      expect(passingReport).toContain('Threshold: 20.00ms');
      expect(passingReport).toContain('Status: PASSED');
      
      // Test with a failing threshold
      const failingReport = createPerformanceReport('Test Performance', result, 10);
      expect(failingReport).toContain('Threshold: 10.00ms');
      expect(failingReport).toContain('Status: FAILED');
    });
  });
}); 