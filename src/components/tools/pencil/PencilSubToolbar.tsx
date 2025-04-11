import React, { useState } from 'react';
import { getCurrentTheme } from '../../../utils/theme';

export interface PencilSubToolbarProps {
  isVisible: boolean;
  thickness?: number;
  onThicknessChange?: (thickness: number) => void; // Only thickness needed
  onHoverChange?: (isHovered: boolean) => void;
  selectedColor: string; // Use selectedColor from parent
  onColorChange: (color: string) => void; // Callback to update color in parent
}

const PencilSubToolbar: React.FC<PencilSubToolbarProps> = ({ 
  isVisible, 
  thickness = 2, 
  onThicknessChange,
  onHoverChange,
  selectedColor, // Receive from parent
  onColorChange // Receive from parent
}) => {
  const theme = getCurrentTheme();
  const [isThicknessHovered, setIsThicknessHovered] = useState(false);
  // Removed local color state and color adding logic as it's now fixed
  
  if (!isVisible) return null;
  
  const handleMouseEnter = () => {
    onHoverChange?.(true);
  };
  
  const handleMouseLeave = () => {
    onHoverChange?.(false);
  };
  
  const handleThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newThickness = parseFloat(e.target.value);
    onThicknessChange?.(newThickness); // Only pass thickness
  };

  // Call the parent's color change handler
  const handleColorSelect = (color: string) => {
    onColorChange(color); // Update color via callback to App.tsx
    // No need to call onThicknessChange here for color
  };
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '70px',
        transform: 'translateY(-50%)',
        backgroundColor: theme.toolbar,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        minWidth: '200px',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{ padding: '5px', textAlign: 'center', color: theme.toolbarText, fontWeight: 'bold' }}>
        Pencil Options
      </div>
      
      {/* Thickness Control */}
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          position: 'relative',
        }}
        onMouseEnter={() => setIsThicknessHovered(true)}
        onMouseLeave={() => setIsThicknessHovered(false)}
      >
        <label 
          htmlFor="thickness-slider" 
          style={{ 
            color: theme.toolbarText,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>Thickness:</span>
          <span style={{ 
            minWidth: '30px', 
            backgroundColor: theme.toolbarButton,
            padding: '2px 6px',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {thickness}px
          </span>
        </label>
        <input
          id="thickness-slider"
          type="range"
          min="1"
          max="20"
          step="1"
          value={thickness}
          onChange={handleThicknessChange}
          style={{
            width: '100px', // Match EraserSubToolbar
            accentColor: theme.toolbarButtonSelected,
            padding: '5px',
          }}
        />
        
        {/* Preview of thickness when hovered */}
        {isThicknessHovered && (
          <div style={{
            position: 'absolute',
            top: '-45px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: theme.toolbar,
            borderRadius: '4px',
            padding: '6px 10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            zIndex: 11,
          }}>
            <div style={{
              width: `${thickness * 2}px`,
              height: `${thickness}px`,
              backgroundColor: theme.foreground,
              borderRadius: '50px',
            }}></div>
            <span style={{ color: theme.toolbarText, fontSize: '12px' }}>
              {thickness}px
            </span>
          </div>
        )}
      </div>

      {/* Color Selection - Simplified to use props */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ color: theme.toolbarText, fontWeight: 'bold' }}>Colors:</label>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['red', 'black', 'blue'].map((color, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <div
                onClick={() => handleColorSelect(color)} // Call the correct handler
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: color,
                  borderRadius: '50%',
                  border: selectedColor === color ? `3px solid ${theme.primary}` : '2px solid white', // Use selectedColor prop
                  boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PencilSubToolbar;