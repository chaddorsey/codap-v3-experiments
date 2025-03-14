import React, { useState, useEffect } from 'react';

/**
 * Simple scatter plot component for testing
 */
interface ScatterPlotExampleProps {
  width?: number;
  height?: number;
  data?: Array<{ x: number; y: number }>;
  pointRadius?: number;
  pointColor?: string;
}

/**
 * A simple scatter plot component for testing visualization utilities
 */
export const ScatterPlotExample: React.FC<ScatterPlotExampleProps> = ({
  width = 400,
  height = 300,
  data = [],
  pointRadius = 5,
  pointColor = 'steelblue'
}) => {
  const [points, setPoints] = useState(data);
  
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

  return (
    <svg width={width} height={height} style={{ border: '1px solid #ccc' }}>
      {/* Axes */}
      <line x1={0} y1={height - 20} x2={width} y2={height - 20} stroke="black" />
      <line x1={20} y1={0} x2={20} y2={height} stroke="black" />
      
      {/* Points */}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={pointRadius}
          fill={pointColor}
          data-testid={`point-${index}`}
        />
      ))}
    </svg>
  );
};

export default ScatterPlotExample; 