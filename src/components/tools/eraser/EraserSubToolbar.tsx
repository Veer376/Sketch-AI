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

// Use the same constants across all subtoolbars for consistency
const SUBTOOLBAR_WIDTH = 280;
const CONNECTOR_SIZE = 10;

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

  if (!isVisible) {
    return null;
  }

  const handleSizeChange = (newSize: number) => {
    onSizeChange(newSize);
  };

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
    zIndex: 9, 
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
      
      <div style={{ padding: '5px', textAlign: 'center', color: theme.toolbarText, fontWeight: 'bold' }}>
        Eraser
      </div>
      
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