import React, { useState, useEffect, useRef } from 'react';
import { getCurrentTheme } from '../../utils/theme';
import PencilTool from '../tools/pencil/PencilTool';
import PencilSubToolbar from '../tools/pencil/PencilSubToolbar';
import EraserTool from '../tools/eraser/EraserTool';
import UndoButton from '../tools/history/UndoButton';
import RedoButton from '../tools/history/RedoButton';
import ToolManager from '../tools/ToolManager';

export type Tool = 'pencil' | 'eraser' | null;

interface ToolbarContainerProps {
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
  toolManager?: ToolManager;
  onPencilOptionsChange?: (options: { thickness: number }) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const ToolbarContainer: React.FC<ToolbarContainerProps> = ({ 
  selectedTool, 
  onToolSelect,
  toolManager = new ToolManager(),
  onPencilOptionsChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  const theme = getCurrentTheme();
  const [pencilThickness, setPencilThickness] = useState(2);
  const [isPencilHovered, setIsPencilHovered] = useState(false);
  const [isPencilSubToolbarHovered, setIsPencilSubToolbarHovered] = useState(false);
  
  // Separate timeout references for each component
  const pencilHoverTimeoutRef = useRef<number | null>(null);
  const subToolbarHoverTimeoutRef = useRef<number | null>(null);
  
  // Function to toggle a tool's selection state
  const toggleTool = (tool: Tool) => {
    onToolSelect(selectedTool === tool ? null : tool);
  };
  
  // When pencil thickness changes, update the tool manager and notify parent
  const handleThicknessChange = (thickness: number) => {
    setPencilThickness(thickness);
    toolManager.updateToolOption('pencil', 'thickness', thickness);
    
    if (onPencilOptionsChange) {
      onPencilOptionsChange({ thickness });
    }
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
  
  // Determine if the subtoolbar should be visible
  const shouldShowPencilSubToolbar = 
    (selectedTool === 'pencil' && isPencilHovered) || 
    (selectedTool === 'pencil' && isPencilSubToolbarHovered);
  
  // Initialize with tool manager's default values if available
  useEffect(() => {
    const pencilOptions = toolManager.getToolOptions<{ thickness: number }>('pencil');
    if (pencilOptions?.thickness && pencilOptions.thickness !== pencilThickness) {
      setPencilThickness(pencilOptions.thickness);
    }
  }, [toolManager]);
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (pencilHoverTimeoutRef.current !== null) {
        window.clearTimeout(pencilHoverTimeoutRef.current);
      }
      if (subToolbarHoverTimeoutRef.current !== null) {
        window.clearTimeout(subToolbarHoverTimeoutRef.current);
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
          onHoverChange={() => {}}
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
        onThicknessChange={handleThicknessChange}
        onHoverChange={handleSubToolbarHoverChange}
      />
    </>
  );
};

export default ToolbarContainer;