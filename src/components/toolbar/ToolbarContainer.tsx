import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentTheme } from '../../utils/theme';
import PencilTool from '../tools/pencil/PencilTool';
import PencilSubToolbar from '../tools/pencil/PencilSubToolbar';
import EraserTool from '../tools/eraser/EraserTool';
import EraserSubToolbar from '../tools/eraser/EraserSubToolbar'; // Import EraserSubToolbar
import ResetCanvasTool from '../tools/reset/ResetCanvasTool'; // Import ResetCanvasTool
import UndoButton from '../tools/history/UndoButton';
import RedoButton from '../tools/history/RedoButton';
import GridTool from '../tools/grid/GridTool'; // Import GridTool
import GridSubToolbar, { GridType } from '../tools/grid/GridSubToolbar'; // Import GridSubToolbar
import ToolManager from '../tools/ToolManager';
import CenterButton from '../tools/navigation/CenterButton'; // Import CenterButton
import { springAnimation } from '../../utils/animation'; // Import springAnimation

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
  onResetCanvas?: () => void; // Add onResetCanvas prop
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
  onResetCanvas, // Receive onResetCanvas
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
  
  // Toolbar position, dragging, and snapping state
  const initialY = window.innerHeight / 2 - 150; 
  const [position, setPosition] = useState({ x: 10, y: initialY }); 
  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarWidth, setToolbarWidth] = useState(0); // State for toolbar width
  const [snapSide, setSnapSide] = useState<'left' | 'right'>('left'); // State for snap side
  
  // Refs for tool buttons
  const pencilToolRef = useRef<HTMLDivElement>(null);
  const eraserToolRef = useRef<HTMLDivElement>(null);
  const gridToolRef = useRef<HTMLDivElement>(null);

  // State for tool button Y positions
  const [pencilButtonY, setPencilButtonY] = useState(0);
  const [eraserButtonY, setEraserButtonY] = useState(0);
  const [gridButtonY, setGridButtonY] = useState(0);
  
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
  
  // Update hover handlers to measure Y position
  const handlePencilHoverChange = (isHovered: boolean) => {
    if (isHovered) {
      if (pencilToolRef.current) {
        setPencilButtonY(pencilToolRef.current.getBoundingClientRect().top);
      }
      if (pencilHoverTimeoutRef.current !== null) clearTimeout(pencilHoverTimeoutRef.current);
      pencilHoverTimeoutRef.current = null;
      setIsPencilHovered(true);
    } else {
      pencilHoverTimeoutRef.current = window.setTimeout(() => {
        setIsPencilHovered(false);
        pencilHoverTimeoutRef.current = null;
      }, 100);
    }
  };
  
  const handleEraserHoverChange = (isHovered: boolean) => {
    if (isHovered) {
      if (eraserToolRef.current) {
        setEraserButtonY(eraserToolRef.current.getBoundingClientRect().top);
      }
      if (eraserHoverTimeoutRef.current !== null) clearTimeout(eraserHoverTimeoutRef.current);
      eraserHoverTimeoutRef.current = null;
      setIsEraserHovered(true);
    } else {
       eraserHoverTimeoutRef.current = window.setTimeout(() => {
        setIsEraserHovered(false);
        eraserHoverTimeoutRef.current = null;
      }, 100);
    }
  };
  
  const handleGridHoverChange = (isHovered: boolean) => {
    if (isHovered) {
       if (gridToolRef.current) {
         setGridButtonY(gridToolRef.current.getBoundingClientRect().top);
       }
      if (gridHoverTimeoutRef.current !== null) clearTimeout(gridHoverTimeoutRef.current);
      gridHoverTimeoutRef.current = null;
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
  
  // Effect to measure toolbar width
  useEffect(() => {
    if (toolbarRef.current) {
      setToolbarWidth(toolbarRef.current.offsetWidth);
    }
    // Re-measure if window resizes (optional, but good practice)
    const handleResize = () => {
      if (toolbarRef.current) {
        setToolbarWidth(toolbarRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Runs once on mount and on resize
  
  // MouseDown handler on the toolbar
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!toolbarRef.current) return;
    const rect = toolbarRef.current.getBoundingClientRect();
    dragStartOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDragging(true);
    // Prevent text selection during drag
    e.preventDefault(); 
  };

  // MouseMove handler (attached to window during drag)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStartOffset.current.x;
    const newY = e.clientY - dragStartOffset.current.y;
    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  // Updated MouseUp handler to set snapSide
  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!toolbarRef.current) return;
    const toolbarRect = toolbarRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const finalX = position.x;
    const finalY = position.y;
    const dropCenterX = finalX + toolbarRect.width / 2;
    const snapPadding = 10;

    // Determine closest horizontal edge and target X
    const snapLeftX = snapPadding;
    const snapRightX = windowWidth - toolbarRect.width - snapPadding;
    const isLeftCloser = dropCenterX < windowWidth / 2;
    const targetX = isLeftCloser ? snapLeftX : snapRightX;
    const currentSnapSide = isLeftCloser ? 'left' : 'right';
    setSnapSide(currentSnapSide); // Set the snap side state

    // Clamp and set target Y
    const clampedY = Math.max(snapPadding, Math.min(finalY, windowHeight - toolbarRect.height - snapPadding));
    const targetY = clampedY;

    // Animate X position
    springAnimation(
      finalX, targetX, 500,
      (value) => setPosition(prev => ({ ...prev, x: value })),
      0.7, 10
    );
    // Animate Y position
    springAnimation(
      finalY, targetY, 500,
      (value) => setPosition(prev => ({ ...prev, y: value })),
      0.7, 10
    );

  }, [isDragging, position.x, position.y]); 

  // Effect to add/remove global listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  return (
    <>
      {/* Main Toolbar Container - Always Vertical */}
      <div
        ref={toolbarRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          backgroundColor: theme.toolbar,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          padding: '10px',
          borderRadius: '8px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column', // Always column
          gap: '10px', // Keep vertical gap
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
         {/* Toolbar Content - Always Vertical */}
         <div ref={pencilToolRef}>
           <PencilTool isSelected={selectedTool === 'pencil'} onSelect={() => toggleTool('pencil')} onHoverChange={handlePencilHoverChange}/>
         </div>
         <div ref={eraserToolRef}>
           <EraserTool isSelected={selectedTool === 'eraser'} onSelect={() => toggleTool('eraser')} onHoverChange={handleEraserHoverChange} size={eraserSize}/>
         </div>
         <ResetCanvasTool onReset={onResetCanvas} />
         <div ref={gridToolRef}>
           <GridTool isSelected={selectedTool === 'grid'} onSelect={() => toggleTool('grid')} onHoverChange={handleGridHoverChange}/>
         </div>

         {/* Divider - Always Horizontal */}
        <div style={{
             width: '80%', 
             height: '1px', 
             backgroundColor: theme.toolbarButtonText, 
             opacity: 0.2, 
             margin: '5px auto' 
           }} />
        <CenterButton onClick={onCenterCanvas || (() => {})} />
        {/* Divider - Always Horizontal */}
         <div style={{
             width: '80%', 
             height: '1px', 
             backgroundColor: theme.toolbarButtonText, 
             opacity: 0.2, 
             margin: '5px auto' 
           }} />
        <UndoButton onClick={onUndo || (() => {})} disabled={!canUndo} />
        <RedoButton onClick={onRedo || (() => {})} disabled={!canRedo} />
      </div>

      {/* Tool-specific Subtoolbars - Still need adjustment, but simpler now */}
      <PencilSubToolbar 
        isVisible={shouldShowPencilSubToolbar} 
        thickness={pencilThickness}
        onThicknessChange={handleThicknessChange} 
        onHoverChange={handleSubToolbarHoverChange}
        selectedColor={selectedColor} 
        onColorChange={onColorChange} 
        parentPosition={position}
        parentWidth={toolbarWidth}
        snapSide={snapSide}
        toolButtonY={pencilButtonY}
      />

      <EraserSubToolbar 
        isVisible={shouldShowEraserSubToolbar}
        size={eraserSize} 
        onSizeChange={onEraserSizeChange} 
        onHoverChange={handleEraserSubToolbarHoverChange}
        parentPosition={position}
        parentWidth={toolbarWidth}
        snapSide={snapSide}
        toolButtonY={eraserButtonY}
      />

      <GridSubToolbar 
        isVisible={shouldShowGridSubToolbar}
        selectedType={gridType}
        onTypeChange={onGridTypeChange}
        onHoverChange={handleGridSubToolbarHoverChange}
        parentPosition={position}
        parentWidth={toolbarWidth}
        snapSide={snapSide}
        toolButtonY={gridButtonY}
      />
    </>
  );
};

export default ToolbarContainer;