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
  const estimatedWidth = 150;

  if (!isVisible) {
    return null;
  }

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
    width: `${estimatedWidth}px`,
  };

  return (
    <div
      style={subToolbarStyle}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <h3 style={{ margin: '0 0 8px', color: theme.toolbarButtonText, fontSize: '14px' }}>
        Note Style
      </h3>
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