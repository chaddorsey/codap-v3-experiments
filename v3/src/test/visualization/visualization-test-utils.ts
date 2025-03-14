/**
 * Visualization Test Utilities
 * 
 * This file contains utilities for testing visualization components.
 */

import React, { ComponentType, ReactElement } from 'react';
import { render, RenderOptions, RenderResult, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Instance } from 'mobx-state-tree';
import { ICase } from '../../models/data/data-set-types';
import { DataSet } from '../../models/data/data-set';

// Define our own ITestDataSet interface using the Instance type
type ITestDataSet = any; // Simplified for now

/**
 * Visualization-specific test utilities
 */
export interface VisualizationTestUtils {
  // Get all data points rendered in the visualization
  getDataPoints: () => HTMLElement[];
  
  // Get data point by value or index
  getDataPointByValue: (value: number | string) => HTMLElement | null;
  getDataPointByIndex: (index: number) => HTMLElement | null;
  
  // Get axes elements
  getXAxis: () => HTMLElement | null;
  getYAxis: () => HTMLElement | null;
  
  // Get legend elements
  getLegend: () => HTMLElement | null;
  getLegendItems: () => HTMLElement[];

  // Get the visualization container
  getContainer: () => HTMLElement;
}

/**
 * Options for rendering a visualization component
 */
export interface RenderVisualizationOptions extends RenderOptions {
  dataPointSelector?: string;
  xAxisSelector?: string;
  yAxisSelector?: string;
  legendSelector?: string;
  legendItemSelector?: string;
}

/**
 * Renders a visualization component with the provided props and returns
 * testing utilities along with component-specific helpers
 */
export function renderVisualization<P>(
  Component: ComponentType<P>,
  props: P,
  options: RenderVisualizationOptions = {}
): RenderResult & VisualizationTestUtils {
  const {
    dataPointSelector = '[data-testid="data-point"]',
    xAxisSelector = '[data-testid="x-axis"]',
    yAxisSelector = '[data-testid="y-axis"]',
    legendSelector = '[data-testid="legend"]',
    legendItemSelector = '[data-testid="legend-item"]',
    ...renderOptions
  } = options;

  // Use a more explicit type assertion to handle the component type
  // This is necessary because React.createElement has strict type checking
  const element = React.createElement(Component as unknown as React.ComponentType<any>, props);
  const result = render(element, renderOptions);
  const { container } = result;

  return {
    ...result,
    getDataPoints: () => screen.queryAllByTestId('data-point'),
    getDataPointByValue: (value: number | string) => {
      const points = screen.queryAllByTestId('data-point');
      return points.find(point => point.getAttribute('data-value') === String(value)) || null;
    },
    getDataPointByIndex: (index: number) => {
      const points = screen.queryAllByTestId('data-point');
      return index >= 0 && index < points.length ? points[index] : null;
    },
    getXAxis: () => screen.queryByTestId('x-axis'),
    getYAxis: () => screen.queryByTestId('y-axis'),
    getLegend: () => screen.queryByTestId('legend'),
    getLegendItems: () => screen.queryAllByTestId('legend-item'),
    getContainer: () => container
  };
}

/**
 * Verifies that data points are rendered correctly based on the provided dataset
 */
export function verifyDataPoints(
  container: HTMLElement,
  dataset: any[],
  options: {
    xAccessor: (item: any) => number | string;
    yAccessor: (item: any) => number | string;
    tolerance?: number; // For numeric comparisons
    dataPointSelector?: string;
  }
): void {
  const {
    xAccessor,
    yAccessor,
    tolerance = 0.001,
    dataPointSelector = '[data-testid="data-point"]'
  } = options;

  const dataPoints = within(container).queryAllByTestId('data-point');
  
  // Check that we have the correct number of data points
  expect(dataPoints.length).toBe(dataset.length);
  
  // Check each data point
  dataPoints.forEach((dataPoint, index) => {
    const item = dataset[index];
    const expectedX = xAccessor(item);
    const expectedY = yAccessor(item);
    
    const actualX = parseFloat(dataPoint.getAttribute('data-x') || '0');
    const actualY = parseFloat(dataPoint.getAttribute('data-y') || '0');
    
    if (typeof expectedX === 'number') {
      expect(actualX).toBeCloseTo(expectedX, tolerance);
    } else {
      expect(String(actualX)).toBe(String(expectedX));
    }
    
    if (typeof expectedY === 'number') {
      expect(actualY).toBeCloseTo(expectedY, tolerance);
    } else {
      expect(String(actualY)).toBe(String(expectedY));
    }
  });
}

/**
 * Verifies that a specific data point is rendered correctly
 */
export function verifyDataPoint(
  dataPoint: HTMLElement,
  expectedValue: number | string,
  options?: {
    tolerance?: number;
    attribute?: string;
  }
): void {
  const { tolerance = 0.001, attribute = 'data-value' } = options || {};
  
  const actualValue = dataPoint.getAttribute(attribute);
  
  if (typeof expectedValue === 'number') {
    expect(parseFloat(actualValue || '0')).toBeCloseTo(expectedValue, tolerance);
  } else {
    expect(actualValue).toBe(String(expectedValue));
  }
}

/**
 * Simulates clicking on a data point
 */
export async function clickDataPoint(
  dataPoint: HTMLElement
): Promise<void> {
  const user = userEvent.setup();
  await user.click(dataPoint);
}

/**
 * Simulates hovering over a data point
 */
export async function hoverDataPoint(
  dataPoint: HTMLElement
): Promise<void> {
  const user = userEvent.setup();
  await user.hover(dataPoint);
}

/**
 * Creates a test visualization with the provided dataset
 */
export function createTestVisualization(
  type: 'scatter' | 'bar' | 'line' | 'pie',
  dataset: ITestDataSet,
  options?: {
    xAttribute?: string;
    yAttribute?: string;
    colorAttribute?: string;
    sizeAttribute?: string;
  }
): React.ReactElement {
  // This is a placeholder implementation
  // In a real implementation, this would create a visualization component
  // with the provided dataset and options
  return React.createElement('div', { 'data-testid': 'test-visualization' });
}

/**
 * Interface for visual changes in a visualization
 */
export interface VisualChange {
  element: HTMLElement;
  property: string;
  oldValue: any;
  newValue: any;
}

/**
 * Tracks changes in a visualization when the underlying data changes
 */
export function trackVisualizationChanges(
  visualization: HTMLElement,
  dataModel: any,
  action: () => void
): {
  visualChanges: VisualChange[];
  dataChanges: any[];
} {
  // This is a placeholder implementation
  // In a real implementation, this would track changes to the visualization
  // when the underlying data changes
  return {
    visualChanges: [],
    dataChanges: []
  };
} 