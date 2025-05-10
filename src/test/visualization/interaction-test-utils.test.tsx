/**
 * Tests for Visualization Interaction Testing Utilities
 */

import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { 
  simulateZoom, 
  simulatePan, 
  simulateSelection,
  simulateKeyboardNavigation,
  simulateDoubleClick,
  simulateRightClick,
  simulateHover,
  simulateMouseLeave
} from './interaction-test-utils';

// Simple interactive visualization component
interface InteractiveVisualizationProps {
  onZoom?: (factor: number) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  onSelection?: (startX: number, startY: number, endX: number, endY: number) => void;
  onKeyPress?: (key: string) => void;
  onDoubleClick?: (x: number, y: number) => void;
  onRightClick?: (x: number, y: number) => void;
  onHover?: (x: number, y: number) => void;
  onMouseLeave?: () => void;
}

const InteractiveVisualization: React.FC<InteractiveVisualizationProps> = ({
  onZoom,
  onPan,
  onSelection,
  onKeyPress,
  onDoubleClick,
  onRightClick,
  onHover,
  onMouseLeave
}) => {
  const [status, setStatus] = useState('Idle');

  const handleWheel = (e: React.WheelEvent) => {
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setStatus(`Zoomed: ${factor.toFixed(2)}`);
    onZoom?.(factor);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left button
      const startX = e.clientX;
      const startY = e.clientY;
      
      const handleMouseMove = (moveEvent: MouseEvent) => {
        setStatus(`Panning: ${moveEvent.clientX - startX}, ${moveEvent.clientY - startY}`);
        onPan?.(moveEvent.clientX - startX, moveEvent.clientY - startY);
      };
      
      const handleMouseUp = (upEvent: MouseEvent) => {
        setStatus(`Selected: ${startX},${startY} to ${upEvent.clientX},${upEvent.clientY}`);
        onSelection?.(startX, startY, upEvent.clientX, upEvent.clientY);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setStatus(`Key pressed: ${e.key}`);
    onKeyPress?.(e.key);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    setStatus(`Double clicked: ${e.clientX},${e.clientY}`);
    onDoubleClick?.(e.clientX, e.clientY);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setStatus(`Right clicked: ${e.clientX},${e.clientY}`);
    onRightClick?.(e.clientX, e.clientY);
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    setStatus(`Hover: ${e.clientX},${e.clientY}`);
    onHover?.(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    setStatus('Mouse left');
    onMouseLeave?.();
  };

  return (
    <div
      data-testid="interactive-visualization"
      style={{ width: '200px', height: '200px', backgroundColor: '#f0f0f0' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      tabIndex={0} // Make the div focusable
    >
      <div data-testid="status">{status}</div>
    </div>
  );
};

describe('Visualization Interaction Testing Utilities', () => {
  describe('simulateZoom', () => {
    it('should simulate zooming on a visualization', async () => {
      const onZoom = jest.fn();
      render(<InteractiveVisualization onZoom={onZoom} />);
      
      const visualization = screen.getByTestId('interactive-visualization');
      await simulateZoom(visualization, { factor: 1.1 });
      
      expect(screen.getByTestId('status').textContent).toContain('Zoomed');
    });
  });

  describe('simulatePan', () => {
    it('should simulate panning on a visualization', async () => {
      const onPan = jest.fn();
      render(<InteractiveVisualization onPan={onPan} />);
      
      const visualization = screen.getByTestId('interactive-visualization');
      await simulatePan(visualization, { deltaX: 10, deltaY: 20 });
      
      expect(screen.getByTestId('status').textContent).toContain('Selected');
    });
  });

  describe('simulateSelection', () => {
    it('should simulate selecting on a visualization', async () => {
      const onSelection = jest.fn();
      render(<InteractiveVisualization onSelection={onSelection} />);
      
      const visualization = screen.getByTestId('interactive-visualization');
      await simulateSelection(visualization, {
        startPoint: { x: 10, y: 10 },
        endPoint: { x: 50, y: 50 }
      });
      
      expect(screen.getByTestId('status').textContent).toContain('Selected');
    });
  });

  describe('simulateDoubleClick', () => {
    it('should simulate double clicking on a visualization', async () => {
      const onDoubleClick = jest.fn();
      render(<InteractiveVisualization onDoubleClick={onDoubleClick} />);
      
      const visualization = screen.getByTestId('interactive-visualization');
      await simulateDoubleClick(visualization, { x: 10, y: 10 });
      
      expect(screen.getByTestId('status').textContent).toContain('Double clicked');
    });
  });

  describe('simulateRightClick', () => {
    it('should simulate right clicking on a visualization', async () => {
      const onRightClick = jest.fn();
      render(<InteractiveVisualization onRightClick={onRightClick} />);
      
      const visualization = screen.getByTestId('interactive-visualization');
      await simulateRightClick(visualization, { x: 10, y: 10 });
      
      expect(screen.getByTestId('status').textContent).toContain('Right clicked');
    });
  });

  describe('simulateHover', () => {
    it('should simulate hovering over a visualization', async () => {
      const onHover = jest.fn();
      render(<InteractiveVisualization onHover={onHover} />);
      
      const visualization = screen.getByTestId('interactive-visualization');
      await simulateHover(visualization, { x: 10, y: 10 });
      
      expect(screen.getByTestId('status').textContent).toContain('Hover');
    });
  });

  describe('simulateMouseLeave', () => {
    it('should simulate mouse leaving a visualization', async () => {
      const onMouseLeave = jest.fn();
      render(<InteractiveVisualization onMouseLeave={onMouseLeave} />);
      
      const visualization = screen.getByTestId('interactive-visualization');
      await simulateMouseLeave(visualization);
      
      expect(screen.getByTestId('status').textContent).toContain('Mouse left');
    });
  });
}); 