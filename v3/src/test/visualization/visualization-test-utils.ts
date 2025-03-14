/**
 * Visualization Testing Utilities
 * 
 * This file contains utilities for testing visualization components in CODAP v3.
 * These utilities help with rendering components, verifying data points, and simulating interactions.
 */

import { render, RenderResult, screen } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Options for rendering a visualization
 */
export interface RenderVisualizationOptions {
  /**
   * The container to render into
   */
  container?: HTMLElement;
  /**
   * Whether to wrap the component in a test wrapper
   */
  withWrapper?: boolean;
}

/**
 * Renders a visualization component for testing
 * 
 * @param component - The component to render
 * @param options - Options for rendering
 * @returns The render result
 * 
 * @example
 * ```tsx
 * const { container } = renderVisualization(<ScatterPlot data={data} />);
 * ```
 */
export function renderVisualization(
  component: ReactElement,
  options: RenderVisualizationOptions = {}
): RenderResult {
  const { container, withWrapper = false } = options;
  
  // If withWrapper is true, wrap the component in a test wrapper
  const componentToRender = withWrapper
    ? component
    : component;
  
  return render(componentToRender, { container });
}

/**
 * Verifies that data points are rendered correctly
 * 
 * @param container - The container element
 * @param dataPoints - The data points to verify
 * @param getPointElement - A function to get the element for a data point
 * @returns A promise that resolves when the verification is complete
 * 
 * @example
 * ```tsx
 * await verifyDataPoints(
 *   container,
 *   [{ id: '1', x: 10, y: 20 }, { id: '2', x: 30, y: 40 }],
 *   (point) => screen.getByTestId(`data-point-${point.id}`)
 * );
 * ```
 */
export async function verifyDataPoints<T>(
  container: HTMLElement,
  dataPoints: T[],
  getPointElement: (point: T) => HTMLElement
): Promise<void> {
  // Check that the correct number of data points are rendered
  const pointElements = Array.from(container.querySelectorAll('[data-testid^="data-point-"]'));
  expect(pointElements.length).toBe(dataPoints.length);
  
  // Check that each data point is rendered correctly
  for (const point of dataPoints) {
    const pointElement = getPointElement(point);
    expect(pointElement).toBeInTheDocument();
  }
}

/**
 * Verifies that data points are positioned correctly
 * 
 * @param dataPoints - The data points to verify
 * @param getPointElement - A function to get the element for a data point
 * @param getExpectedPosition - A function to get the expected position for a data point
 * @returns A promise that resolves when the verification is complete
 * 
 * @example
 * ```tsx
 * await verifyDataPointPositions(
 *   [{ id: '1', x: 10, y: 20 }, { id: '2', x: 30, y: 40 }],
 *   (point) => screen.getByTestId(`data-point-${point.id}`),
 *   (point) => ({ x: point.x * 2, y: 200 - point.y * 2 })
 * );
 * ```
 */
export async function verifyDataPointPositions<T>(
  dataPoints: T[],
  getPointElement: (point: T) => HTMLElement,
  getExpectedPosition: (point: T) => { x: number; y: number }
): Promise<void> {
  for (const point of dataPoints) {
    const pointElement = getPointElement(point);
    const expectedPosition = getExpectedPosition(point);
    
    // Get the actual position
    const rect = pointElement.getBoundingClientRect();
    const actualX = rect.left + rect.width / 2;
    const actualY = rect.top + rect.height / 2;
    
    // Verify the position with a small tolerance
    expect(actualX).toBeCloseTo(expectedPosition.x, 0);
    expect(actualY).toBeCloseTo(expectedPosition.y, 0);
  }
}

/**
 * Creates test data for a visualization
 * 
 * @param count - The number of data points to create
 * @param xRange - The range of x values
 * @param yRange - The range of y values
 * @returns The test data
 * 
 * @example
 * ```tsx
 * const data = createTestData(100, [0, 100], [0, 100]);
 * ```
 */
export function createTestData(
  count: number,
  xRange: [number, number] = [0, 100],
  yRange: [number, number] = [0, 100]
): Array<{ id: string; x: number; y: number }> {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  
  return Array.from({ length: count }, (_, i) => {
    const id = `${i + 1}`;
    const x = xMin + Math.random() * (xMax - xMin);
    const y = yMin + Math.random() * (yMax - yMin);
    
    return { id, x, y };
  });
}

/**
 * Waits for a visualization to be fully rendered
 * 
 * @param container - The container element
 * @param timeout - The timeout in milliseconds
 * @returns A promise that resolves when the visualization is fully rendered
 * 
 * @example
 * ```tsx
 * await waitForVisualizationRender(container);
 * ```
 */
export async function waitForVisualizationRender(
  container: HTMLElement,
  timeout: number = 1000
): Promise<void> {
  return new Promise<void>((resolve) => {
    // Check if the visualization is already rendered
    if (container.querySelector('[data-testid="visualization-ready"]')) {
      resolve();
      return;
    }
    
    // Set up a mutation observer to wait for the visualization to be rendered
    const observer = new MutationObserver(() => {
      if (container.querySelector('[data-testid="visualization-ready"]')) {
        observer.disconnect();
        resolve();
      }
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-testid']
    });
    
    // Set a timeout to resolve the promise if the visualization is not rendered
    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeout);
  });
}

/**
 * Gets the dimensions of a visualization
 * 
 * @param container - The container element
 * @returns The dimensions of the visualization
 * 
 * @example
 * ```tsx
 * const { width, height } = getVisualizationDimensions(container);
 * ```
 */
export function getVisualizationDimensions(
  container: HTMLElement
): { width: number; height: number } {
  const visualization = container.querySelector('[data-testid="visualization"]');
  
  if (!visualization) {
    throw new Error('Visualization not found');
  }
  
  const rect = visualization.getBoundingClientRect();
  
  return {
    width: rect.width,
    height: rect.height
  };
}

/**
 * Gets the data point at a specific position
 * 
 * @param container - The container element
 * @param x - The x coordinate
 * @param y - The y coordinate
 * @returns The data point element at the position, or null if none exists
 * 
 * @example
 * ```tsx
 * const point = getDataPointAtPosition(container, 100, 100);
 * ```
 */
export function getDataPointAtPosition(
  container: HTMLElement,
  x: number,
  y: number
): HTMLElement | null {
  const elements = document.elementsFromPoint(x, y);
  
  // Find the first element that is a data point
  for (const element of elements) {
    if (element instanceof HTMLElement && element.getAttribute('data-testid')?.startsWith('data-point-')) {
      return element;
    }
  }
  
  return null;
} 