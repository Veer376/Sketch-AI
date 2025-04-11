import React from 'react';
import { getCurrentTheme } from '../../../utils/theme';
import DiscreteSliderControl from '../../shared/DiscreteSliderControl';

interface EraserSubToolbarProps {
  isVisible: boolean;
  size: number;
  onSizeChange: (size: number) => void;
  onHoverChange: (isHovered: boolean) => void;
  parentPosition: { x: number; y: number };
  parentWidth: number;
  snapSide: 'left' | 'right';
  toolButtonY: number;
}

const EraserSubToolbar: React.FC<EraserSubToolbarProps> = ({
  isVisible,
  size,
  onSizeChange,
  onHoverChange,
  parentPosition,
  parentWidth,
  snapSide,
  toolButtonY,
}) => {
  const theme = getCurrentTheme();
  const estimatedWidth = 150;

  if (!isVisible) {
    return null;
  }

  const handleSizeChange = (newSize: number) => {
    onSizeChange(newSize);
  };

  const subToolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${toolButtonY}px`,
    left: snapSide === 'left' 
      ? `${parentPosition.x + parentWidth + 10}px`
      : `${parentPosition.x - estimatedWidth - 10}px`,
    backgroundColor: theme.toolbar,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 9,
  };

  return (
    <div
      style={subToolbarStyle}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <h3 style={{ margin: '0 0 8px', color: theme.toolbarButtonText, fontSize: '14px' }}> Eraser </h3>
      <DiscreteSliderControl
        label="Size"
        value={size}
        min={1}
        max={50}
        step={3}
        onChange={handleSizeChange}
        unit="px"
        marks={true}
      />
    </div>
  );
};

export default EraserSubToolbar;