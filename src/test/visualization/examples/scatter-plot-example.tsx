import React, { useState, useEffect, useCallback } from 'react';

/**
 * Simple scatter plot component for testing
 */
interface ScatterPlotExampleProps {
  width?: number;
  height?: number;
  data?: Array<{ x: number; y: number }>;
  pointRadius?: number;
  pointColor?: string;
  onPointClick?: (point: { x: number; y: number }, index: number) => void;
  onZoom?: (factor: number) => void;
}

/**
 * A simple scatter plot component for testing visualization utilities
 */
export const ScatterPlotExample: React.FC<ScatterPlotExampleProps> = ({
  width = 400,
  height = 300,
  data = [],
  pointRadius = 5,
  pointColor = 'steelblue',
  onPointClick,
  onZoom
}) => {
  const [points, setPoints] = useState(data);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Generate random data if none provided
  useEffect(() => {
    if (data.length === 0) {
      const randomData = Array.from({ length: 50 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height
      }));
      setPoints(randomData);
    } else {
      setPoints(data);
    }
  }, [data, width, height]);

  // Handle point click
  const handlePointClick = useCallback((point: { x: number; y: number }, index: number) => {
    setSelectedPointIndex(selectedPointIndex === index ? null : index);
    if (onPointClick) {
      onPointClick(point, index);
    }
  }, [selectedPointIndex, onPointClick]);

  // Handle zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const newZoomLevel = e.deltaY < 0 
      ? Math.min(zoomLevel + 0.1, 3) 
      : Math.max(zoomLevel - 0.1, 0.5);
    
    setZoomLevel(newZoomLevel);
    
    if (onZoom) {
      onZoom(newZoomLevel);
    }
  }, [zoomLevel, onZoom]);

  // Update data with jitter (for testing data updates)
  const addJitter = useCallback(() => {
    setPoints(prevPoints => 
      prevPoints.map(point => ({
        x: point.x + (Math.random() * 10 - 5),
        y: point.y + (Math.random() * 10 - 5)
      }))
    );
  }, []);

  // Reset data to original
  const resetData = useCallback(() => {
    if (data.length > 0) {
      setPoints(data);
    }
  }, [data]);

  return (
    <div>
      <svg 
        width={width} 
        height={height} 
        style={{ border: '1px solid #ccc' }}
        onWheel={handleWheel}
        data-testid="scatter-plot-svg"
      >
        {/* Axes */}
        <line x1={0} y1={height - 20} x2={width} y2={height - 20} stroke="black" />
        <line x1={20} y1={0} x2={20} y2={height} stroke="black" />
        
        {/* Points */}
        <g transform={`scale(${zoomLevel})`}>
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={selectedPointIndex === index ? pointRadius * 1.5 : pointRadius}
              fill={hoveredPointIndex === index ? 'orange' : selectedPointIndex === index ? 'red' : pointColor}
              stroke={hoveredPointIndex === index || selectedPointIndex === index ? 'black' : 'none'}
              strokeWidth={1}
              data-testid={`point-${index}`}
              onClick={() => handlePointClick(point, index)}
              onMouseEnter={() => setHoveredPointIndex(index)}
              onMouseLeave={() => setHoveredPointIndex(null)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </g>
      </svg>
      
      <div style={{ marginTop: 10 }}>
        <button 
          onClick={addJitter} 
          data-testid="jitter-button"
          style={{ marginRight: 10 }}
        >
          Add Jitter
        </button>
        <button 
          onClick={resetData} 
          data-testid="reset-button"
        >
          Reset Data
        </button>
        <div style={{ marginTop: 5 }}>
          Zoom Level: {zoomLevel.toFixed(1)}x
        </div>
      </div>
    </div>
  );
};

export default ScatterPlotExample; 