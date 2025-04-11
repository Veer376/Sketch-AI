import React, { useState, useRef } from 'react';
import { getCurrentTheme } from '../../../utils/theme';
import { bounceUIElement } from '../../../utils/animation';

export interface PencilToolProps {
  isSelected: boolean;
  onSelect: () => void;
  onHoverChange?: (isHovered: boolean) => void;
}

// SVG icon for pencil tool
const PencilIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.3 8.925L15.05 4.675L16.45 3.275C17.05 2.675 17.834 2.375 18.8 2.375C19.767 2.375 20.55 2.675 21.15 3.275L22.725 4.85C23.325 5.45 23.625 6.234 23.625 7.2C23.625 8.167 23.325 8.95 22.725 9.55L21.325 10.95L19.3 8.925ZM17.875 10.35L8.675 19.55C8.175 20.05 7.584 20.42 6.9 20.662C6.217 20.904 5.517 21.025 4.8 21.025H3.975C3.708 21.025 3.487 20.937 3.312 20.762C3.137 20.587 3.05 20.367 3.05 20.1V19.275C3.05 18.559 3.172 17.859 3.415 17.175C3.657 16.492 4.025 15.9 4.525 15.4L13.725 6.2L17.875 10.35Z" 
      fill="currentColor"/>
  </svg>
);

const PencilTool: React.FC<PencilToolProps> = ({ 
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
    // Apply bounce animation when clicked
    if (buttonRef.current) {
      bounceUIElement(buttonRef.current, 1.0, 300);
    }
    onSelect();
  };
  
  return (
    <button
      ref={buttonRef}
      title="Pen"
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
      <PencilIcon />
    </button>
  );
};

export default PencilTool;