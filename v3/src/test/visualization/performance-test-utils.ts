/**
 * Performance Testing Utilities
 * 
 * This file contains utilities for performance testing visualization components in CODAP v3.
 * These utilities help with measuring rendering and interaction performance.
 */

import React, { ComponentType, ReactElement } from 'react';
import { render, act } from '@testing-library/react';

/**
 * Options for performance testing
 */
export interface PerformanceTestOptions {
  /**
   * The number of iterations to run
   */
  iterations?: number;
  /**
   * The number of warmup iterations to run before measuring
   */
  warmupIterations?: number;
  /**
   * Whether to log performance results to the console
   */
  logResults?: boolean;
}

/**
 * Result of a performance test
 */
export interface PerformanceTestResult {
  /**
   * The average time in milliseconds
   */
  averageTime: number;
  /**
   * The median time in milliseconds
   */
  medianTime: number;
  /**
   * The minimum time in milliseconds
   */
  minTime: number;
  /**
   * The maximum time in milliseconds
   */
  maxTime: number;
  /**
   * The standard deviation of the times
   */
  standardDeviation: number;
  /**
   * All measured times in milliseconds
   */
  times: number[];
}

/**
 * Measures the rendering performance of a component
 * 
 * @param Component - The component to measure
 * @param props - The props to pass to the component
 * @param options - Options for the performance test
 * @returns A promise that resolves to the performance test result
 * 
 * @example
 * ```tsx
 * const result = await measureRenderingPerformance(
 *   ScatterPlot,
 *   { data: testData },
 *   { iterations: 10 }
 * );
 * 
 * expect(result.medianTime).toBeLessThan(50);
 * ```
 */
export async function measureRenderingPerformance<P extends object>(
  Component: ComponentType<P>,
  props: P,
  options: PerformanceTestOptions = {}
): Promise<PerformanceTestResult> {
  const { iterations = 5, warmupIterations = 2, logResults = false } = options;
  
  // Create a container for rendering
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  // Run warmup iterations
  for (let i = 0; i < warmupIterations; i++) {
    const element = React.createElement(Component, props);
    render(element, { container });
    container.innerHTML = '';
  }
  
  // Measure rendering performance
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    // Measure the time it takes to render the component
    const startTime = performance.now();
    
    await act(async () => {
      const element = React.createElement(Component, props);
      render(element, { container });
    });
    
    const endTime = performance.now();
    times.push(endTime - startTime);
    
    // Clean up
    container.innerHTML = '';
  }
  
  // Clean up the container
  document.body.removeChild(container);
  
  // Calculate statistics
  const result = calculatePerformanceStatistics(times);
  
  // Log results if requested
  if (logResults) {
    console.log(`Rendering performance for ${Component.name || 'Component'}:`);
    console.log(`  Average: ${result.averageTime.toFixed(2)}ms`);
    console.log(`  Median: ${result.medianTime.toFixed(2)}ms`);
    console.log(`  Min: ${result.minTime.toFixed(2)}ms`);
    console.log(`  Max: ${result.maxTime.toFixed(2)}ms`);
    console.log(`  Standard Deviation: ${result.standardDeviation.toFixed(2)}ms`);
  }
  
  return result;
}

/**
 * Measures the interaction performance of a component
 * 
 * @param element - The element to interact with
 * @param interaction - The interaction function to measure
 * @param options - Options for the performance test
 * @returns A promise that resolves to the performance test result
 * 
 * @example
 * ```tsx
 * const interaction = async () => {
 *   await simulateZoom(container, { factor: 1.2 });
 * };
 * 
 * const result = await measureInteractionPerformance(
 *   container,
 *   interaction,
 *   { iterations: 5 }
 * );
 * 
 * expect(result.medianTime).toBeLessThan(20);
 * ```
 */
export async function measureInteractionPerformance(
  element: HTMLElement,
  interaction: () => Promise<void>,
  options: PerformanceTestOptions = {}
): Promise<PerformanceTestResult> {
  const { iterations = 5, warmupIterations = 2, logResults = false } = options;
  
  // Run warmup iterations
  for (let i = 0; i < warmupIterations; i++) {
    await interaction();
  }
  
  // Measure interaction performance
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    // Measure the time it takes to perform the interaction
    const startTime = performance.now();
    
    await act(async () => {
      await interaction();
    });
    
    const endTime = performance.now();
    times.push(endTime - startTime);
  }
  
  // Calculate statistics
  const result = calculatePerformanceStatistics(times);
  
  // Log results if requested
  if (logResults) {
    console.log('Interaction performance:');
    console.log(`  Average: ${result.averageTime.toFixed(2)}ms`);
    console.log(`  Median: ${result.medianTime.toFixed(2)}ms`);
    console.log(`  Min: ${result.minTime.toFixed(2)}ms`);
    console.log(`  Max: ${result.maxTime.toFixed(2)}ms`);
    console.log(`  Standard Deviation: ${result.standardDeviation.toFixed(2)}ms`);
  }
  
  return result;
}

/**
 * Measures the data update performance of a component
 * 
 * @param element - The element to update
 * @param dataUpdate - The function to update the data
 * @param initialData - The initial data
 * @param updateCallback - The function to call to update the component
 * @param options - Options for the performance test
 * @returns A promise that resolves to the performance test result
 * 
 * @example
 * ```tsx
 * const updateData = (data) => {
 *   return data.map(point => ({
 *     ...point,
 *     y: point.y + 1
 *   }));
 * };
 * 
 * const result = await measureDataUpdatePerformance(
 *   container,
 *   updateData,
 *   testData,
 *   setData,
 *   { iterations: 5 }
 * );
 * 
 * expect(result.medianTime).toBeLessThan(30);
 * ```
 */
export async function measureDataUpdatePerformance<T>(
  element: HTMLElement,
  dataUpdate: (data: T) => T,
  initialData: T,
  updateCallback: (data: T) => void,
  options: PerformanceTestOptions = {}
): Promise<PerformanceTestResult> {
  const { iterations = 5, warmupIterations = 2, logResults = false } = options;
  
  // Make a copy of the initial data
  let data = { ...initialData } as T;
  
  // Run warmup iterations
  for (let i = 0; i < warmupIterations; i++) {
    data = dataUpdate(data);
    updateCallback(data);
  }
  
  // Measure data update performance
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    // Update the data
    data = dataUpdate(data);
    
    // Measure the time it takes to update the component
    const startTime = performance.now();
    
    await act(async () => {
      updateCallback(data);
    });
    
    const endTime = performance.now();
    times.push(endTime - startTime);
  }
  
  // Calculate statistics
  const result = calculatePerformanceStatistics(times);
  
  // Log results if requested
  if (logResults) {
    console.log('Data update performance:');
    console.log(`  Average: ${result.averageTime.toFixed(2)}ms`);
    console.log(`  Median: ${result.medianTime.toFixed(2)}ms`);
    console.log(`  Min: ${result.minTime.toFixed(2)}ms`);
    console.log(`  Max: ${result.maxTime.toFixed(2)}ms`);
    console.log(`  Standard Deviation: ${result.standardDeviation.toFixed(2)}ms`);
  }
  
  return result;
}

/**
 * Creates a performance report from a performance test result
 * 
 * @param testName - The name of the test
 * @param result - The performance test result
 * @returns A formatted performance report
 * 
 * @example
 * ```tsx
 * const report = createPerformanceReport('Scatter Plot Rendering', result);
 * console.log(report);
 * ```
 */
export function createPerformanceReport(
  testName: string,
  result: PerformanceTestResult
): string {
  return `
Performance Test: ${testName}
---------------------------
Average: ${result.averageTime.toFixed(2)}ms
Median: ${result.medianTime.toFixed(2)}ms
Min: ${result.minTime.toFixed(2)}ms
Max: ${result.maxTime.toFixed(2)}ms
Standard Deviation: ${result.standardDeviation.toFixed(2)}ms
Sample Size: ${result.times.length}
`.trim();
}

/**
 * Calculates performance statistics from an array of times
 * 
 * @param times - The array of times
 * @returns The performance statistics
 */
function calculatePerformanceStatistics(times: number[]): PerformanceTestResult {
  // Sort the times for median and min/max
  const sortedTimes = [...times].sort((a, b) => a - b);
  
  // Calculate average
  const sum = sortedTimes.reduce((acc, time) => acc + time, 0);
  const average = sum / sortedTimes.length;
  
  // Calculate median
  const middle = Math.floor(sortedTimes.length / 2);
  const median = sortedTimes.length % 2 === 0
    ? (sortedTimes[middle - 1] + sortedTimes[middle]) / 2
    : sortedTimes[middle];
  
  // Calculate min and max
  const min = sortedTimes[0];
  const max = sortedTimes[sortedTimes.length - 1];
  
  // Calculate standard deviation
  const squaredDifferences = sortedTimes.map(time => Math.pow(time - average, 2));
  const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / sortedTimes.length;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    averageTime: average,
    medianTime: median,
    minTime: min,
    maxTime: max,
    standardDeviation,
    times: sortedTimes
  };
} 