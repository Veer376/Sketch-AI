import React from 'react';
import { getCurrentTheme } from '../../../utils/theme';

export type GridType = 'dots' | 'lines';

interface GridSubToolbarProps {
  isVisible: boolean;
  selectedType: GridType;
  onTypeChange: (type: GridType) => void;
  onHoverChange: (isHovered: boolean) => void;
  parentPosition: { x: number; y: number };
  parentWidth: number;
  snapSide: 'left' | 'right';
  toolButtonY: number;
}

// SVG icon for dot grid
const DotGridIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="4" cy="4" r="2" fill="currentColor"/>
    <circle cx="12" cy="4" r="2" fill="currentColor"/>
    <circle cx="20" cy="4" r="2" fill="currentColor"/>
    <circle cx="4" cy="12" r="2" fill="currentColor"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
    <circle cx="20" cy="12" r="2" fill="currentColor"/>
    <circle cx="4" cy="20" r="2" fill="currentColor"/>
    <circle cx="12" cy="20" r="2" fill="currentColor"/>
    <circle cx="20" cy="20" r="2" fill="currentColor"/>
  </svg>
);

// SVG icon for line grid
const LineGridIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 3V21" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 3V21" stroke="currentColor" strokeWidth="2"/>
    <path d="M20 3V21" stroke="currentColor" strokeWidth="2"/>
    <path d="M3 4H21" stroke="currentColor" strokeWidth="2"/>
    <path d="M3 12H21" stroke="currentColor" strokeWidth="2"/>
    <path d="M3 20H21" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const GridSubToolbar: React.FC<GridSubToolbarProps> = ({
  isVisible,
  selectedType,
  onTypeChange,
  onHoverChange,
  parentPosition,
  parentWidth,
  snapSide,
  toolButtonY,
}) => {
  const theme = getCurrentTheme();
  const estimatedWidth = 140;

  if (!isVisible) return null;

  const buttonStyle = (isSelected: boolean) => ({
    backgroundColor: isSelected ? theme.toolbarButtonSelected : theme.toolbarButton,
    color: isSelected ? theme.toolbarButtonSelectedText : theme.toolbarButtonText,
    border: 'none',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '36px',
    height: '36px',
    transition: 'all 0.2s ease',
  });

  const subToolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${toolButtonY}px`,
    left: snapSide === 'left' 
      ? `${parentPosition.x + parentWidth + 10}px`
      : `${parentPosition.x - estimatedWidth - 10}px`,
    backgroundColor: theme.toolbar,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    padding: '15px',
    borderRadius: '8px',
    zIndex: 9,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    minWidth: '120px',
  };

  return (
    <div
      style={subToolbarStyle}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <div style={{ 
        color: theme.toolbarText, 
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '5px'
      }}>
        Grid Style
      </div>
      <div style={{ 
        display: 'flex', 
        gap: '10px',
        justifyContent: 'center'
      }}>
        <button
          title="Dot Background"
          onClick={() => onTypeChange('dots')}
          style={buttonStyle(selectedType === 'dots')}
        >
          <DotGridIcon />
        </button>
        <button
          title="Grid Background"
          onClick={() => onTypeChange('lines')}
          style={buttonStyle(selectedType === 'lines')}
        >
          <LineGridIcon />
        </button>
      </div>
    </div>
  );
};

export default GridSubToolbar;