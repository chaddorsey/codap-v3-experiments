/**
 * Visualization Interaction Testing Utilities
 * 
 * This file contains utilities for testing user interactions with visualization components.
 */

import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';

/**
 * Options for simulating zoom
 */
export interface ZoomOptions {
  factor: number;
  point?: { x: number; y: number };
}

/**
 * Options for simulating pan
 */
export interface PanOptions {
  deltaX: number;
  deltaY: number;
}

/**
 * Options for simulating selection
 */
export interface SelectionOptions {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}

/**
 * Simulates zooming on a visualization
 */
export async function simulateZoom(
  element: HTMLElement,
  options: ZoomOptions
): Promise<void> {
  const { factor, point = { x: element.clientWidth / 2, y: element.clientHeight / 2 } } = options;
  
  // Create a wheel event with the zoom factor
  const wheelEvent = new WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    clientX: point.x,
    clientY: point.y,
    deltaY: -factor * 100 // Negative deltaY means zoom in
  });
  
  // Dispatch the wheel event
  element.dispatchEvent(wheelEvent);
}

/**
 * Simulates panning on a visualization
 */
export async function simulatePan(
  element: HTMLElement,
  options: PanOptions
): Promise<void> {
  const { deltaX, deltaY } = options;
  const startX = element.clientWidth / 2;
  const startY = element.clientHeight / 2;
  const endX = startX + deltaX;
  const endY = startY + deltaY;
  
  // Set up user event
  const user = userEvent.setup();
  
  // Simulate mouse down at start position
  fireEvent.mouseDown(element, { clientX: startX, clientY: startY });
  
  // Simulate mouse move to end position
  fireEvent.mouseMove(element, { clientX: endX, clientY: endY });
  
  // Simulate mouse up at end position
  fireEvent.mouseUp(element, { clientX: endX, clientY: endY });
}

/**
 * Simulates selecting data points
 */
export async function simulateSelection(
  element: HTMLElement,
  options: SelectionOptions
): Promise<void> {
  const { startPoint, endPoint } = options;
  
  // Set up user event
  const user = userEvent.setup();
  
  // Simulate mouse down at start position
  fireEvent.mouseDown(element, { clientX: startPoint.x, clientY: startPoint.y });
  
  // Simulate mouse move to end position
  fireEvent.mouseMove(element, { clientX: endPoint.x, clientY: endPoint.y });
  
  // Simulate mouse up at end position
  fireEvent.mouseUp(element, { clientX: endPoint.x, clientY: endPoint.y });
}

/**
 * Simulates keyboard navigation in a visualization
 */
export async function simulateKeyboardNavigation(
  element: HTMLElement,
  keys: string[]
): Promise<void> {
  // Set up user event
  const user = userEvent.setup();
  
  // Focus the element
  element.focus();
  
  // Press each key in sequence
  for (const key of keys) {
    await user.keyboard(`{${key}}`);
  }
}

/**
 * Simulates a double click on a visualization element
 */
export async function simulateDoubleClick(
  element: HTMLElement,
  point: { x: number; y: number } = { 
    x: element.clientWidth / 2, 
    y: element.clientHeight / 2 
  }
): Promise<void> {
  // Set up user event
  const user = userEvent.setup();
  
  // Simulate double click at the specified point
  fireEvent.dblClick(element, { clientX: point.x, clientY: point.y });
}

/**
 * Simulates a right click on a visualization element
 */
export async function simulateRightClick(
  element: HTMLElement,
  point: { x: number; y: number } = { 
    x: element.clientWidth / 2, 
    y: element.clientHeight / 2 
  }
): Promise<void> {
  // Set up user event
  const user = userEvent.setup();
  
  // Simulate right click at the specified point
  fireEvent.contextMenu(element, { clientX: point.x, clientY: point.y });
}

/**
 * Simulates a drag and drop operation
 */
export async function simulateDragAndDrop(
  sourceElement: HTMLElement,
  targetElement: HTMLElement
): Promise<void> {
  // Set up user event
  const user = userEvent.setup();
  
  // Get the center coordinates of the source and target elements
  const sourceRect = sourceElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();
  
  const sourceX = sourceRect.left + sourceRect.width / 2;
  const sourceY = sourceRect.top + sourceRect.height / 2;
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;
  
  // Simulate drag and drop
  fireEvent.mouseDown(sourceElement, { clientX: sourceX, clientY: sourceY });
  fireEvent.mouseMove(document, { clientX: targetX, clientY: targetY });
  fireEvent.mouseUp(targetElement, { clientX: targetX, clientY: targetY });
}

/**
 * Simulates a hover over a visualization element
 */
export async function simulateHover(
  element: HTMLElement,
  point: { x: number; y: number } = { 
    x: element.clientWidth / 2, 
    y: element.clientHeight / 2 
  }
): Promise<void> {
  // Set up user event
  const user = userEvent.setup();
  
  // Simulate hover at the specified point
  fireEvent.mouseOver(element, { clientX: point.x, clientY: point.y });
  fireEvent.mouseMove(element, { clientX: point.x, clientY: point.y });
}

/**
 * Simulates a mouse leave from a visualization element
 */
export async function simulateMouseLeave(
  element: HTMLElement
): Promise<void> {
  // Simulate mouse leave
  fireEvent.mouseLeave(element);
} 