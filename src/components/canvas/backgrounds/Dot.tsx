import React, { useMemo } from 'react';
import { Group, Shape } from 'react-konva';

interface GridProps {
  scale: number;
  stageWidth: number;
  stageHeight: number;
  stageX: number;
  stageY: number;
}

const Dot: React.FC<GridProps> = ({ scale, stageWidth, stageHeight, stageX, stageY }) => {
  const gridShape = useMemo(() => {
    const baseGridSize = 8;
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

    return (
      <Shape
        sceneFunc={(context) => {
          context.globalAlpha = 0.4; // Set the opacity of the dots
          context.beginPath();
          for (let x = startX; x <= endX; x += gridSize) {
            for (let y = startY; y <= endY; y += gridSize) {
              const isMajorPoint = x % (gridSize * 4) === 0 && y % (gridSize * 4) === 0;
              if (isMajorPoint) {
                const dotSize = 1.6 / scale;
                context.moveTo(x + dotSize, y);
                context.arc(x, y, dotSize, 0, Math.PI * 2, false);
              }
            }
          }
          context.fillStyle = '#888888';
          context.fill();
          context.closePath();
        }}
      />
    );
  }, [scale, stageWidth, stageHeight, stageX, stageY]);

  return <Group>{gridShape}</Group>;
};

export default Dot;