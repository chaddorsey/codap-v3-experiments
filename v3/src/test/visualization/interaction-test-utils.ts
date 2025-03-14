/**
 * Interaction Testing Utilities
 * 
 * This file contains utilities for testing user interactions with visualization components in CODAP v3.
 * These utilities help with simulating mouse and keyboard interactions.
 */

import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
 * Simulates a zoom interaction on a visualization
 * 
 * @param element - The element to zoom on
 * @param options - Options for the zoom
 * @returns A promise that resolves when the zoom is complete
 * 
 * @example
 * ```tsx
 * await simulateZoom(container, { factor: 1.5 });
 * ```
 */
export async function simulateZoom(
  element: HTMLElement,
  options: ZoomOptions
): Promise<void> {
  const { factor, center } = options;
  
  // Calculate center point if not provided
  const rect = element.getBoundingClientRect();
  const centerX = center?.x ?? rect.left + rect.width / 2;
  const centerY = center?.y ?? rect.top + rect.height / 2;
  
  // Calculate delta based on factor
  // Positive delta for zoom in, negative for zoom out
  const delta = factor > 1 ? -100 : 100;
  
  // Fire wheel event
  fireEvent.wheel(element, {
    clientX: centerX,
    clientY: centerY,
    deltaY: delta,
    deltaMode: 0 // Pixel mode
  });
}

/**
 * Simulates a pan interaction on a visualization
 * 
 * @param element - The element to pan
 * @param options - Options for the pan
 * @returns A promise that resolves when the pan is complete
 * 
 * @example
 * ```tsx
 * await simulatePan(container, { deltaX: 10, deltaY: 20 });
 * ```
 */
export async function simulatePan(
  element: HTMLElement,
  options: PanOptions
): Promise<void> {
  const { deltaX, deltaY } = options;
  
  // Calculate start and end points
  const rect = element.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;
  const endX = startX + deltaX;
  const endY = startY + deltaY;
  
  // Simulate mouse down
  fireEvent.mouseDown(element, {
    clientX: startX,
    clientY: startY,
    button: 0 // Left button
  });
  
  // Simulate mouse move
  fireEvent.mouseMove(element, {
    clientX: endX,
    clientY: endY,
    button: 0 // Left button
  });
  
  // Simulate mouse up
  fireEvent.mouseUp(element, {
    clientX: endX,
    clientY: endY,
    button: 0 // Left button
  });
}

/**
 * Simulates a selection interaction on a visualization
 * 
 * @param element - The element to select on
 * @param options - Options for the selection
 * @returns A promise that resolves when the selection is complete
 * 
 * @example
 * ```tsx
 * await simulateSelection(container, {
 *   startPoint: { x: 10, y: 10 },
 *   endPoint: { x: 100, y: 100 }
 * });
 * ```
 */
export async function simulateSelection(
  element: HTMLElement,
  options: SelectionOptions
): Promise<void> {
  const { startPoint, endPoint } = options;
  
  // Simulate mouse down at start point
  fireEvent.mouseDown(element, {
    clientX: startPoint.x,
    clientY: startPoint.y,
    button: 0 // Left button
  });
  
  // Simulate mouse move to end point
  fireEvent.mouseMove(element, {
    clientX: endPoint.x,
    clientY: endPoint.y,
    button: 0 // Left button
  });
  
  // Simulate mouse up at end point
  fireEvent.mouseUp(element, {
    clientX: endPoint.x,
    clientY: endPoint.y,
    button: 0 // Left button
  });
}

/**
 * Simulates a keyboard navigation interaction on a visualization
 * 
 * @param element - The element to navigate
 * @param options - Options for the keyboard navigation
 * @returns A promise that resolves when the keyboard navigation is complete
 * 
 * @example
 * ```tsx
 * await simulateKeyboardNavigation(container, { key: 'ArrowRight' });
 * ```
 */
export async function simulateKeyboardNavigation(
  element: HTMLElement,
  options: KeyboardNavigationOptions
): Promise<void> {
  const { key, shift = false, ctrl = false, alt = false } = options;
  
  // Focus the element first
  element.focus();
  
  // Create key sequence with modifiers if needed
  let keySequence = '';
  if (shift) keySequence += '{Shift>}';
  if (ctrl) keySequence += '{Control>}';
  if (alt) keySequence += '{Alt>}';
  
  keySequence += `{${key}}`;
  
  // Release modifiers
  if (alt) keySequence += '{/Alt}';
  if (ctrl) keySequence += '{/Control}';
  if (shift) keySequence += '{/Shift}';
  
  // Simulate key press
  await userEvent.keyboard(keySequence);
}

/**
 * Simulates a drag and drop interaction on a visualization
 * 
 * @param source - The source element to drag from
 * @param target - The target element to drop on
 * @returns A promise that resolves when the drag and drop is complete
 * 
 * @example
 * ```tsx
 * await simulateDragAndDrop(sourceElement, targetElement);
 * ```
 */
export async function simulateDragAndDrop(
  source: HTMLElement,
  target: HTMLElement
): Promise<void> {
  // Get source and target rectangles
  const sourceRect = source.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  
  // Calculate center points
  const sourceX = sourceRect.left + sourceRect.width / 2;
  const sourceY = sourceRect.top + sourceRect.height / 2;
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;
  
  // Simulate drag start
  fireEvent.dragStart(source, {
    clientX: sourceX,
    clientY: sourceY
  });
  
  // Simulate drag over target
  fireEvent.dragOver(target, {
    clientX: targetX,
    clientY: targetY
  });
  
  // Simulate drop on target
  fireEvent.drop(target, {
    clientX: targetX,
    clientY: targetY
  });
  
  // Simulate drag end
  fireEvent.dragEnd(source, {
    clientX: targetX,
    clientY: targetY
  });
}

/**
 * Simulates a hover interaction on a visualization element
 * 
 * @param element - The element to hover over
 * @returns A promise that resolves when the hover is complete
 * 
 * @example
 * ```tsx
 * await simulateHover(element);
 * ```
 */
export async function simulateHover(
  element: HTMLElement
): Promise<void> {
  await userEvent.hover(element);
}

/**
 * Simulates a click interaction on a visualization element
 * 
 * @param element - The element to click
 * @param options - Options for the click
 * @returns A promise that resolves when the click is complete
 * 
 * @example
 * ```tsx
 * await simulateClick(element, { shift: true });
 * ```
 */
export async function simulateClick(
  element: HTMLElement,
  options: { shift?: boolean; ctrl?: boolean; alt?: boolean } = {}
): Promise<void> {
  const { shift = false, ctrl = false, alt = false } = options;
  
  // Use fireEvent instead of userEvent for more control over modifiers
  fireEvent.click(element, {
    shiftKey: shift,
    ctrlKey: ctrl,
    altKey: alt
  });
} 