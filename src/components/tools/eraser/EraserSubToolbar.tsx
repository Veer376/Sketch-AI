import React from 'react';
import { getCurrentTheme } from '../../../utils/theme';

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

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSizeChange(parseInt(e.target.value, 10));
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
      <h3 style={{ margin: '0 0 8px', color: theme.toolbarButtonText, fontSize: '14px' }}>Eraser Options</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="range"
          min="1"
          max="50"
          value={size}
          onChange={handleSizeChange}
          style={{
            width: '100px',
            accentColor: theme.toolbarButtonSelected,
            padding: '5px',
          }}
        />
        <span style={{ color: theme.toolbarButtonText, fontSize: '12px' }}>{size}px</span>
      </div>
    </div>
  );
};

export default EraserSubToolbar;