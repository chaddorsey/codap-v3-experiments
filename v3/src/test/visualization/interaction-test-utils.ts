/**
 * Interaction Testing Utilities
 * 
 * This file contains utilities for testing user interactions with visualization components in CODAP v3.
 * These utilities help with simulating mouse and keyboard interactions.
 */

import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';

/**
 * Options for simulating zoom
 */
export interface ZoomOptions {
  /**
   * The zoom factor (> 1 for zoom in, < 1 for zoom out)
   */
  factor: number;
  /**
   * The center point of the zoom (defaults to center of element)
   */
  center?: { x: number; y: number };
}

/**
 * Options for simulating pan
 */
export interface PanOptions {
  /**
   * The x distance to pan
   */
  deltaX: number;
  /**
   * The y distance to pan
   */
  deltaY: number;
}

/**
 * Options for simulating selection
 */
export interface SelectionOptions {
  /**
   * The start point of the selection
   */
  startPoint: { x: number; y: number };
  /**
   * The end point of the selection
   */
  endPoint: { x: number; y: number };
}

/**
 * Options for simulating keyboard navigation
 */
export interface KeyboardNavigationOptions {
  /**
   * The key to press
   */
  key: string;
  /**
   * Whether to hold the shift key
   */
  shift?: boolean;
  /**
   * Whether to hold the ctrl/cmd key
   */
  ctrl?: boolean;
  /**
   * Whether to hold the alt key
   */
  alt?: boolean;
}

/**
 * Simulates a click on a data point
 * 
 * @param dataPointId - The ID of the data point to click
 * @param options - Options for the click event
 * @returns A promise that resolves when the click is complete
 * 
 * @example
 * ```tsx
 * await clickDataPoint('point-1');
 * ```
 */
export async function clickDataPoint(
  dataPointId: string,
  options: { ctrlKey?: boolean; shiftKey?: boolean } = {}
): Promise<void> {
  const dataPoint = screen.getByTestId(dataPointId);
  fireEvent.click(dataPoint, options);
}

/**
 * Simulates a hover on a data point
 * 
 * @param dataPointId - The ID of the data point to hover
 * @returns A promise that resolves when the hover is complete
 * 
 * @example
 * ```tsx
 * await hoverDataPoint('point-1');
 * ```
 */
export async function hoverDataPoint(
  dataPointId: string
): Promise<void> {
  const dataPoint = screen.getByTestId(dataPointId);
  fireEvent.mouseOver(dataPoint);
}

/**
 * Simulates a zoom interaction on a visualization
 * 
 * @param element - The element to zoom on
 * @param zoomFactor - The zoom factor (positive for zoom in, negative for zoom out)
 * @param centerX - The x coordinate of the zoom center
 * @param centerY - The y coordinate of the zoom center
 * @returns A promise that resolves when the zoom is complete
 * 
 * @example
 * ```tsx
 * await simulateZoom(container, 2, 100, 100);
 * ```
 */
export async function simulateZoom(
  element: HTMLElement,
  zoomFactor: number,
  centerX: number,
  centerY: number
): Promise<void> {
  // Calculate the delta based on the zoom factor
  const deltaY = zoomFactor > 0 ? -100 : 100;
  
  // Create a wheel event with the specified parameters
  fireEvent.wheel(element, {
    deltaY,
    clientX: centerX,
    clientY: centerY
  });
}

/**
 * Simulates a pan interaction on a visualization
 * 
 * @param element - The element to pan
 * @param startX - The starting x coordinate
 * @param startY - The starting y coordinate
 * @param endX - The ending x coordinate
 * @param endY - The ending y coordinate
 * @returns A promise that resolves when the pan is complete
 * 
 * @example
 * ```tsx
 * await simulatePan(container, 100, 100, 200, 200);
 * ```
 */
export async function simulatePan(
  element: HTMLElement,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): Promise<void> {
  // Simulate mouse down at the start position
  fireEvent.mouseDown(element, {
    clientX: startX,
    clientY: startY
  });
  
  // Simulate mouse move to the end position
  fireEvent.mouseMove(element, {
    clientX: endX,
    clientY: endY
  });
  
  // Simulate mouse up at the end position
  fireEvent.mouseUp(element, {
    clientX: endX,
    clientY: endY
  });
}

/**
 * Simulates a selection interaction on a visualization
 * 
 * @param element - The element to select on
 * @param startX - The starting x coordinate
 * @param startY - The starting y coordinate
 * @param endX - The ending x coordinate
 * @param endY - The ending y coordinate
 * @returns A promise that resolves when the selection is complete
 * 
 * @example
 * ```tsx
 * await simulateSelection(container, 100, 100, 200, 200);
 * ```
 */
export async function simulateSelection(
  element: HTMLElement,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): Promise<void> {
  // Simulate mouse down at the start position with shift key
  fireEvent.mouseDown(element, {
    clientX: startX,
    clientY: startY,
    shiftKey: true
  });
  
  // Simulate mouse move to the end position
  fireEvent.mouseMove(element, {
    clientX: endX,
    clientY: endY,
    shiftKey: true
  });
  
  // Simulate mouse up at the end position
  fireEvent.mouseUp(element, {
    clientX: endX,
    clientY: endY,
    shiftKey: true
  });
}

/**
 * Simulates keyboard navigation on a visualization
 * 
 * @param key - The key to press
 * @param options - Options for the keyboard event
 * @returns A promise that resolves when the keyboard navigation is complete
 * 
 * @example
 * ```tsx
 * await simulateKeyboardNavigation('ArrowRight');
 * ```
 */
export async function simulateKeyboardNavigation(
  key: string,
  options: { ctrlKey?: boolean; shiftKey?: boolean } = {}
): Promise<void> {
  const user = userEvent.setup();
  await user.keyboard(`{${key}${options.ctrlKey ? '>Control' : ''}${options.shiftKey ? '>Shift' : ''}}`);
}

/**
 * Simulates a drag and drop interaction
 * 
 * @param dragElement - The element to drag
 * @param dropElement - The element to drop onto
 * @returns A promise that resolves when the drag and drop is complete
 * 
 * @example
 * ```tsx
 * await simulateDragAndDrop(
 *   screen.getByTestId('drag-element'),
 *   screen.getByTestId('drop-target')
 * );
 * ```
 */
export async function simulateDragAndDrop(
  dragElement: HTMLElement,
  dropElement: HTMLElement
): Promise<void> {
  // Get the center coordinates of the elements
  const dragRect = dragElement.getBoundingClientRect();
  const dropRect = dropElement.getBoundingClientRect();
  
  const dragX = dragRect.left + dragRect.width / 2;
  const dragY = dragRect.top + dragRect.height / 2;
  const dropX = dropRect.left + dropRect.width / 2;
  const dropY = dropRect.top + dropRect.height / 2;
  
  // Simulate drag start
  fireEvent.dragStart(dragElement);
  
  // Simulate drag over the drop target
  fireEvent.dragOver(dropElement);
  
  // Simulate drop
  fireEvent.drop(dropElement);
  
  // Simulate drag end
  fireEvent.dragEnd(dragElement);
}

/**
 * Simulates a resize interaction on a visualization
 * 
 * @param element - The element to resize
 * @param startWidth - The starting width
 * @param startHeight - The starting height
 * @param endWidth - The ending width
 * @param endHeight - The ending height
 * @returns A promise that resolves when the resize is complete
 * 
 * @example
 * ```tsx
 * await simulateResize(container, 300, 200, 400, 300);
 * ```
 */
export async function simulateResize(
  element: HTMLElement,
  startWidth: number,
  startHeight: number,
  endWidth: number,
  endHeight: number
): Promise<void> {
  // Mock the resize
  Object.defineProperty(element, 'clientWidth', { value: startWidth });
  Object.defineProperty(element, 'clientHeight', { value: startHeight });
  
  // Dispatch a resize event
  window.dispatchEvent(new Event('resize'));
  
  // Update the dimensions
  Object.defineProperty(element, 'clientWidth', { value: endWidth });
  Object.defineProperty(element, 'clientHeight', { value: endHeight });
  
  // Dispatch another resize event
  window.dispatchEvent(new Event('resize'));
}

/**
 * Simulates a touch interaction on a visualization
 * 
 * @param element - The element to touch
 * @param touches - The touch points
 * @returns A promise that resolves when the touch is complete
 * 
 * @example
 * ```tsx
 * await simulateTouch(container, [
 *   { clientX: 100, clientY: 100 },
 *   { clientX: 200, clientY: 200 }
 * ]);
 * ```
 */
export async function simulateTouch(
  element: HTMLElement,
  touches: Array<{ clientX: number; clientY: number }>
): Promise<void> {
  // Create touch objects
  const touchObjects = touches.map((touch, index) => ({
    identifier: index,
    target: element,
    ...touch
  }));
  
  // Create a touch event
  const touchEvent = {
    touches: touchObjects,
    targetTouches: touchObjects,
    changedTouches: touchObjects,
    preventDefault: () => {},
    stopPropagation: () => {}
  };
  
  // Simulate touch start
  fireEvent.touchStart(element, touchEvent);
  
  // Simulate touch move
  fireEvent.touchMove(element, touchEvent);
  
  // Simulate touch end
  fireEvent.touchEnd(element, touchEvent);
} 