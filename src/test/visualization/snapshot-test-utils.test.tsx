/**
 * Tests for Visualization Snapshot Testing Utilities
 */

import React from 'react';
import { render } from '@testing-library/react';
import { 
  snapshotVisualization, 
  compareWithBaseline,
  saveBaselineSnapshot,
  loadBaselineSnapshot
} from './snapshot-test-utils';

// Simple visualization component for testing
const SimpleVisualization: React.FC<{ color?: string; showAnimation?: boolean }> = ({ 
  color = 'blue', 
  showAnimation = false 
}) => {
  return (
    <div data-testid="simple-visualization">
      <svg width="100" height="100">
        <circle cx="50" cy="50" r="40" fill={color} />
        {showAnimation && (
          <style>
            {`
              @keyframes pulse {
                0% { r: 40; }
                50% { r: 45; }
                100% { r: 40; }
              }
            `}
          </style>
        )}
        {showAnimation && (
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="transparent" 
            stroke="red" 
            style={{ animation: 'pulse 1s infinite' }} 
          />
        )}
      </svg>
      <div data-testid="excluded-element">This can be excluded</div>
    </div>
  );
};

describe('Visualization Snapshot Testing Utilities', () => {
  describe('snapshotVisualization', () => {
    it('should create a snapshot of a visualization component', () => {
      const { container } = render(<SimpleVisualization />);
      const visualization = container.firstChild as HTMLElement;
      
      const snapshot = snapshotVisualization(visualization);
      
      expect(snapshot).toContain('<circle cx="50" cy="50" r="40" fill="blue"></circle>');
      expect(snapshot).toContain('data-testid="excluded-element"');
    });
    
    it('should remove animations from the snapshot if requested', () => {
      const { container } = render(<SimpleVisualization showAnimation={true} />);
      const visualization = container.firstChild as HTMLElement;
      
      const snapshot = snapshotVisualization(visualization, { removeAnimations: true });
      
      expect(snapshot).not.toContain('@keyframes pulse');
      expect(snapshot).not.toContain('animation:');
    });
    
    it('should exclude specified elements from the snapshot', () => {
      const { container } = render(<SimpleVisualization />);
      const visualization = container.firstChild as HTMLElement;
      
      const snapshot = snapshotVisualization(visualization, { 
        excludeElements: ['[data-testid="excluded-element"]'] 
      });
      
      expect(snapshot).not.toContain('data-testid="excluded-element"');
    });
  });
  
  describe('compareWithBaseline', () => {
    it('should return a match for identical snapshots', () => {
      const { container } = render(<SimpleVisualization />);
      const visualization = container.firstChild as HTMLElement;
      
      const snapshot = snapshotVisualization(visualization);
      const result = compareWithBaseline(visualization, snapshot);
      
      expect(result.matches).toBe(true);
      expect(result.differences).toBeUndefined();
    });
    
    it('should detect differences between snapshots', () => {
      const { container: container1 } = render(<SimpleVisualization color="blue" />);
      const { container: container2 } = render(<SimpleVisualization color="red" />);
      
      const visualization1 = container1.firstChild as HTMLElement;
      const visualization2 = container2.firstChild as HTMLElement;
      
      const snapshot1 = snapshotVisualization(visualization1);
      const result = compareWithBaseline(visualization2, snapshot1);
      
      expect(result.matches).toBe(false);
      expect(result.differences).toBeDefined();
      expect(result.differences!.length).toBeGreaterThan(0);
    });
    
    it('should ignore color differences if requested', () => {
      const { container: container1 } = render(<SimpleVisualization color="blue" />);
      const { container: container2 } = render(<SimpleVisualization color="red" />);
      
      const visualization1 = container1.firstChild as HTMLElement;
      const visualization2 = container2.firstChild as HTMLElement;
      
      const snapshot1 = snapshotVisualization(visualization1);
      const result = compareWithBaseline(visualization2, snapshot1, { ignoreColors: true });
      
      // Since the only difference is the fill color, and we're ignoring colors,
      // this should be a match
      expect(result.matches).toBe(true);
    });
  });
  
  describe('saveBaselineSnapshot and loadBaselineSnapshot', () => {
    it('should save and load a baseline snapshot', () => {
      const { container } = render(<SimpleVisualization />);
      const visualization = container.firstChild as HTMLElement;
      
      // Save a baseline snapshot
      const snapshot = saveBaselineSnapshot(visualization);
      
      // Load the baseline snapshot
      const loadedElement = loadBaselineSnapshot(snapshot);
      
      // Check that the loaded element has the same structure
      expect(loadedElement.tagName.toLowerCase()).toBe('div');
      expect(loadedElement.getAttribute('data-testid')).toBe('simple-visualization');
      
      const circle = loadedElement.querySelector('circle');
      expect(circle).not.toBeNull();
      expect(circle!.getAttribute('fill')).toBe('blue');
    });
  });
}); 