import React, { useState, useRef } from 'react';
import { getCurrentTheme } from '../../../utils/theme';
import { bounceUIElement } from '../../../utils/animation';

export interface EraserToolProps {
  isSelected: boolean;
  onSelect: () => void;
  onHoverChange?: (isHovered: boolean) => void;
  size: number;
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
  onHoverChange,
  /* size parameter is received but not used in this component */
}) => {
  const theme = getCurrentTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange?.(false);
  };

  const handleClick = () => {
    // Apply bounce animation when clicked
    if (buttonRef.current) {
      bounceUIElement(buttonRef.current, 1.0, 300);
    }
    onSelect();
  };

  // Calculate dynamic styles
  const getButtonStyles = () => {
    const baseStyles: React.CSSProperties = {
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
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      position: 'relative',
      zIndex: isHovered ? 2 : 1,
    };
    
    // Apply zoom effect when hovered
    if (isHovered) {
      return {
        ...baseStyles,
        transform: 'scale(1.15)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      };
    }
    
    return baseStyles;
  };
  
  return (
    <button
      ref={buttonRef}
      title="Eraser Tool"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={getButtonStyles()}
    >
      <EraserIcon />
    </button>
  );
};

export default EraserTool;