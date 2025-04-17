import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getCurrentTheme } from '../../utils/theme';
import DiscreteSliderControl from '../shared/DiscreteSliderControl';

interface ZoomControlPanelProps {
  initialScale: number;
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
  onScaleChange: (newScale: number) => void;
  // onClose: () => void; // Removed - Closing handled by parent toggle
}

const ZoomControlPanel: React.FC<ZoomControlPanelProps> = ({
  initialScale,
  minScale = 0.1,
  maxScale = 5.0,
  scaleStep = 0.1,
  onScaleChange,
  // onClose, // Removed
}) => {
  const theme = getCurrentTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  // Removing unused state
  
  // State for dragging
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  // Initial positioning effect
  useEffect(() => {
    if (panelRef.current) {
      const panelWidth = panelRef.current.offsetWidth;
      const initialX = window.innerWidth / 2 - panelWidth / 2;
      const initialY = window.innerHeight - 80; // Position near bottom edge
      setPosition({ x: initialX, y: initialY });
    }
  }, []); // Run once on mount

  // --- Drag Handlers ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      // Only allow dragging from the main panel body, not the slider or button
      if (e.target !== panelRef.current && (e.target as HTMLElement).closest('.no-drag')) {
          return;
      }
    
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    dragStartOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDragging(true);
    e.preventDefault(); // Prevent text selection
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStartOffset.current.x;
    const newY = e.clientY - dragStartOffset.current.y;
    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Optional: Add snapping logic here if desired, similar to ToolbarContainer
    // For now, just release drag
    
  }, [isDragging]);

  // Effect for global mouse listeners during drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // --- Slider Handler ---
  const handleSliderChange = (newValue: number) => {
    onScaleChange(newValue);
  };

  // --- Styles ---
  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    backgroundColor: theme.toolbar,
    color: theme.toolbarText,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    padding: '10px 15px',
    borderRadius: '8px',
    zIndex: 11, // Above main toolbar maybe
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '15px',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
  };

  return (
    <div ref={panelRef} style={panelStyle} onMouseDown={handleMouseDown}>
      <div className="no-drag" style={{ flexGrow: 1 }}> {/* Wrapper to prevent dragging on slider */}
        <DiscreteSliderControl
          label="Zoom"
          value={initialScale} // Use initialScale for display, parent controls actual scale
          min={minScale}
          max={maxScale}
          step={scaleStep}
          onChange={handleSliderChange}
          unit="x"
          marks={false} // Keep it cleaner
          width="200px"
        />
      </div>
       {/* Removed close button */}
    </div>
  );
};

export default ZoomControlPanel;