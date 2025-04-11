import React, { useState, useEffect, useRef } from 'react';
import { getCurrentTheme } from '../../utils/theme';
import PencilTool from '../tools/pencil/PencilTool';
import PencilSubToolbar from '../tools/pencil/PencilSubToolbar';
import EraserTool from '../tools/eraser/EraserTool';
import EraserSubToolbar from '../tools/eraser/EraserSubToolbar'; // Import EraserSubToolbar
import UndoButton from '../tools/history/UndoButton';
import RedoButton from '../tools/history/RedoButton';
import GridTool from '../tools/grid/GridTool'; // Import GridTool
import GridSubToolbar, { GridType } from '../tools/grid/GridSubToolbar'; // Import GridSubToolbar
import ToolManager from '../tools/ToolManager';
import CenterButton from '../tools/navigation/CenterButton'; // Import CenterButton

export type Tool = 'pencil' | 'eraser' | 'grid' | null; // Remove 'text' from Tool type

interface ToolbarContainerProps {
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
  toolManager?: ToolManager;
  onPencilOptionsChange?: (options: { thickness: number }) => void;
  selectedColor: string; // Add selectedColor prop
  onColorChange: (color: string) => void; // Add onColorChange prop
  eraserSize: number; // Add eraserSize prop
  onEraserSizeChange: (size: number) => void; // Add onEraserSizeChange prop
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onCenterCanvas?: () => void; // Add onCenterCanvas prop
  gridType: GridType; // Add gridType prop
  onGridTypeChange: (type: GridType) => void; // Add onGridTypeChange prop
}

const ToolbarContainer: React.FC<ToolbarContainerProps> = ({ 
  selectedTool, 
  onToolSelect,
  toolManager = new ToolManager(),
  onPencilOptionsChange,
  selectedColor, // Receive selectedColor
  onColorChange, // Receive onColorChange
  eraserSize, // Receive eraserSize
  onEraserSizeChange, // Receive onEraserSizeChange
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onCenterCanvas, // Receive onCenterCanvas
  gridType, // Receive gridType
  onGridTypeChange, // Receive onGridTypeChange
}) => {
  const theme = getCurrentTheme();
  const [pencilThickness, setPencilThickness] = useState(2);
  const [isPencilHovered, setIsPencilHovered] = useState(false);
  const [isPencilSubToolbarHovered, setIsPencilSubToolbarHovered] = useState(false);
  const [isEraserHovered, setIsEraserHovered] = useState(false); // Add eraser hover state
  const [isEraserSubToolbarHovered, setIsEraserSubToolbarHovered] = useState(false); // Add eraser subtoolbar hover state
  const [isGridHovered, setIsGridHovered] = useState(false); // Add grid hover state
  const [isGridSubToolbarHovered, setIsGridSubToolbarHovered] = useState(false); // Add grid subtoolbar hover state
  
  // Separate timeout references for each component
  const pencilHoverTimeoutRef = useRef<number | null>(null);
  const subToolbarHoverTimeoutRef = useRef<number | null>(null);
  const eraserHoverTimeoutRef = useRef<number | null>(null); // Add eraser timeout ref
  const eraserSubToolbarHoverTimeoutRef = useRef<number | null>(null); // Add eraser subtoolbar timeout ref
  const gridHoverTimeoutRef = useRef<number | null>(null); // Add grid timeout ref
  const gridSubToolbarHoverTimeoutRef = useRef<number | null>(null); // Add grid subtoolbar timeout ref
  
  // Function to toggle a tool's selection state
  const toggleTool = (tool: Tool) => {
    onToolSelect(selectedTool === tool ? null : tool);
  };
  
  // When pencil thickness changes, update the tool manager and notify parent
  const handleThicknessChange = (thickness: number) => {
    setPencilThickness(thickness);
    toolManager.updateToolOption('pencil', 'thickness', thickness);
    
    if (onPencilOptionsChange) {
      onPencilOptionsChange({ thickness }); // Only notify about thickness
    }
  };

  const handleEraserSizeChange = (size: number) => { 
    toolManager.updateToolOption('eraser', 'size', size); 
    onEraserSizeChange(size); // Call the prop function passed from App
  };
  
  // Handle pencil hover state changes
  const handlePencilHoverChange = (isHovered: boolean) => {
    if (isHovered) {
      // Clear any existing timeout
      if (pencilHoverTimeoutRef.current !== null) {
        window.clearTimeout(pencilHoverTimeoutRef.current);
        pencilHoverTimeoutRef.current = null;
      }
      setIsPencilHovered(true);
    } else {
      // Add a small delay before hiding to allow moving to subtoolbar
      pencilHoverTimeoutRef.current = window.setTimeout(() => {
        setIsPencilHovered(false);
        pencilHoverTimeoutRef.current = null;
      }, 100);
    }
  };

  const handleEraserHoverChange = (isHovered: boolean) => { // Add eraser hover handler
    if (isHovered) {
      if (eraserHoverTimeoutRef.current !== null) {
        window.clearTimeout(eraserHoverTimeoutRef.current);
        eraserHoverTimeoutRef.current = null;
      }
      setIsEraserHovered(true);
    } else {
      eraserHoverTimeoutRef.current = window.setTimeout(() => {
        setIsEraserHovered(false);
        eraserHoverTimeoutRef.current = null;
      }, 100);
    }
  };

  const handleGridHoverChange = (isHovered: boolean) => { // Add grid hover handler
    if (isHovered) {
      if (gridHoverTimeoutRef.current !== null) {
        window.clearTimeout(gridHoverTimeoutRef.current);
        gridHoverTimeoutRef.current = null;
      }
      setIsGridHovered(true);
    } else {
      gridHoverTimeoutRef.current = window.setTimeout(() => {
        setIsGridHovered(false);
        gridHoverTimeoutRef.current = null;
      }, 100);
    }
  };
  
  // Handle subtoolbar hover state changes
  const handleSubToolbarHoverChange = (isHovered: boolean) => {
    if (isHovered) {
      // Clear any existing timeout
      if (subToolbarHoverTimeoutRef.current !== null) {
        window.clearTimeout(subToolbarHoverTimeoutRef.current);
        subToolbarHoverTimeoutRef.current = null;
      }
      setIsPencilSubToolbarHovered(true);
    } else {
      // Add a small delay before hiding to improve UX
      subToolbarHoverTimeoutRef.current = window.setTimeout(() => {
        setIsPencilSubToolbarHovered(false);
        subToolbarHoverTimeoutRef.current = null;
      }, 100);
    }
  };

  const handleEraserSubToolbarHoverChange = (isHovered: boolean) => { // Add eraser subtoolbar hover handler
    if (isHovered) {
      if (eraserSubToolbarHoverTimeoutRef.current !== null) {
        window.clearTimeout(eraserSubToolbarHoverTimeoutRef.current);
        eraserSubToolbarHoverTimeoutRef.current = null;
      }
      setIsEraserSubToolbarHovered(true);
    } else {
      eraserSubToolbarHoverTimeoutRef.current = window.setTimeout(() => {
        setIsEraserSubToolbarHovered(false);
        eraserSubToolbarHoverTimeoutRef.current = null;
      }, 100);
    }
  };

  const handleGridSubToolbarHoverChange = (isHovered: boolean) => { // Add grid subtoolbar hover handler
    if (isHovered) {
      if (gridSubToolbarHoverTimeoutRef.current !== null) {
        window.clearTimeout(gridSubToolbarHoverTimeoutRef.current);
        gridSubToolbarHoverTimeoutRef.current = null;
      }
      setIsGridSubToolbarHovered(true);
    } else {
      gridSubToolbarHoverTimeoutRef.current = window.setTimeout(() => {
        setIsGridSubToolbarHovered(false);
        gridSubToolbarHoverTimeoutRef.current = null;
      }, 100);
    }
  };
  
  // Determine if the subtoolbar should be visible
  const shouldShowPencilSubToolbar = 
    (selectedTool === 'pencil' && isPencilHovered) || 
    (selectedTool === 'pencil' && isPencilSubToolbarHovered);

  const shouldShowEraserSubToolbar = // Add eraser visibility logic
    (selectedTool === 'eraser' && isEraserHovered) ||
    (selectedTool === 'eraser' && isEraserSubToolbarHovered);

  const shouldShowGridSubToolbar = // Add grid visibility logic
    (selectedTool === 'grid' && isGridHovered) ||
    (selectedTool === 'grid' && isGridSubToolbarHovered);
  
  // Initialize with tool manager's default values if available
  /* useEffect(() => {
    const pencilOptions = toolManager.getToolOptions<{ thickness: number }>('pencil');
    if (pencilOptions?.thickness && pencilOptions.thickness !== pencilThickness) {
      setPencilThickness(pencilOptions.thickness);
    }
    // Remove eraser initialization as it's now handled by App.tsx
    // const eraserOptions = toolManager.getToolOptions<{ size: number }>('eraser');
    // if (eraserOptions?.size && eraserOptions.size !== eraserSize) {
    //   setEraserSize(eraserOptions.size);
    // }
  }, [toolManager]); */
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (pencilHoverTimeoutRef.current !== null) {
        window.clearTimeout(pencilHoverTimeoutRef.current);
      }
      if (subToolbarHoverTimeoutRef.current !== null) {
        window.clearTimeout(subToolbarHoverTimeoutRef.current);
      }
      if (eraserHoverTimeoutRef.current !== null) { // Add eraser timeout cleanup
        window.clearTimeout(eraserHoverTimeoutRef.current);
      }
      if (eraserSubToolbarHoverTimeoutRef.current !== null) { // Add eraser subtoolbar timeout cleanup
        window.clearTimeout(eraserSubToolbarHoverTimeoutRef.current);
      }
      if (gridHoverTimeoutRef.current !== null) { // Add grid timeout cleanup
        window.clearTimeout(gridHoverTimeoutRef.current);
      }
      if (gridSubToolbarHoverTimeoutRef.current !== null) { // Add grid subtoolbar timeout cleanup
        window.clearTimeout(gridSubToolbarHoverTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <>
      {/* Main Toolbar Container */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)',
          backgroundColor: theme.toolbar,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          padding: '10px',
          borderRadius: '8px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Drawing Tools */}
        <PencilTool 
          isSelected={selectedTool === 'pencil'} 
          onSelect={() => toggleTool('pencil')} 
          onHoverChange={handlePencilHoverChange}
        />
        
        <EraserTool 
          isSelected={selectedTool === 'eraser'} 
          onSelect={() => toggleTool('eraser')} 
          onHoverChange={handleEraserHoverChange} 
          size={eraserSize} // Added missing size property
        />

        <GridTool // Add GridTool
          isSelected={selectedTool === 'grid'}
          onSelect={() => toggleTool('grid')}
          onHoverChange={handleGridHoverChange}
        />
        
        {/* Divider */}
        <div 
          style={{
            width: '80%',
            height: '1px',
            backgroundColor: theme.toolbarButtonText,
            opacity: 0.2,
            margin: '5px auto',
          }}
        />
        
        {/* Navigation Tools */}
        <CenterButton 
          onClick={onCenterCanvas || (() => {})}
        />

        {/* Divider */}
        <div 
          style={{
            width: '80%',
            height: '1px',
            backgroundColor: theme.toolbarButtonText,
            opacity: 0.2,
            margin: '5px auto',
          }}
        />
        
        {/* History Tools */}
        <UndoButton 
          onClick={onUndo || (() => {})} 
          disabled={!canUndo}
        />
        
        <RedoButton 
          onClick={onRedo || (() => {})} 
          disabled={!canRedo}
        />
      </div>

      {/* Tool-specific Subtoolbars */}
      <PencilSubToolbar 
        isVisible={shouldShowPencilSubToolbar} 
        thickness={pencilThickness}
        onThicknessChange={handleThicknessChange} // Pass only thickness handler
        onHoverChange={handleSubToolbarHoverChange}
        selectedColor={selectedColor} // Pass down selectedColor
        onColorChange={onColorChange} // Pass down onColorChange
      />

      <EraserSubToolbar // Render EraserSubToolbar
        isVisible={shouldShowEraserSubToolbar}
        size={eraserSize} // Pass eraserSize down
        onSizeChange={onEraserSizeChange} // Pass onEraserSizeChange down
        onHoverChange={handleEraserSubToolbarHoverChange}
      />

      <GridSubToolbar // Render GridSubToolbar
        isVisible={shouldShowGridSubToolbar}
        selectedType={gridType}
        onTypeChange={onGridTypeChange}
        onHoverChange={handleGridSubToolbarHoverChange}
      />
    </>
  );
};

export default ToolbarContainer;