/**
 * Performance Testing Utilities
 * 
 * This file contains utilities for performance testing visualization components in CODAP v3.
 * These utilities help with measuring rendering time, interaction performance, and data update performance.
 */

import { render } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Performance measurement result
 */
export interface PerformanceResult {
  /**
   * Average time in milliseconds
   */
  average: number;
  /**
   * Median time in milliseconds
   */
  median: number;
  /**
   * Minimum time in milliseconds
   */
  min: number;
  /**
   * Maximum time in milliseconds
   */
  max: number;
  /**
   * All measurements in milliseconds
   */
  measurements: number[];
}

/**
 * Measures the rendering performance of a visualization component
 * 
 * @param component - The component to measure
 * @param iterations - The number of iterations to run
 * @returns A promise that resolves to the performance result
 * 
 * @example
 * ```tsx
 * const result = await measureRenderingPerformance(<ScatterPlot data={data} />, 10);
 * console.log(`Average rendering time: ${result.average}ms`);
 * ```
 */
export async function measureRenderingPerformance(
  component: ReactElement,
  iterations: number = 5
): Promise<PerformanceResult> {
  const measurements: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    // Clean up previous render if any
    if (i > 0) {
      document.body.innerHTML = '';
    }
    
    // Measure rendering time
    const start = performance.now();
    render(component);
    const end = performance.now();
    
    measurements.push(end - start);
  }
  
  return calculatePerformanceResult(measurements);
}

/**
 * Measures the interaction performance of a visualization component
 * 
 * @param component - The component to measure
 * @param interactionFn - The interaction function to measure
 * @param iterations - The number of iterations to run
 * @returns A promise that resolves to the performance result
 * 
 * @example
 * ```tsx
 * const { container } = render(<ScatterPlot data={data} />);
 * const result = await measureInteractionPerformance(
 *   container,
 *   async () => {
 *     await simulateZoom(container, 2, 100, 100);
 *   },
 *   10
 * );
 * console.log(`Average interaction time: ${result.average}ms`);
 * ```
 */
export async function measureInteractionPerformance(
  container: HTMLElement,
  interactionFn: () => Promise<void>,
  iterations: number = 5
): Promise<PerformanceResult> {
  const measurements: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    // Measure interaction time
    const start = performance.now();
    await interactionFn();
    const end = performance.now();
    
    measurements.push(end - start);
  }
  
  return calculatePerformanceResult(measurements);
}

/**
 * Measures the data update performance of a visualization component
 * 
 * @param updateFn - The function that updates the data
 * @param iterations - The number of iterations to run
 * @returns A promise that resolves to the performance result
 * 
 * @example
 * ```tsx
 * const result = await measureDataUpdatePerformance(
 *   async () => {
 *     // Update the data
 *     dataStore.updateData(newData);
 *     // Wait for the component to re-render
 *     await waitFor(() => screen.getByTestId('data-point-10'));
 *   },
 *   10
 * );
 * console.log(`Average data update time: ${result.average}ms`);
 * ```
 */
export async function measureDataUpdatePerformance(
  updateFn: () => Promise<void>,
  iterations: number = 5
): Promise<PerformanceResult> {
  const measurements: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    // Measure data update time
    const start = performance.now();
    await updateFn();
    const end = performance.now();
    
    measurements.push(end - start);
  }
  
  return calculatePerformanceResult(measurements);
}

/**
 * Measures the zoom performance of a visualization component
 * 
 * @param container - The container element
 * @param zoomFn - The function that performs the zoom
 * @param iterations - The number of iterations to run
 * @returns A promise that resolves to the performance result
 * 
 * @example
 * ```tsx
 * const { container } = render(<ScatterPlot data={data} />);
 * const result = await measureZoomPerformance(
 *   container,
 *   async () => {
 *     await simulateZoom(container, 2, 100, 100);
 *   },
 *   10
 * );
 * console.log(`Average zoom time: ${result.average}ms`);
 * ```
 */
export async function measureZoomPerformance(
  container: HTMLElement,
  zoomFn: () => Promise<void>,
  iterations: number = 5
): Promise<PerformanceResult> {
  return measureInteractionPerformance(container, zoomFn, iterations);
}

/**
 * Creates a performance report from multiple performance results
 * 
 * @param results - The performance results
 * @returns The performance report
 * 
 * @example
 * ```tsx
 * const renderingResult = await measureRenderingPerformance(<ScatterPlot data={data} />, 10);
 * const zoomResult = await measureZoomPerformance(container, zoomFn, 10);
 * const report = createPerformanceReport({
 *   rendering: renderingResult,
 *   zoom: zoomResult
 * });
 * console.log(report);
 * ```
 */
export function createPerformanceReport(
  results: Record<string, PerformanceResult>
): string {
  let report = 'Performance Report\n';
  report += '=================\n\n';
  
  for (const [name, result] of Object.entries(results)) {
    report += `${name}:\n`;
    report += `  Average: ${result.average.toFixed(2)}ms\n`;
    report += `  Median: ${result.median.toFixed(2)}ms\n`;
    report += `  Min: ${result.min.toFixed(2)}ms\n`;
    report += `  Max: ${result.max.toFixed(2)}ms\n`;
    report += '\n';
  }
  
  return report;
}

/**
 * Calculates the performance result from measurements
 * 
 * @param measurements - The measurements
 * @returns The performance result
 */
function calculatePerformanceResult(measurements: number[]): PerformanceResult {
  // Sort measurements for median calculation
  const sortedMeasurements = [...measurements].sort((a, b) => a - b);
  
  // Calculate average
  const average = measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  
  // Calculate median
  const middle = Math.floor(sortedMeasurements.length / 2);
  const median = sortedMeasurements.length % 2 === 0
    ? (sortedMeasurements[middle - 1] + sortedMeasurements[middle]) / 2
    : sortedMeasurements[middle];
  
  // Calculate min and max
  const min = sortedMeasurements[0];
  const max = sortedMeasurements[sortedMeasurements.length - 1];
  
  return {
    average,
    median,
    min,
    max,
    measurements
  };
} 