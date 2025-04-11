import React, { useEffect, useRef } from 'react';
import { getCurrentTheme } from '../../../utils/theme';
import { bounceUIElement } from '../../../utils/animation';

export interface EraserToolProps {
  isSelected: boolean;
  onSelect: () => void;
  onHoverChange?: (isHovered: boolean) => void;
  size: number; // Add size prop
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
  size // Use size prop
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
    // Apply bounce animation when clicked
    if (buttonRef.current) {
      bounceUIElement(buttonRef.current, 1.0, 300);
    }
    onSelect();
  };

  // Update cursor size dynamically when the eraser is selected
  useEffect(() => {
    if (isSelected) {
      document.body.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${size}\" height=\"${size}\" viewBox=\"0 0 ${size} ${size}\"><circle cx=\"${size / 2}\" cy=\"${size / 2}\" r=\"${size / 2}\" fill=\"black\" /></svg>') ${size / 2} ${size / 2}, auto`;
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isSelected, size]);
  
  return (
    <button
      ref={buttonRef}
      title="Eraser Tool"
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
      <EraserIcon />
    </button>
  );
};

export default EraserTool;