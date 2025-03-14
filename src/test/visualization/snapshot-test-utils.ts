/**
 * Visualization Snapshot Testing Utilities
 * 
 * This file contains utilities for snapshot testing visualization components.
 */

/**
 * Options for creating a visualization snapshot
 */
export interface SnapshotOptions {
  removeAnimations?: boolean;
  excludeElements?: string[];
}

/**
 * Options for comparing a visualization with a baseline
 */
export interface ComparisonOptions {
  tolerance?: number;
  ignoreColors?: boolean;
}

/**
 * Creates a snapshot of a visualization component
 */
export function snapshotVisualization(
  component: HTMLElement,
  options: SnapshotOptions = {}
): string {
  const { removeAnimations = true, excludeElements = [] } = options;
  
  // Clone the component to avoid modifying the original
  const clone = component.cloneNode(true) as HTMLElement;
  
  // Remove animations if requested
  if (removeAnimations) {
    const styleElements = clone.querySelectorAll('style');
    styleElements.forEach(style => {
      const cssText = style.textContent || '';
      // Remove animation-related CSS
      style.textContent = cssText.replace(/@keyframes\s+\w+\s*{[^}]*}/g, '');
    });
    
    // Remove animation styles from elements
    const animatedElements = clone.querySelectorAll('[style*="animation"]');
    animatedElements.forEach(element => {
      const style = (element as HTMLElement).style;
      style.animation = '';
      style.transition = '';
    });
  }
  
  // Remove excluded elements
  excludeElements.forEach(selector => {
    const elements = clone.querySelectorAll(selector);
    elements.forEach(element => element.remove());
  });
  
  // Convert the component to a string representation
  return clone.outerHTML;
}

/**
 * Compares a visualization with a baseline snapshot
 */
export function compareWithBaseline(
  component: HTMLElement,
  baselineSnapshot: string,
  options: ComparisonOptions = {}
): { matches: boolean; differences?: string[] } {
  const { tolerance = 0, ignoreColors = false } = options;
  
  // Create a snapshot of the current component
  const currentSnapshot = snapshotVisualization(component);
  
  // If the snapshots are identical, return a match
  if (currentSnapshot === baselineSnapshot) {
    return { matches: true };
  }
  
  // Parse the snapshots into DOM elements for comparison
  const parser = new DOMParser();
  const currentDoc = parser.parseFromString(currentSnapshot, 'text/html');
  const baselineDoc = parser.parseFromString(baselineSnapshot, 'text/html');
  
  // Compare the DOM structures
  const differences: string[] = [];
  compareElements(currentDoc.body, baselineDoc.body, differences, { tolerance, ignoreColors });
  
  return {
    matches: differences.length === 0,
    differences
  };
}

/**
 * Recursively compares two DOM elements
 */
function compareElements(
  current: Element,
  baseline: Element,
  differences: string[],
  options: ComparisonOptions
): void {
  const { tolerance = 0, ignoreColors = false } = options;
  
  // Compare tag names
  if (current.tagName !== baseline.tagName) {
    differences.push(`Tag name mismatch: ${current.tagName} vs ${baseline.tagName}`);
    return;
  }
  
  // Compare attributes
  const currentAttrs = Array.from(current.attributes);
  const baselineAttrs = Array.from(baseline.attributes);
  
  // Check if current has attributes that baseline doesn't
  currentAttrs.forEach(attr => {
    const baselineAttr = baseline.getAttribute(attr.name);
    
    // Skip color attributes if ignoring colors
    if (ignoreColors && (
      attr.name === 'fill' || 
      attr.name === 'stroke' || 
      (attr.name === 'style' && attr.value.includes('color'))
    )) {
      return;
    }
    
    // Skip data-testid attributes
    if (attr.name === 'data-testid') {
      return;
    }
    
    if (baselineAttr === null) {
      differences.push(`Attribute ${attr.name} exists in current but not in baseline`);
    } else if (attr.value !== baselineAttr) {
      // For numeric values, check if they're within tolerance
      const currentValue = parseFloat(attr.value);
      const baselineValue = parseFloat(baselineAttr);
      
      if (!isNaN(currentValue) && !isNaN(baselineValue)) {
        if (Math.abs(currentValue - baselineValue) > tolerance) {
          differences.push(`Attribute ${attr.name} value mismatch: ${attr.value} vs ${baselineAttr}`);
        }
      } else {
        differences.push(`Attribute ${attr.name} value mismatch: ${attr.value} vs ${baselineAttr}`);
      }
    }
  });
  
  // Check if baseline has attributes that current doesn't
  baselineAttrs.forEach(attr => {
    // Skip color attributes if ignoring colors
    if (ignoreColors && (
      attr.name === 'fill' || 
      attr.name === 'stroke' || 
      (attr.name === 'style' && attr.value.includes('color'))
    )) {
      return;
    }
    
    // Skip data-testid attributes
    if (attr.name === 'data-testid') {
      return;
    }
    
    if (current.getAttribute(attr.name) === null) {
      differences.push(`Attribute ${attr.name} exists in baseline but not in current`);
    }
  });
  
  // Compare children
  const currentChildren = Array.from(current.children);
  const baselineChildren = Array.from(baseline.children);
  
  if (currentChildren.length !== baselineChildren.length) {
    differences.push(`Child count mismatch: ${currentChildren.length} vs ${baselineChildren.length}`);
  }
  
  // Compare the children that exist in both
  const minLength = Math.min(currentChildren.length, baselineChildren.length);
  for (let i = 0; i < minLength; i++) {
    compareElements(currentChildren[i], baselineChildren[i], differences, options);
  }
}

/**
 * Saves a baseline snapshot for a visualization component
 */
export function saveBaselineSnapshot(
  component: HTMLElement,
  options: SnapshotOptions = {}
): string {
  return snapshotVisualization(component, options);
}

/**
 * Loads a baseline snapshot from a string
 */
export function loadBaselineSnapshot(snapshot: string): HTMLElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(snapshot, 'text/html');
  return doc.body.firstElementChild as HTMLElement;
} 