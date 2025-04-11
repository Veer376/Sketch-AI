import React, { useMemo } from 'react';
import { Line, Group } from 'react-konva';

interface LineGridProps {
  scale: number;
  stageWidth: number;
  stageHeight: number;
  stageX: number;
  stageY: number;
}

const LineGrid: React.FC<LineGridProps> = ({ scale, stageWidth, stageHeight, stageX, stageY }) => {
  const gridLines = useMemo(() => {
    const lines = [];
    const baseGridSize = 20;
    let gridSize = baseGridSize;

    // Adjust grid size based on scale with new thresholds
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

    // Create vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      lines.push(
        <Line
          key={`v${x}`}
          points={[x, startY, x, endY]}
          stroke="#CCCCCC"
          strokeWidth={0.5 / scale}
          opacity={0.2}
        />
      );
    }

    // Create horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      lines.push(
        <Line
          key={`h${y}`}
          points={[startX, y, endX, y]}
          stroke="#CCCCCC"
          strokeWidth={0.5 / scale}
          opacity={0.2}
        />
      );
    }

    // Create major grid lines (every 4 cells)
    const majorGridSize = gridSize * 4;
    for (let x = Math.floor(startX / majorGridSize) * majorGridSize; x <= endX; x += majorGridSize) {
      lines.push(
        <Line
          key={`mv${x}`}
          points={[x, startY, x, endY]}
          stroke="#AAAAAA"
          strokeWidth={1 / scale}
          opacity={0.3}
        />
      );
    }

    for (let y = Math.floor(startY / majorGridSize) * majorGridSize; y <= endY; y += majorGridSize) {
      lines.push(
        <Line
          key={`mh${y}`}
          points={[startX, y, endX, y]}
          stroke="#AAAAAA"
          strokeWidth={1 / scale}
          opacity={0.3}
        />
      );
    }

    return lines;
  }, [scale, stageWidth, stageHeight, stageX, stageY]);

  return <Group>{gridLines}</Group>;
};

export default LineGrid;