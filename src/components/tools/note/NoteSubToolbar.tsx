import React from 'react';
import { getCurrentTheme } from '../../../utils/theme';

// Note style previews
const YellowNotePreview = () => (
  <div style={{
    width: '40px',
    height: '40px',
    backgroundColor: '#fff9c4',
    borderRadius: '3px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      width: '100%',
      height: '5px',
      backgroundColor: '#ffd600',
      position: 'absolute',
      top: 0,
    }}></div>
    <div style={{
      width: '90%',
      height: '2px',
      backgroundColor: '#aaa',
      marginTop: '8px',
    }}></div>
  </div>
);

const BlueNotePreview = () => (
  <div style={{
    width: '40px',
    height: '40px',
    backgroundColor: '#e3f2fd',
    borderRadius: '3px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      width: '100%',
      height: '5px',
      backgroundColor: '#2196f3',
      position: 'absolute',
      top: 0,
    }}></div>
    <div style={{
      width: '90%',
      height: '2px',
      backgroundColor: '#aaa',
      marginTop: '8px',
    }}></div>
  </div>
);

export interface NoteStyle {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  accentColor: string;
}

export const NOTE_STYLES: NoteStyle[] = [
  {
    id: 'yellow-note',
    name: 'Yellow Note',
    backgroundColor: '#fff9c4',
    borderColor: '#ffeb3b',
    accentColor: '#ffd600',
  },
  {
    id: 'blue-note',
    name: 'Blue Note',
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
    accentColor: '#2196f3',
  }
];

export interface NoteSubToolbarProps {
  isVisible: boolean;
  selectedNoteStyle: string;
  onNoteStyleChange: (styleId: string) => void;
  onHoverChange: (isHovered: boolean) => void;
  parentPosition: { x: number; y: number };
  parentWidth: number;
  snapSide: 'left' | 'right';
  toolButtonY: number;
}

// Use the same constants across all subtoolbars for consistency
const SUBTOOLBAR_WIDTH = 280;
const CONNECTOR_SIZE = 10;

const NoteSubToolbar: React.FC<NoteSubToolbarProps> = ({
  isVisible,
  selectedNoteStyle,
  onNoteStyleChange,
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

  // Calculate the toolbar vertical midpoint - accurately point to the center of the button
  const toolHeight = 36; // Standard tool button height
  const toolVerticalCenter = toolButtonY + (toolHeight / 2);

  const subToolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${Math.max(20, toolVerticalCenter - 80)}px`, // Center with minimum top margin
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
        Note Style
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {NOTE_STYLES.map((style) => (
          <div
            key={style.id}
            onClick={() => onNoteStyleChange(style.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: selectedNoteStyle === style.id ? theme.toolbarButtonSelected : 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {style.id === 'yellow-note' ? <YellowNotePreview /> : <BlueNotePreview />}
            <span style={{ 
              color: selectedNoteStyle === style.id ? theme.toolbarButtonSelectedText : theme.toolbarButtonText,
              fontSize: '12px',
            }}>
              {style.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoteSubToolbar;