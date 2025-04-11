import React from 'react';
import { getCurrentTheme } from '../../../utils/theme';

interface EraserSubToolbarProps {
  isVisible: boolean;
  size: number;
  onSizeChange: (size: number) => void;
  onHoverChange: (isHovered: boolean) => void;
}

const EraserSubToolbar: React.FC<EraserSubToolbarProps> = ({
  isVisible,
  size,
  onSizeChange,
  onHoverChange
}) => {
  const theme = getCurrentTheme();

  if (!isVisible) {
    return null;
  }

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSizeChange(parseInt(e.target.value, 10));
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '55px', // Position next to the toolbar
        transform: 'translateY(-50%)',
        backgroundColor: theme.toolbar,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9, // Below main toolbar but above canvas
      }}
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
            width: '100px', // Match PencilSubToolbar
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