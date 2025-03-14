import React, { useState, useEffect, useCallback } from 'react';

/**
 * Bar chart data item
 */
interface BarData {
  label: string;
  value: number;
}

/**
 * Bar chart component props
 */
interface BarChartExampleProps {
  width?: number;
  height?: number;
  data?: BarData[];
  barColor?: string;
  barPadding?: number;
  onBarClick?: (bar: BarData, index: number) => void;
}

/**
 * A simple bar chart component for testing visualization utilities
 */
export const BarChartExample: React.FC<BarChartExampleProps> = ({
  width = 400,
  height = 300,
  data = [],
  barColor = 'steelblue',
  barPadding = 5,
  onBarClick
}) => {
  const [bars, setBars] = useState<BarData[]>(data);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  
  // Generate random data if none provided
  useEffect(() => {
    if (data.length === 0) {
      const categories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const randomData = categories.map(label => ({
        label,
        value: Math.floor(Math.random() * 100) + 10
      }));
      setBars(randomData);
    } else {
      setBars(data);
    }
  }, [data]);

  // Handle bar click
  const handleBarClick = useCallback((bar: BarData, index: number) => {
    setSelectedBarIndex(selectedBarIndex === index ? null : index);
    if (onBarClick) {
      onBarClick(bar, index);
    }
  }, [selectedBarIndex, onBarClick]);

  // Calculate dimensions
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  // Find maximum value for scaling
  const maxValue = Math.max(...bars.map(bar => bar.value));
  
  // Calculate bar width
  const barWidth = (innerWidth / bars.length) - barPadding;
  
  // Update data with random values
  const randomizeData = useCallback(() => {
    setBars(prevBars => 
      prevBars.map(bar => ({
        ...bar,
        value: Math.floor(Math.random() * 100) + 10
      }))
    );
  }, []);

  // Sort data
  const sortData = useCallback(() => {
    setBars(prevBars => 
      [...prevBars].sort((a, b) => b.value - a.value)
    );
  }, []);

  return (
    <div>
      <svg 
        width={width} 
        height={height} 
        style={{ border: '1px solid #ccc' }}
        data-testid="bar-chart-svg"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Y-axis */}
          <line 
            x1={0} 
            y1={0} 
            x2={0} 
            y2={innerHeight} 
            stroke="black" 
            data-testid="y-axis"
          />
          
          {/* X-axis */}
          <line 
            x1={0} 
            y1={innerHeight} 
            x2={innerWidth} 
            y2={innerHeight} 
            stroke="black" 
            data-testid="x-axis"
          />
          
          {/* Bars */}
          {bars.map((bar, index) => {
            const barHeight = (bar.value / maxValue) * innerHeight;
            const x = index * (barWidth + barPadding);
            const y = innerHeight - barHeight;
            
            const isSelected = selectedBarIndex === index;
            const isHovered = hoveredBarIndex === index;
            
            return (
              <g key={index} data-testid={`bar-group-${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={isSelected ? 'red' : isHovered ? 'orange' : barColor}
                  stroke={isSelected || isHovered ? 'black' : 'none'}
                  strokeWidth={1}
                  data-testid={`bar-${index}`}
                  onClick={() => handleBarClick(bar, index)}
                  onMouseEnter={() => setHoveredBarIndex(index)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  style={{ cursor: 'pointer' }}
                />
                
                {/* Bar label */}
                <text
                  x={x + barWidth / 2}
                  y={innerHeight + 15}
                  textAnchor="middle"
                  fontSize={12}
                  data-testid={`bar-label-${index}`}
                >
                  {bar.label}
                </text>
                
                {/* Bar value */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize={10}
                  data-testid={`bar-value-${index}`}
                >
                  {bar.value}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      
      <div style={{ marginTop: 10 }}>
        <button 
          onClick={randomizeData} 
          data-testid="randomize-button"
          style={{ marginRight: 10 }}
        >
          Randomize Data
        </button>
        <button 
          onClick={sortData} 
          data-testid="sort-button"
        >
          Sort Data
        </button>
      </div>
    </div>
  );
};

export default BarChartExample; 