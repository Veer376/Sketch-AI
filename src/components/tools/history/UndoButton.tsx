import React, { useRef } from 'react';
import { getCurrentTheme } from '../../../utils/theme';
import { bounceUIElement } from '../../../utils/animation';

export interface UndoButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

// SVG icon for undo
const UndoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10H16C19.866 10 23 13.134 23 17C23 20.866 19.866 24 16 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 10L9 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 10L9 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UndoButton: React.FC<UndoButtonProps> = ({ 
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
      title="Undo"
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
      <UndoIcon />
    </button>
  );
};

export default UndoButton;