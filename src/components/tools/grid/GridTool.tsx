import React, { useRef } from 'react';
import { getCurrentTheme } from '../../../utils/theme';
import { bounceUIElement } from '../../../utils/animation';

export interface GridToolProps {
  isSelected: boolean;
  onSelect: () => void;
  onHoverChange?: (isHovered: boolean) => void;
}

// SVG icon for grid tool that looks like a grid
const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H21V21H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 15H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const GridTool: React.FC<GridToolProps> = ({ 
  isSelected, 
  onSelect,
  onHoverChange 
}) => {
  const theme = getCurrentTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleMouseEnter = () => {
    onHoverChange?.(true);
  };
  
  const handleMouseLeave = () => {
    onHoverChange?.(false);
  };
  
  const handleClick = () => {
    if (buttonRef.current) {
      bounceUIElement(buttonRef.current, 1.0, 300);
    }
    onSelect();
  };
  
  return (
    <button
      ref={buttonRef}
      title="Grid Settings"
      onClick={handleClick}
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
      <GridIcon />
    </button>
  );
};

export default GridTool;