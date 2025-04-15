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

// Use the same constants across all subtoolbars for consistency
const SUBTOOLBAR_WIDTH = 280;
const CONNECTOR_SIZE = 10;

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

  // Calculate the toolbar vertical midpoint - accurately point to the center of the button
  const toolHeight = 36; // Standard tool button height
  const toolVerticalCenter = toolButtonY + (toolHeight / 2);

  const subToolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${Math.max(20, toolVerticalCenter - 75)}px`, // Center with minimum top margin
    left: snapSide === 'left' 
      ? `${parentPosition.x + parentWidth + 15}px` // Position to the right of parent
      : `${parentPosition.x - SUBTOOLBAR_WIDTH - 15}px`, // Position to the left with consistent width
    backgroundColor: theme.toolbar,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    padding: '15px',
    borderRadius: '8px',
    zIndex: 9, // Keep below main toolbar if overlapping temporarily
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: `${SUBTOOLBAR_WIDTH - 30}px`, // Account for padding
  };

  // Connector style - the small triangle that points to the tool
  const connectorStyle: React.CSSProperties = {
    position: 'absolute',
    width: '0',
    height: '0',
    // Position connector at exact tool center height
    ...(snapSide === 'left'
      ? {
          left: '-10px',
          top: `${toolVerticalCenter - parseInt(subToolbarStyle.top as string, 10)}px`,
          borderTop: `${CONNECTOR_SIZE}px solid transparent`,
          borderBottom: `${CONNECTOR_SIZE}px solid transparent`,
          borderRight: `${CONNECTOR_SIZE}px solid ${theme.toolbar}`,
        }
      : {
          right: '-10px',
          top: `${toolVerticalCenter - parseInt(subToolbarStyle.top as string, 10)}px`,
          borderTop: `${CONNECTOR_SIZE}px solid transparent`,
          borderBottom: `${CONNECTOR_SIZE}px solid transparent`,
          borderLeft: `${CONNECTOR_SIZE}px solid ${theme.toolbar}`,
        }),
  };

  return (
    <div
      style={subToolbarStyle}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {/* Visual connector to the tool */}
      <div style={connectorStyle}></div>
      
      <div style={{ 
        padding: '5px', 
        textAlign: 'center', 
        color: theme.toolbarText, 
        fontWeight: 'bold'
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