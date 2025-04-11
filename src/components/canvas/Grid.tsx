import React, { useMemo } from 'react';
import { Circle, Group } from 'react-konva';

interface GridProps {
  scale: number;
  stageWidth: number;
  stageHeight: number;
  stageX: number;
  stageY: number;
}

const Grid: React.FC<GridProps> = ({ scale, stageWidth, stageHeight, stageX, stageY }) => {
  const dots = useMemo(() => {
    const points = [];
    const baseGridSize = 20;
    let gridSize = baseGridSize;

    // Adjust grid size based on scale
    if (scale < 0.3) {
      gridSize = baseGridSize * Math.ceil(1 / scale);
    } else if (scale > 3) {
      gridSize = baseGridSize / Math.floor(scale);
    }

    // Calculate visible area in world coordinates
    const startX = Math.floor(-stageX / scale / gridSize) * gridSize;
    const startY = Math.floor(-stageY / scale / gridSize) * gridSize;
    const endX = Math.ceil((stageWidth - stageX) / scale / gridSize) * gridSize;
    const endY = Math.ceil((stageHeight - stageY) / scale / gridSize) * gridSize;

    // Increased base dot size from 1 to 2
    const baseDotSize = 2;
    const dotSize = baseDotSize / scale;

    // Create dots at grid intersections
    for (let x = startX; x <= endX; x += gridSize) {
      for (let y = startY; y <= endY; y += gridSize) {
        // Check if this is a major grid point (every 4 cells)
        const isMajorPoint = x % (gridSize * 4) === 0 && y % (gridSize * 4) === 0;
        
        points.push(
          <Circle
            key={`${x},${y}`}
            x={x}
            y={y}
            radius={isMajorPoint ? dotSize * 1.5 : dotSize}
            fill={isMajorPoint ? "#888888" : "#AAAAAA"}
            opacity={isMajorPoint ? 0.4 : 0.1}
          />
        );
      }
    }

    return points;
  }, [scale, stageWidth, stageHeight, stageX, stageY]);

  return <Group>{dots}</Group>;
};

export default Grid;