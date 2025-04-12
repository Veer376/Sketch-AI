import React, { useRef } from 'react';
import { getCurrentTheme } from '../../../utils/theme';
import { bounceUIElement } from '../../../utils/animation';

// Simple Text Icon (Placeholder)
const TextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.9999 18H13.9999M11.9999 18V6M7.9999 6H15.9999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


export interface TextToolProps {
  isSelected: boolean;
  onSelect: () => void;
  onHoverChange?: (isHovered: boolean) => void;
}

const TextTool: React.FC<TextToolProps> = ({
  isSelected,
  onSelect,
  onHoverChange,
}) => {
  const theme = getCurrentTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (buttonRef.current) {
      bounceUIElement(buttonRef.current, 1.0, 300);
    }
    onSelect();
  };

  const handleMouseEnter = () => {
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    onHoverChange?.(false);
  };

  return (
    <button
      ref={buttonRef}
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
        height: '40px',
        outline: 'none',
        transition: 'all 0.2s ease',
      }}
      title="Text Tool"
    >
      <TextIcon />
    </button>
  );
};

export default TextTool; 