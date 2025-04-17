import React, { useState, useRef } from 'react';
import { getCurrentTheme } from '../../../utils/theme';
import DiscreteSliderControl from '../../shared/DiscreteSliderControl';

// --- Icons --- (Define simple SVG icons here or import)
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>;
const SaveIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
const DeleteIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>;
const ConfirmIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
const CancelIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>;
const PaletteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>
);
// --- End Icons ---

export interface PencilSubToolbarProps {
  isVisible: boolean;
  thickness: number;
  onThicknessChange?: (thickness: number) => void; // Only thickness needed
  onHoverChange?: (isHovered: boolean) => void;
  selectedColor: string; // Use selectedColor from parent
  onColorChange: (color: string) => void; // Callback to update color in parent
  // Add new props for positioning
  parentPosition: { x: number; y: number };
  parentWidth: number;
  snapSide: 'left' | 'right';
  toolButtonY: number; // Add prop for specific tool Y
}

// Consistent width for all subtoolbars
const SUBTOOLBAR_WIDTH = 280;
const CONNECTOR_SIZE = 10;

const PencilSubToolbar: React.FC<PencilSubToolbarProps> = ({ 
  isVisible, 
  thickness, 
  onThicknessChange,
  onHoverChange,
  selectedColor, // Receive from parent
  onColorChange, // Receive from parent
  // Destructure new props
  parentPosition,
  parentWidth,
  snapSide,
  toolButtonY, // Destructure new prop
}) => {
  const theme = getCurrentTheme();
  
  // --- State for Colors ---
  const [availableColors, setAvailableColors] = useState<string[]>(['#FF0000', '#0000FF']); // Start with hex red, black, blue
  const colorInputRef = useRef<HTMLInputElement>(null);
  const maxColors = 6;
  const [isColorEditMode, setIsColorEditMode] = useState(false); // State for edit mode
  const [pendingColor, setPendingColor] = useState<string | null>(null); // State for pending color
  // --- End State for Colors ---

  if (!isVisible) return null;
  
  const handleMouseEnter = () => {
    onHoverChange?.(true);
  };
  
  const handleMouseLeave = () => {
    onHoverChange?.(false);
  };
  
  const handleThicknessChange = (newThickness: number) => {
    onThicknessChange?.(newThickness);
  };

  // Call the parent's color change handler
  const handleColorSelect = (color: string) => {
    if (!isColorEditMode) { // Only select if not in edit mode
       onColorChange(color);
    }
  };
  
  // --- Handlers for adding color ---
  const handleAddColorClick = () => {
    setPendingColor(null); // Reset any previous pending color
    colorInputRef.current?.click(); // Trigger the hidden color input
  };

  // Set pending color when input changes
  const handleColorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPendingColor(event.target.value);
  };

  // Confirm adding the pending color
  const handleConfirmAddColor = () => {
    if (pendingColor && availableColors.length < maxColors && !availableColors.includes(pendingColor)) {
      setAvailableColors(prevColors => [...prevColors, pendingColor]);
    }
    setPendingColor(null); // Reset pending color
  };

  // Cancel adding the pending color
  const handleCancelAddColor = () => {
    setPendingColor(null); // Reset pending color
  };

  // --- Handler for Deleting Color ---
  const handleDeleteColor = (colorToDelete: string) => {
    const newColors = availableColors.filter(color => color !== colorToDelete);
    setAvailableColors(newColors);
    // If the deleted color was selected, select the first remaining one
    if (selectedColor === colorToDelete) {
      onColorChange(newColors.length > 0 ? newColors[0] : '#000000'); // Default to black if none left
    }
  };
  // --- End Delete Handler ---

  // --- Handler for Edit/Save Button ---
  const toggleEditMode = () => {
      setIsColorEditMode(!isColorEditMode);
  };
  // --- End Edit/Save Handler ---

  // Calculate the toolbar vertical midpoint - more accurately point to the center of the button
  const toolHeight = 36; // Standard tool button height
  const toolVerticalCenter = toolButtonY + (toolHeight / 2);

  // Calculate dynamic position based on parent
  const subToolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${Math.max(20, toolVerticalCenter - 150)}px`, // Center the subtoolbar vertically with a minimum top margin
    left: snapSide === 'left' 
      ? `${parentPosition.x + parentWidth + 15}px` // Position to the right of parent
      : `${parentPosition.x - SUBTOOLBAR_WIDTH - 15}px`, // Position to the left with consistent width
    backgroundColor: theme.toolbar,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    padding: '15px',
    borderRadius: '8px',
    zIndex: 9, // Keep below main toolbar if overlapping temporarily
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: `${SUBTOOLBAR_WIDTH - 30}px`, // Account for padding
  };

  // Connector style - the small triangle that points to the tool
  const connectorStyle: React.CSSProperties = {
    position: 'absolute',
    width: '0',
    height: '0',
    // Position connector at exact tool center height
    ...(snapSide === 'left'
      ? {
          left: '-10px',
          top: `${toolVerticalCenter - parseInt(subToolbarStyle.top as string, 10)}px`,
          borderTop: `${CONNECTOR_SIZE}px solid transparent`,
          borderBottom: `${CONNECTOR_SIZE}px solid transparent`,
          borderRight: `${CONNECTOR_SIZE}px solid ${theme.toolbar}`,
        }
      : {
          right: '-10px',
          top: `${toolVerticalCenter - parseInt(subToolbarStyle.top as string, 10)}px`,
          borderTop: `${CONNECTOR_SIZE}px solid transparent`,
          borderBottom: `${CONNECTOR_SIZE}px solid transparent`,
          borderLeft: `${CONNECTOR_SIZE}px solid ${theme.toolbar}`,
        }),
  };
  
  return (
    <div
      style={subToolbarStyle} // Apply dynamic style
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Visual connector to the tool */}
      <div style={connectorStyle}></div>
      
      <div style={{ padding: '5px', textAlign: 'center', color: theme.toolbarText, fontWeight: 'bold' }}>
        Pen
      </div>
      
      {/* Thickness Control */}
      <DiscreteSliderControl
        label="Thickness"
        value={thickness}
        min={0.5}
        max={20}
        step={1}
        onChange={handleThicknessChange}
        unit=" px"
        marks={true}
      />

      {/* Color Selection Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
         {/* Colors Label and Edit/Save Button Row */}
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <label style={{ color: theme.toolbarText, fontWeight: 'bold' }}>Colors:</label>
            {/* Edit/Save Button */} 
            {availableColors.length === maxColors && !isColorEditMode && (
                <button onClick={toggleEditMode} title="Edit Colors" style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.toolbarText}}><EditIcon /></button>
            )}
            {isColorEditMode && (
                 <button onClick={toggleEditMode} title="Save Colors" style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.primary || 'dodgerblue'}}><SaveIcon /></button>
            )}
         </div>

         {/* Row for Existing Colors */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {availableColors.map((color) => (
            <div key={color} style={{ position: 'relative' }}> 
              <div 
                onClick={() => handleColorSelect(color)} 
                title={color}
                style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: color,
                  borderRadius: '50%',
                  border: selectedColor === color && !isColorEditMode ? `3px solid ${theme.primary || 'dodgerblue'}` : '2px solid rgba(255,255,255,0.5)',
                  cursor: isColorEditMode ? 'default' : 'pointer', // No pointer in edit mode
                  transition: 'border 0.1s ease-in-out',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              ></div>
              {/* Delete Button Overlay */} 
              {isColorEditMode && (
                <button
                  onClick={() => handleDeleteColor(color)}
                  title={`Delete ${color}`}
                  style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '1px solid white',
                      backgroundColor: 'rgba(40, 40, 40, 0.8)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '10px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 0,
                      lineHeight: '1',
                      zIndex: 1, // Ensure it's above the color circle
                  }}
                >
                    <DeleteIcon />
                </button>
              )}
            </div>
          ))}
          
          {/* Section for Adding New Color */}
          <div style={{ marginTop: '10px', minHeight: '50px', display: 'flex', alignItems: 'center' }}>
            {!isColorEditMode && (
              <>
               {!pendingColor && availableColors.length < maxColors && (
                  <button 
                    onClick={handleAddColorClick} 
                    title="Add Color" 
                    style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        border: `2px dashed ${theme.toolbarButtonText || 'gray'}`,
                        backgroundColor: 'transparent',
                        color: theme.toolbarButtonText || 'gray',
                        cursor: 'pointer', display: 'flex',
                        justifyContent: 'center', alignItems: 'center', padding: 0
                    }}>
                      <PaletteIcon /> 
                    </button>
               )}
               
               {pendingColor && (
                   <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', // Increased gap
                      border: `1px solid ${theme.toolbarButtonText || '#aaa'}`, 
                      padding: '6px 10px', // Increased padding
                      borderRadius: '22px' // Adjusted border radius
                   }}>
                      {/* Pending Color Preview (Larger) */}
                      <div style={{
                          width: '36px', height: '36px', // Increased size
                          borderRadius: '50%',
                          backgroundColor: pendingColor, 
                          border: '1px solid white'
                      }}></div>
                      {/* Confirm Button (Slightly larger container maybe) */}
                      <button onClick={handleConfirmAddColor} title="Confirm Color" style={{ background:'none', border:'none', cursor:'pointer', color: 'limegreen', padding: '2px'}}><ConfirmIcon /></button>
                      {/* Cancel Button (Slightly larger container maybe) */}
                      <button onClick={handleCancelAddColor} title="Cancel" style={{ background:'none', border:'none', cursor:'pointer', color: 'tomato', padding: '2px' }}><CancelIcon /></button>
                  </div>
               )}
              </>
            )}
            {/* Hidden Color Input - Moved inside this section for potential (minor) placement influence */}
            <input 
              type="color" 
              ref={colorInputRef} 
              onChange={handleColorInputChange} 
              style={{ 
                position: 'absolute', 
                opacity: 0, 
                pointerEvents: 'none', 
                width: 0, height: 0,
                border: 'none', padding: 0, margin: 0,
                // Attempt to position near button - may have little effect
                top: '5px', 
                left: '5px', 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PencilSubToolbar;