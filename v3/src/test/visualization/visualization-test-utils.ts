/**
 * Basic Visualization Testing Utilities
 * 
 * This file contains utilities for testing visualization components in CODAP v3.
 * These utilities help with rendering visualizations and verifying data points.
 */

import React, { ComponentType, ReactElement } from 'react';
import { render, RenderResult, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Options for rendering a visualization component
 */
export interface RenderVisualizationOptions {
  /**
   * The container to render the visualization in
   */
  container?: HTMLElement;
  /**
   * Whether to wrap the component in test providers
   */
  withProviders?: boolean;
}

/**
 * Result of rendering a visualization component
 */
export interface VisualizationRenderResult extends RenderResult {
  /**
   * Get all data points in the visualization
   */
  getDataPoints: () => HTMLElement[];
  /**
   * Get a data point by its index
   */
  getDataPointByIndex: (index: number) => HTMLElement | null;
  /**
   * Get a data point by its value
   */
  getDataPointByValue: (value: string | number) => HTMLElement | null;
  /**
   * Get the x-axis element
   */
  getXAxis: () => HTMLElement;
  /**
   * Get the y-axis element
   */
  getYAxis: () => HTMLElement;
}

/**
 * Options for verifying data points
 */
export interface VerifyDataPointsOptions<T> {
  /**
   * Function to access the x value of a data point
   */
  xAccessor: (item: T) => number | string;
  /**
   * Function to access the y value of a data point
   */
  yAccessor: (item: T) => number | string;
  /**
   * Function to access the id of a data point
   */
  idAccessor?: (item: T) => string;
  /**
   * Tolerance for comparing data point positions
   */
  tolerance?: number;
}

/**
 * Renders a visualization component with testing utilities
 * 
 * @param Component - The visualization component to render
 * @param props - The props to pass to the component
 * @param options - Options for rendering the visualization
 * @returns The render result with additional testing utilities
 * 
 * @example
 * ```tsx
 * const { getDataPoints, getXAxis, getYAxis } = renderVisualization(
 *   ScatterPlot,
 *   { data: testData }
 * );
 * 
 * expect(getDataPoints()).toHaveLength(3);
 * expect(getXAxis()).toBeInTheDocument();
 * ```
 */
export function renderVisualization<P extends object>(
  Component: ComponentType<P>,
  props: P,
  options: RenderVisualizationOptions = {}
): VisualizationRenderResult {
  // Create the element to render
  const element: ReactElement = React.createElement(Component, props);
  
  // Render the component
  const renderResult = render(element, {
    container: options.container
  });

  // Add custom queries
  return {
    ...renderResult,
    getDataPoints: () => renderResult.queryAllByTestId('data-point'),
    getDataPointByIndex: (index: number) => {
      const dataPoints = renderResult.queryAllByTestId('data-point');
      return index >= 0 && index < dataPoints.length ? dataPoints[index] : null;
    },
    getDataPointByValue: (value: string | number) => {
      return renderResult.queryByTestId(`data-point-${value}`) || 
             renderResult.queryByTestId('data-point', { exact: false })?.querySelector(`[data-value="${value}"]`) as HTMLElement || 
             null;
    },
    getXAxis: () => renderResult.getByTestId('x-axis'),
    getYAxis: () => renderResult.getByTestId('y-axis')
  };
}

/**
 * Verifies that data points are rendered correctly
 * 
 * @param container - The container element
 * @param data - The data to verify
 * @param options - Options for verifying data points
 * 
 * @example
 * ```tsx
 * verifyDataPoints(container, testData, {
 *   xAccessor: item => item.x,
 *   yAccessor: item => item.y
 * });
 * ```
 */
export function verifyDataPoints<T>(
  container: HTMLElement,
  data: T[],
  options: VerifyDataPointsOptions<T>
): void {
  const { xAccessor, yAccessor, idAccessor, tolerance = 0.1 } = options;
  
  // Get all data points
  const dataPoints = within(container).queryAllByTestId('data-point');
  
  // Check that the number of data points matches the data
  expect(dataPoints.length).toBe(data.length);
  
  // Check each data point
  data.forEach((item, index) => {
    const dataPoint = dataPoints[index];
    
    // Check that the data point has the correct data attributes
    if (dataPoint.hasAttribute('data-x')) {
      const dataX = parseFloat(dataPoint.getAttribute('data-x') || '0');
      const expectedX = typeof xAccessor(item) === 'number' 
        ? xAccessor(item) as number 
        : parseFloat(xAccessor(item) as string);
      
      expect(dataX).toBeCloseTo(expectedX, tolerance);
    }
    
    if (dataPoint.hasAttribute('data-y')) {
      const dataY = parseFloat(dataPoint.getAttribute('data-y') || '0');
      const expectedY = typeof yAccessor(item) === 'number' 
        ? yAccessor(item) as number 
        : parseFloat(yAccessor(item) as string);
      
      expect(dataY).toBeCloseTo(expectedY, tolerance);
    }
    
    if (idAccessor && dataPoint.hasAttribute('data-value')) {
      const dataValue = dataPoint.getAttribute('data-value');
      const expectedValue = idAccessor(item);
      
      expect(dataValue).toBe(expectedValue);
    }
  });
}

/**
 * Clicks on a data point
 * 
 * @param dataPoint - The data point element to click
 * @returns A promise that resolves when the click is complete
 * 
 * @example
 * ```tsx
 * const dataPoint = getDataPointByIndex(0);
 * await clickDataPoint(dataPoint);
 * ```
 */
export async function clickDataPoint(
  dataPoint: HTMLElement | null
): Promise<void> {
  if (!dataPoint) {
    throw new Error('Data point is null');
  }
  
  await userEvent.click(dataPoint);
}

/**
 * Hovers over a data point
 * 
 * @param dataPoint - The data point element to hover over
 * @returns A promise that resolves when the hover is complete
 * 
 * @example
 * ```tsx
 * const dataPoint = getDataPointByIndex(0);
 * await hoverDataPoint(dataPoint);
 * ```
 */
export async function hoverDataPoint(
  dataPoint: HTMLElement | null
): Promise<void> {
  if (!dataPoint) {
    throw new Error('Data point is null');
  }
  
  await userEvent.hover(dataPoint);
}

/**
 * Gets the positions of all data points in a container
 * 
 * @param container - The container element
 * @returns An array of positions for each data point
 * 
 * @example
 * ```tsx
 * const positions = getDataPointPositions(container);
 * ```
 */
export function getDataPointPositions(
  container: HTMLElement
): Array<{ x: number; y: number }> {
  const dataPoints = within(container).queryAllByTestId('data-point');
  
  return dataPoints.map(dataPoint => {
    // For SVG elements, use cx and cy attributes
    if (dataPoint instanceof SVGElement) {
      const cx = parseFloat(dataPoint.getAttribute('cx') || '0');
      const cy = parseFloat(dataPoint.getAttribute('cy') || '0');
      return { x: cx, y: cy };
    }
    
    // For HTML elements, use getBoundingClientRect
    const rect = dataPoint.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  });
} 