import React, { useRef } from 'react';
import { getCurrentTheme } from '../../../utils/theme';
import { bounceUIElement } from '../../../utils/animation';

export interface RedoButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

// SVG icon for redo
const RedoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10H8C4.134 10 1 13.134 1 17C1 20.866 4.134 24 8 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 10L15 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 10L15 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RedoButton: React.FC<RedoButtonProps> = ({ 
  onClick,
  disabled = false
}) => {
  const theme = getCurrentTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleClick = () => {
    if (disabled) return;
    
    // Apply bounce animation when clicked
    if (buttonRef.current) {
      bounceUIElement(buttonRef.current, 1.0, 300);
    }
    onClick();
  };
  
  return (
    <button
      ref={buttonRef}
      title="Redo"
      onClick={handleClick}
      disabled={disabled}
      style={{
        backgroundColor: theme.toolbarButton,
        color: disabled ? theme.toolbarButtonDisabled : theme.toolbarButtonText,
        border: 'none',
        padding: '10px',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '40px',
        outline: 'none', 
        height: '40px',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <RedoIcon />
    </button>
  );
};

export default RedoButton;