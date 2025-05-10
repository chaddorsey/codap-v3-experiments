/**
 * Visualization Performance Testing Utilities
 * 
 * This file contains utilities for testing the performance of visualization components.
 */

import React from 'react';
import { render, act } from '@testing-library/react';

/**
 * Performance measurement result
 */
export interface PerformanceResult {
  averageTime: number;
  medianTime: number;
  minTime: number;
  maxTime: number;
  samples: number[];
}

/**
 * Options for measuring rendering performance
 */
export interface RenderingPerformanceOptions {
  iterations?: number;
  warmupIterations?: number;
}

/**
 * Options for measuring interaction performance
 */
export interface InteractionPerformanceOptions {
  iterations?: number;
  warmupIterations?: number;
}

/**
 * Measures the rendering performance of a visualization component
 */
export async function measureRenderingPerformance<P>(
  Component: React.ComponentType<P>,
  props: P,
  options: RenderingPerformanceOptions = {}
): Promise<PerformanceResult> {
  const { iterations = 10, warmupIterations = 3 } = options;
  const times: number[] = [];
  
  // Warm-up phase
  for (let i = 0; i < warmupIterations; i++) {
    const { unmount } = render(React.createElement(Component, props));
    unmount();
  }
  
  // Measurement phase
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    const { unmount } = render(React.createElement(Component, props));
    
    // Force a synchronous layout to ensure rendering is complete
    // eslint-disable-next-line no-unused-expressions
    document.body.offsetHeight;
    
    const end = performance.now();
    times.push(end - start);
    
    unmount();
  }
  
  return calculatePerformanceResult(times);
}

/**
 * Measures the performance of interactions with a visualization
 */
export async function measureInteractionPerformance(
  element: HTMLElement,
  interaction: () => Promise<void>,
  options: InteractionPerformanceOptions = {}
): Promise<PerformanceResult> {
  const { iterations = 10, warmupIterations = 3 } = options;
  const times: number[] = [];
  
  // Warm-up phase
  for (let i = 0; i < warmupIterations; i++) {
    await interaction();
  }
  
  // Measurement phase
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    await act(async () => {
      await interaction();
    });
    
    const end = performance.now();
    times.push(end - start);
  }
  
  return calculatePerformanceResult(times);
}

/**
 * Measures the performance of data updates in a visualization
 */
export async function measureDataUpdatePerformance<T>(
  element: HTMLElement,
  dataUpdate: (data: T) => T,
  initialData: T,
  updateData: (data: T) => void,
  options: InteractionPerformanceOptions = {}
): Promise<PerformanceResult> {
  const { iterations = 10, warmupIterations = 3 } = options;
  const times: number[] = [];
  let currentData = initialData;
  
  // Warm-up phase
  for (let i = 0; i < warmupIterations; i++) {
    currentData = dataUpdate(currentData);
    await act(async () => {
      updateData(currentData);
    });
  }
  
  // Measurement phase
  for (let i = 0; i < iterations; i++) {
    currentData = dataUpdate(currentData);
    
    const start = performance.now();
    
    await act(async () => {
      updateData(currentData);
    });
    
    // Force a synchronous layout to ensure rendering is complete
    // eslint-disable-next-line no-unused-expressions
    element.offsetHeight;
    
    const end = performance.now();
    times.push(end - start);
  }
  
  return calculatePerformanceResult(times);
}

/**
 * Measures the performance of zooming in a visualization
 */
export async function measureZoomPerformance(
  element: HTMLElement,
  zoomIn: () => Promise<void>,
  zoomOut: () => Promise<void>,
  options: InteractionPerformanceOptions = {}
): Promise<PerformanceResult> {
  const { iterations = 10, warmupIterations = 3 } = options;
  const times: number[] = [];
  
  // Warm-up phase
  for (let i = 0; i < warmupIterations; i++) {
    await zoomIn();
    await zoomOut();
  }
  
  // Measurement phase
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    await act(async () => {
      await zoomIn();
    });
    
    const end = performance.now();
    times.push(end - start);
    
    // Reset zoom for next iteration
    await act(async () => {
      await zoomOut();
    });
  }
  
  return calculatePerformanceResult(times);
}

/**
 * Measures the performance of panning in a visualization
 */
export async function measurePanPerformance(
  element: HTMLElement,
  panRight: () => Promise<void>,
  panLeft: () => Promise<void>,
  options: InteractionPerformanceOptions = {}
): Promise<PerformanceResult> {
  const { iterations = 10, warmupIterations = 3 } = options;
  const times: number[] = [];
  
  // Warm-up phase
  for (let i = 0; i < warmupIterations; i++) {
    await panRight();
    await panLeft();
  }
  
  // Measurement phase
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    await act(async () => {
      await panRight();
    });
    
    const end = performance.now();
    times.push(end - start);
    
    // Reset pan for next iteration
    await act(async () => {
      await panLeft();
    });
  }
  
  return calculatePerformanceResult(times);
}

/**
 * Calculates performance metrics from an array of timing samples
 */
function calculatePerformanceResult(times: number[]): PerformanceResult {
  // Sort the times for calculating median
  const sortedTimes = [...times].sort((a, b) => a - b);
  
  // Calculate average
  const sum = sortedTimes.reduce((acc, time) => acc + time, 0);
  const average = sum / sortedTimes.length;
  
  // Calculate median
  const middle = Math.floor(sortedTimes.length / 2);
  const median = sortedTimes.length % 2 === 0
    ? (sortedTimes[middle - 1] + sortedTimes[middle]) / 2
    : sortedTimes[middle];
  
  // Find min and max
  const min = sortedTimes[0];
  const max = sortedTimes[sortedTimes.length - 1];
  
  return {
    averageTime: average,
    medianTime: median,
    minTime: min,
    maxTime: max,
    samples: times
  };
}

/**
 * Creates a performance benchmark report
 */
export function createPerformanceReport(
  testName: string,
  result: PerformanceResult,
  threshold?: number
): string {
  const { averageTime, medianTime, minTime, maxTime, samples } = result;
  
  let report = `Performance Test: ${testName}\n`;
  report += `Average Time: ${averageTime.toFixed(2)}ms\n`;
  report += `Median Time: ${medianTime.toFixed(2)}ms\n`;
  report += `Min Time: ${minTime.toFixed(2)}ms\n`;
  report += `Max Time: ${maxTime.toFixed(2)}ms\n`;
  
  if (threshold !== undefined) {
    const passed = medianTime <= threshold;
    report += `Threshold: ${threshold.toFixed(2)}ms\n`;
    report += `Status: ${passed ? 'PASSED' : 'FAILED'}\n`;
  }
  
  return report;
} 