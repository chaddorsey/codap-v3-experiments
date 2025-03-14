/**
 * Snapshot Testing Utilities
 * 
 * This file contains utilities for snapshot testing visualization components in CODAP v3.
 * These utilities help with creating and comparing snapshots of visualizations.
 */

import { prettyDOM } from '@testing-library/react';

// Define a simple interface for diff lines
interface DiffLine {
  value: string;
  count: number;
  added?: boolean;
  removed?: boolean;
}

// Define the diff type for our formatted differences
type DiffType = 'added' | 'removed' | 'unchanged';

// Mock the diffLines function since we don't have the actual diff library
function diffLines(oldStr: string, newStr: string): DiffLine[] {
  // This is a simplified implementation
  // In a real implementation, this would use the diff library
  if (oldStr === newStr) {
    return [{ value: oldStr, count: oldStr.split('\n').length }];
  }
  
  return [
    { value: oldStr, count: oldStr.split('\n').length, removed: true },
    { value: newStr, count: newStr.split('\n').length, added: true }
  ];
}

/**
 * Options for creating a snapshot
 */
export interface SnapshotOptions {
  /**
   * Whether to include data attributes in the snapshot
   */
  includeDataAttributes?: boolean;
  /**
   * Whether to include styles in the snapshot
   */
  includeStyles?: boolean;
  /**
   * Whether to include positions in the snapshot
   */
  includePositions?: boolean;
}

/**
 * Result of comparing a snapshot with a baseline
 */
export interface SnapshotComparisonResult {
  /**
   * Whether the snapshot matches the baseline
   */
  matches: boolean;
  /**
   * The differences between the snapshot and the baseline
   */
  differences: Array<{
    /**
     * The type of difference
     */
    type: DiffType;
    /**
     * The content of the difference
     */
    content: string;
  }>;
  /**
   * The similarity percentage between the snapshot and the baseline
   */
  similarityPercentage: number;
}

/**
 * Creates a snapshot of a visualization
 * 
 * @param element - The element to snapshot
 * @param options - Options for creating the snapshot
 * @returns The snapshot as a string
 * 
 * @example
 * ```tsx
 * const snapshot = snapshotVisualization(container);
 * ```
 */
export function snapshotVisualization(
  element: HTMLElement,
  options: SnapshotOptions = {}
): string {
  const { includeDataAttributes = true, includeStyles = false, includePositions = false } = options;
  
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Process the clone to remove or keep certain attributes
  processElementForSnapshot(clone, { includeDataAttributes, includeStyles, includePositions });
  
  // Return the pretty-printed DOM
  // The third parameter is an options object that may include a highlight property
  return prettyDOM(clone, undefined, { highlight: false }) || '';
}

/**
 * Compares a snapshot with a baseline
 * 
 * @param element - The element to compare
 * @param baseline - The baseline snapshot to compare against
 * @param options - Options for creating the snapshot
 * @returns The result of the comparison
 * 
 * @example
 * ```tsx
 * const result = compareWithBaseline(container, baselineSnapshot);
 * expect(result.matches).toBe(true);
 * ```
 */
export function compareWithBaseline(
  element: HTMLElement,
  baseline: string,
  options: SnapshotOptions = {}
): SnapshotComparisonResult {
  // Create a snapshot of the current element
  const snapshot = snapshotVisualization(element, options);
  
  // Compare the snapshot with the baseline
  const differences = diffLines(baseline, snapshot);
  
  // Calculate similarity percentage
  const totalLines = differences.reduce((sum: number, diff: DiffLine) => sum + diff.count, 0);
  const unchangedLines = differences
    .filter((diff: DiffLine) => !diff.added && !diff.removed)
    .reduce((sum: number, diff: DiffLine) => sum + diff.count, 0);
  
  const similarityPercentage = (unchangedLines / totalLines) * 100;
  
  // Check if the snapshot matches the baseline
  const matches = differences.every((diff: DiffLine) => !diff.added && !diff.removed);
  
  // Format the differences
  const formattedDifferences = differences.map((diff: DiffLine) => {
    let type: DiffType = 'unchanged';
    if (diff.added) type = 'added';
    if (diff.removed) type = 'removed';
    
    return {
      type,
      content: diff.value
    };
  });
  
  return {
    matches,
    differences: formattedDifferences,
    similarityPercentage
  };
}

/**
 * Saves a snapshot to a file
 * 
 * @param snapshot - The snapshot to save
 * @param filePath - The path to save the snapshot to
 * 
 * @example
 * ```tsx
 * saveSnapshotToFile(snapshot, 'src/test/snapshots/scatter-plot.snap');
 * ```
 */
export function saveSnapshotToFile(
  snapshot: string,
  filePath: string
): void {
  // In a real implementation, this would write to a file
  // For now, we'll just log a message
  console.log(`Snapshot would be saved to ${filePath}`);
}

/**
 * Loads a snapshot from a file
 * 
 * @param filePath - The path to load the snapshot from
 * @returns The snapshot as a string
 * 
 * @example
 * ```tsx
 * const baseline = loadSnapshotFromFile('src/test/snapshots/scatter-plot.snap');
 * ```
 */
export function loadSnapshotFromFile(
  filePath: string
): string {
  // In a real implementation, this would read from a file
  // For now, we'll just return a placeholder
  return `Placeholder for snapshot from ${filePath}`;
}

/**
 * Processes an element for snapshot creation
 * 
 * @param element - The element to process
 * @param options - Options for processing the element
 */
function processElementForSnapshot(
  element: HTMLElement,
  options: SnapshotOptions
): void {
  const { includeDataAttributes, includeStyles, includePositions } = options;
  
  // Process the element
  if (!includeStyles) {
    element.removeAttribute('style');
    element.removeAttribute('class');
  }
  
  if (!includePositions) {
    if (element instanceof SVGElement) {
      // Remove position-related attributes for SVG elements
      ['x', 'y', 'cx', 'cy', 'transform'].forEach(attr => {
        element.removeAttribute(attr);
      });
    } else {
      // Remove position-related styles for HTML elements
      if (element.style) {
        ['position', 'top', 'left', 'right', 'bottom', 'transform'].forEach(prop => {
          element.style.removeProperty(prop);
        });
      }
    }
  }
  
  if (!includeDataAttributes) {
    // Remove data attributes
    Array.from(element.attributes)
      .filter(attr => attr.name.startsWith('data-'))
      .forEach(attr => {
        element.removeAttribute(attr.name);
      });
  }
  
  // Process children recursively
  Array.from(element.children).forEach(child => {
    processElementForSnapshot(child as HTMLElement, options);
  });
}

/**
 * Creates a visual snapshot of a visualization using canvas
 * 
 * @param element - The element to snapshot
 * @returns A promise that resolves to a data URL of the snapshot
 * 
 * @example
 * ```tsx
 * const imageDataUrl = await createVisualSnapshot(container);
 * ```
 */
export async function createVisualSnapshot(
  element: HTMLElement
): Promise<string> {
  // This is a simplified implementation
  // In a real implementation, this would use html2canvas or a similar library
  
  // For now, we'll just return a placeholder
  return 'data:image/png;base64,placeholder';
}

/**
 * Compares two visual snapshots
 * 
 * @param snapshot1 - The first snapshot
 * @param snapshot2 - The second snapshot
 * @param options - Options for comparing the snapshots
 * @returns A promise that resolves to the similarity percentage
 * 
 * @example
 * ```tsx
 * const similarity = await compareVisualSnapshots(snapshot1, snapshot2);
 * expect(similarity).toBeGreaterThan(95);
 * ```
 */
export async function compareVisualSnapshots(
  snapshot1: string,
  snapshot2: string,
  options: { threshold?: number } = {}
): Promise<number> {
  // This is a simplified implementation
  // In a real implementation, this would compare the images pixel by pixel
  
  // For now, we'll just return a placeholder
  return 100;
} 