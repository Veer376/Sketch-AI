import React, { useState, useRef } from 'react';
import { getCurrentTheme } from '../../../utils/theme';
import { bounceUIElement } from '../../../utils/animation';

export interface CenterButtonProps {
  onClick: () => void;
}

// SVG icon for center button
const CenterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V22M2 12H22M7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12Z" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CenterButton: React.FC<CenterButtonProps> = ({ onClick }) => {
  const theme = getCurrentTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    // Apply bounce animation when clicked
    if (buttonRef.current) {
      bounceUIElement(buttonRef.current, 1.0, 300);
    }
    onClick();
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Calculate dynamic styles
  const getButtonStyles = () => {
    const baseStyles: React.CSSProperties = {
      backgroundColor: theme.toolbarButton,
      color: theme.toolbarButtonText,
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
      title="Center Canvas"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={getButtonStyles()}
    >
      <CenterIcon />
    </button>
  );
};

export default CenterButton;