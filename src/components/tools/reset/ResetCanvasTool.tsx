import React from 'react';
import { getCurrentTheme } from '../../../utils/theme'; // Corrected import path
import { bounceUIElement } from '../../../utils/animation'; // Corrected import path

interface ResetCanvasToolProps {
  onReset?: () => void;
}

// SVG icon for Reset Canvas tool
const ResetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 2v6h6M21.5 22v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21.5 11.5a9.5 9.5 0 1 0-2.64 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ResetCanvasTool: React.FC<ResetCanvasToolProps> = ({ onReset }) => {
  const theme = getCurrentTheme();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (buttonRef.current) {
      bounceUIElement(buttonRef.current, 1.0, 300); // Apply bounce animation
    }
    onReset?.();
  };

  return (
    <button
      ref={buttonRef}
      title="Reset Canvas"
      onClick={handleClick}
      style={{
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
      }}
    >
      <ResetIcon />
    </button>
  );
};

export default ResetCanvasTool; 