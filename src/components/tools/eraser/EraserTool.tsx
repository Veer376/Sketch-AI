import React from 'react';
import { getCurrentTheme } from '../../../utils/theme';

export interface EraserToolProps {
  isSelected: boolean;
  onSelect: () => void;
  onHoverChange?: (isHovered: boolean) => void;
}

// SVG icon for eraser tool
const EraserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 16l3.5-3.5-4.5-4.5-7 7 1.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 15L3 10.5 10.5 3 18 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EraserTool: React.FC<EraserToolProps> = ({ 
  isSelected, 
  onSelect,
  onHoverChange 
}) => {
  const theme = getCurrentTheme();
  
  const handleMouseEnter = () => {
    onHoverChange?.(true);
  };
  
  const handleMouseLeave = () => {
    onHoverChange?.(false);
  };
  
  return (
    <button
      title="Eraser Tool"
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor: isSelected ? theme.toolbarButtonSelected : theme.toolbarButton,
        color: isSelected ? theme.toolbarButtonSelectedText : theme.toolbarButtonText,
        border: 'none',
        padding: '10px',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '40px',
        outline: 'none', 
        height: '40px',
      }}
    >
      <EraserIcon />
    </button>
  );
};

export default EraserTool;