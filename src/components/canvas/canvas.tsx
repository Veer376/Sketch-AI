import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';
import ToolbarContainer from '../toolbar/ToolbarContainer';
import { getCurrentTheme } from '../../utils/theme';
import ToolManager from '../tools/ToolManager';
import { springAnimation } from '../../utils/animation';
import Dot from './backgrounds/Dot';
import Grid from './backgrounds/Grid';
import { GridType } from '../tools/grid/GridSubToolbar';
// import LineGrid from './backgrounds/LineGrid'; // Removed as it seems to cause an error
import ZoomControlPanel from '../controls/ZoomControlPanel';
import { TextFormattingOptions } from '../tools/text/TextSubToolbar';
// import './App.css';

// Define a type for the line objects
interface LineType {
  points: number[];
  thickness: number;
  color: string; // Ensure color is part of the type
}

// Define a type for the text layer objects
interface TextLayerType {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fill: string;
  width: number; // Required property for width
  height: number; // Required property for height
  isEditing?: boolean; // Flag to indicate if text is currently being edited
  fontFamily: string; // Font family
  isBold: boolean; // Bold formatting
  isItalic: boolean; // Italic formatting
  isUnderline: boolean; // Underline formatting
}

// Define a type for the history state that includes both lines and text layers
interface HistoryState {
  lines: LineType[];
  textLayers: TextLayerType[];
}

// Create a function to generate a colored pencil cursor
const generatePencilCursor = (color: string) => {
  return `data:image/svg+xml;base64,${btoa(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.3 8.925L15.05 4.675L16.45 3.275C17.05 2.675 17.834 2.375 18.8 2.375C19.767 2.375 20.55 2.675 21.15 3.275L22.725 4.85C23.325 5.45 23.625 6.234 23.625 7.2C23.625 8.167 23.325 8.95 22.725 9.55L21.325 10.95L19.3 8.925ZM17.875 10.35L8.675 19.55C8.175 20.05 7.584 20.42 6.9 20.662C6.217 20.904 5.517 21.025 4.8 21.025H3.975C3.708 21.025 3.487 20.937 3.312 20.762C3.137 20.587 3.05 20.367 3.05 20.1V19.275C3.05 18.559 3.172 17.859 3.415 17.175C3.657 16.492 4.025 15.9 4.525 15.4L13.725 6.2L17.875 10.35Z" fill="${color}"/>
  </svg>`)}`;
};

// Add initial state constants for positioning and scale
const INITIAL_SCALE = 1;
const INITIAL_POSITION = { x: 0, y: 0 };

function App() {
  const [lines, setLines] = useState<LineType[]>([]);
  const [textLayers, setTextLayers] = useState<TextLayerType[]>([]); // State for text layers
  const [editingTextLayerId, setEditingTextLayerId] = useState<string | null>(null); // State to track the ID of the text layer being edited
  const [history, setHistory] = useState<HistoryState[]>([]); // Update history to store both lines and text layers
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const isDrawing = useRef(false);
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [stagePosition, setStagePosition] = useState(INITIAL_POSITION);
  const [selectedTool, setSelectedTool] = useState<'pencil' | 'eraser' | 'grid' | 'text' | null>(null);
  const [pencilThickness, setPencilThickness] = useState(4);
  const [selectedColor, setSelectedColor] = useState<string>('black'); // Default color black, managed here
  const [gridType, setGridType] = useState<GridType>('lines');
  const [eraserSize, setEraserSize] = useState(25); // Add eraser size state here
  const [isZoomPanelVisible, setIsZoomPanelVisible] = useState(false); // State for zoom panel visibility
  const theme = getCurrentTheme();
  const stageRef = useRef<any>(null);
  const toolManager = useRef(new ToolManager());
  const lastPointerPosition = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [textFormatOptions, setTextFormatOptions] = useState<TextFormattingOptions>({
    fontSize: 20,
    fontFamily: 'Arial',
    isBold: false,
    isItalic: false,
    isUnderline: false
  });

  const handleToolSelect = (tool: 'pencil' | 'eraser' | 'grid' | 'text' | null) => {
    setSelectedTool(tool);
    toolManager.current.setTool(tool);
  };

  const handlePencilOptionsChange = (options: { thickness: number }) => {
    setPencilThickness(options.thickness);
    // Color is handled by onColorChange directly
  };

  const saveToHistory = () => {
    // Create a new history entry with current lines and text layers
    const newHistoryEntry: HistoryState = {
      lines: [...lines],
      textLayers: [...textLayers],
    };
    
    // Slice history to remove any future states (if we're undoing and then doing a new action)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newHistoryEntry);
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Define handleUndo and handleRedo as regular functions
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      // Restore previous state
      const prevState = history[historyIndex - 1];
      setLines([...prevState.lines]);
      setTextLayers([...prevState.textLayers]);
    } else if (historyIndex === 0) {
      // Clear everything if we're at the first history state
      setHistoryIndex(-1);
      setLines([]);
      setTextLayers([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      // Restore next state
      const nextState = history[newIndex];
      setLines([...nextState.lines]);
      setTextLayers([...nextState.textLayers]);
    }
  };

  const findLineIntersection = (pointerPos: { x: number; y: number }, eraserSize: number) => {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      for (let j = 0; j < line.points.length; j += 2) {
        const x = line.points[j];
        const y = line.points[j + 1];
        const distance = Math.sqrt(Math.pow(pointerPos.x - x, 2) + Math.pow(pointerPos.y - y, 2));
        if (distance < eraserSize) { // Use eraser size for intersection detection
          return i;
        }
      }
    }
    return -1;
  };

  useEffect(() => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    const container = stage.container();

    if (selectedTool === 'pencil') {
      const pencilCursor = `data:image/svg+xml;base64,${btoa(
        `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
          <path d='M19.3 8.925L15.05 4.675L16.45 3.275C17.05 2.675 17.834 2.375 18.8 2.375C19.767 2.375 20.55 2.675 21.15 3.275L22.725 4.85C23.325 5.45 23.625 6.234 23.625 7.2C23.625 8.167 23.325 8.95 22.725 9.55L21.325 10.95L19.3 8.925ZM17.875 10.35L8.675 19.55C8.175 20.05 7.584 20.42 6.9 20.662C6.217 20.904 5.517 21.025 4.8 21.025H3.975C3.708 21.025 3.487 20.937 3.312 20.762C3.137 20.587 3.05 20.367 3.05 20.1V19.275C3.05 18.559 3.172 17.859 3.415 17.175C3.657 16.492 4.025 15.9 4.525 15.4L13.725 6.2L17.875 10.35Z' fill='${selectedColor}'/>
        </svg>`
      )}`;
      container.style.cursor = `url('${pencilCursor}') 0 24, auto`;
    } else if (selectedTool === 'eraser') {
      // Adjust SVG dimensions to accommodate stroke width
      const svgSize = eraserSize + 2;
      const radius = eraserSize / 2;
      const center = svgSize / 2;

      const eraserCursor = `data:image/svg+xml;base64,${btoa(
        `<svg xmlns='http://www.w3.org/2000/svg' width='${svgSize}' height='${svgSize}' viewBox='0 0 ${svgSize} ${svgSize}'><circle cx='${center}' cy='${center}' r='${radius}' fill='lightgray' stroke='black' stroke-width='2'/></svg>`
      )}`;
      // Adjust hotspot to the center of the enlarged SVG
      container.style.cursor = `url('${eraserCursor}') ${center} ${center}, auto`;
    } else {
      container.style.cursor = 'default';
    }
  }, [selectedTool, selectedColor, scale, eraserSize]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: any) => {
    // Prevent default touch behavior (scrolling/panning) only when drawing or using text tool
    if (selectedTool === 'pencil' || selectedTool === 'eraser' || selectedTool === 'text') {
      e.evt.preventDefault();
    }

    // If editing text, clicking outside should finish editing
    if (editingTextLayerId) {
       // Logic to finish editing will be added later
       // For now, just return to avoid interference
       return; 
    }

    if (!selectedTool) return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    // Deselect text tool if clicking outside the stage or on an existing element (handled later)
    // if (selectedTool === 'text' && e.target !== stage) {
    //   setSelectedTool(null);
    //   return;
    // }

    const adjustedPointer = {
      x: (pointer.x - stage.x()) / scale,
      y: (pointer.y - stage.y()) / scale,
    };

    isDrawing.current = true;
    lastPointerPosition.current = adjustedPointer;

    if (selectedTool === 'pencil') {
      setLines((prevLines) => {
        const newLines = [
          ...prevLines,
          {
            points: [adjustedPointer.x, adjustedPointer.y],
            thickness: pencilThickness / scale, // Adjust thickness based on scale
            color: selectedColor, // Use the state variable directly
          },
        ];
        return newLines;
      });
    } else if (selectedTool === 'eraser') {
      // Use eraserSize state adjusted for scale for intersection detection
      const adjustedEraserSize = eraserSize / scale; 
      const lineIndex = findLineIntersection(adjustedPointer, adjustedEraserSize);

      if (lineIndex !== -1) {
        setLines((prevLines) => {
          const newLines = [...prevLines];
          newLines.splice(lineIndex, 1);
          return newLines;
        });

        setTimeout(() => {
          saveToHistory();
        }, 0);
      }
    } else if (selectedTool === 'text') {
      isDrawing.current = false; // Don't treat text insertion as drawing
      const newTextLayer: TextLayerType = {
        id: Date.now().toString(), // Simple unique ID
        x: adjustedPointer.x,
        y: adjustedPointer.y,
        text: '', // Set initial text to empty string
        fontSize: textFormatOptions.fontSize / scale, // Use format options
        fill: selectedColor,
        width: 100 / scale, // Initial width adjusted for scale
        height: 50 / scale, // Initial height adjusted for scale
        isEditing: true,
        fontFamily: textFormatOptions.fontFamily, // Use format options
        isBold: textFormatOptions.isBold, // Use format options
        isItalic: textFormatOptions.isItalic, // Use format options
        isUnderline: textFormatOptions.isUnderline, // Use format options
      };

      setTextLayers(prev => [...prev, newTextLayer]);
      setEditingTextLayerId(newTextLayer.id); // Set the new text layer as editing
      setSelectedTool(null); // Deselect text tool immediately

      // Add text creation to history
      setTimeout(() => {
        saveToHistory(); // Save after state updates
      }, 0);
    }
  };

  const handleMouseMove = (e: any) => {
    // Prevent default touch behavior (scrolling/panning) only when drawing
    if (isDrawing.current && (selectedTool === 'pencil' || selectedTool === 'eraser')) {
      e.evt.preventDefault();
    }

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    const adjustedPointer = {
      x: (pointer.x - stage.x()) / scale,
      y: (pointer.y - stage.y()) / scale,
    };

    if (isDrawing.current && selectedTool === 'pencil') {
      setLines((prev) => {
        const currentLine = prev[prev.length - 1];
        if (!currentLine) return prev;

        const newLine = {
          ...currentLine,
          points: [...currentLine.points, adjustedPointer.x, adjustedPointer.y],
          thickness: pencilThickness / scale, // Adjust thickness dynamically
        };
        return [...prev.slice(0, -1), newLine];
      });
    } else if (isDrawing.current && selectedTool === 'eraser') {
      // Use eraserSize state adjusted for scale for intersection detection
      const adjustedEraserSize = eraserSize / scale; 
      const lineIndex = findLineIntersection(adjustedPointer, adjustedEraserSize);

      if (lineIndex !== -1) {
        setLines((prevLines) => {
          const newLines = [...prevLines];
          newLines.splice(lineIndex, 1);
          return newLines;
        });
      }
    }

    lastPointerPosition.current = adjustedPointer;
  };

  const handleMouseUp = () => {
    if (isDrawing.current && selectedTool === 'pencil') {
      isDrawing.current = false;
      saveToHistory();
    }
  };

  const handleDragStart = (e: any) => {
    const stage = e.target.getStage();
    stage.container().style.cursor = 'grabbing';
  };

  const handleDragEnd = (e: any) => {
    const stage = e.target.getStage();
    if (selectedTool === 'pencil') {
      stage.container().style.cursor = `url('${generatePencilCursor(selectedColor)}') 0 24, auto`;
    } else if (selectedTool === 'eraser') {
      // Adjust SVG dimensions to accommodate stroke width
      const svgSize = eraserSize + 2;
      const radius = eraserSize / 2;
      const center = svgSize / 2;

      const eraserCursor = `data:image/svg+xml;base64,${btoa(
        `<svg xmlns='http://www.w3.org/2000/svg' width='${svgSize}' height='${svgSize}' viewBox='0 0 ${svgSize} ${svgSize}'><circle cx='${center}' cy='${center}' r='${radius}' fill='lightgray' stroke='black' stroke-width='2'/></svg>`
      )}`;
      // Adjust hotspot to the center of the enlarged SVG
      stage.container().style.cursor = `url('${eraserCursor}') ${center} ${center}, auto`;
    } else {
      stage.container().style.cursor = 'default';
    }
    const newPos = stage.position();
    setStagePosition(newPos);
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();

    if (e.evt.ctrlKey) {
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();

      const scaleBy = 1.1;
      let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      
      // Apply scale limits
      const minScale = 0.1;
      const maxScale = 3.0; // Changed max scale to 3.0
      newScale = Math.max(minScale, Math.min(maxScale, newScale));
      
      // Only update if the scale has changed
      if (newScale !== oldScale) {
        setScale(newScale);

        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        const newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };

        setStagePosition(newPos);
      }
    } else {
      const newPos = {
        x: stage.x() - e.evt.deltaX,
        y: stage.y() - e.evt.deltaY,
      };

      setStagePosition(newPos);
    }
  };

  // Add a handler to reset the canvas to its initial position with animation
  const handleCenterCanvas = () => {
    const startScale = scale;
    const startPosition = { ...stagePosition };
    const animationDuration = 500; // Duration in milliseconds
    
    // Animate scale with bounce effect
    springAnimation(
      startScale,
      INITIAL_SCALE,
      animationDuration,
      (value) => setScale(value),
      0.6, // More bouncy
      12  // Moderate speed
    );
    
    // Animate x position with bounce effect
    springAnimation(
      startPosition.x,
      INITIAL_POSITION.x,
      animationDuration,
      (value) => setStagePosition(prev => ({ ...prev, x: value })),
      0.7, // Standard bounce
      10  // Slightly slower
    );
    
    // Animate y position with bounce effect
    springAnimation(
      startPosition.y,
      INITIAL_POSITION.y,
      animationDuration,
      (value) => setStagePosition(prev => ({ ...prev, y: value })),
      0.7, // Standard bounce
      10  // Slightly slower
    );
  };

  // Add the handleResetCanvas function here
  const handleResetCanvas = () => {
    setLines([]); // Clear all drawings
    // Optionally, reset history if you want a clean slate
    // setHistory([]);
    // setHistoryIndex(-1);
    handleCenterCanvas(); // Center the canvas
  };

  const renderLines = () => {
    return lines.map((line, i) => (
      <Line
        key={i}
        points={line.points}
        stroke={line.color} // Use the color stored in the line object
        strokeWidth={line.thickness} // Use the dynamically adjusted thickness
        tension={0.5}
        lineCap="round"
        lineJoin="round"
      />
    ));
  };

  // Handler for text formatting changes
  const handleTextFormatOptionsChange = (options: Partial<TextFormattingOptions>) => {
    setTextFormatOptions(prev => ({ ...prev, ...options }));
    
    // If editing a text layer, apply the formatting options
    if (editingTextLayerId) {
      setTextLayers(prev => 
        prev.map(t => t.id === editingTextLayerId ? { ...t, ...options } : t)
      );
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        backgroundColor: theme.background,
        color: theme.foreground,
      }}
    >
      <ToolbarContainer
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
        toolManager={toolManager.current}
        onPencilOptionsChange={handlePencilOptionsChange}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        eraserSize={eraserSize}
        onEraserSizeChange={setEraserSize}
        textFormatOptions={textFormatOptions}
        onTextFormatOptionsChange={handleTextFormatOptionsChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex >= 0}
        canRedo={historyIndex < history.length - 1}
        onCenterCanvas={handleCenterCanvas}
        onResetCanvas={handleResetCanvas}
        gridType={gridType}
        onGridTypeChange={setGridType}
        onToggleZoomPanel={() => setIsZoomPanelVisible(!isZoomPanelVisible)}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
        }}
      >
        <div style={{ width: '100%', height: '100%' }}>
          <Stage
            ref={stageRef}
            width={windowSize.width}
            height={windowSize.height}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onWheel={handleWheel}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTouchStart={handleMouseDown} // Add touch handler
            onTouchMove={handleMouseMove}  // Add touch handler
            onTouchEnd={handleMouseUp}    // Add touch handler
            scaleX={scale}
            scaleY={scale}
            x={stagePosition.x}
            y={stagePosition.y}
            draggable={!(selectedTool === 'pencil' || selectedTool === 'eraser')} // Only draggable if NOT pencil/eraser
            style={{ backgroundColor: theme.canvas }}
          >
            <Layer>
              {gridType === 'dots' ? (
                <Dot
                  scale={scale}
                  stageWidth={windowSize.width}
                  stageHeight={windowSize.height}
                  stageX={stagePosition.x}
                  stageY={stagePosition.y}
                />
              ) : (
                <Grid
                  scale={scale}
                  stageWidth={windowSize.width}
                  stageHeight={windowSize.height}
                  stageX={stagePosition.x}
                  stageY={stagePosition.y}
                />
              )}
            </Layer>
            <Layer>{renderLines()}</Layer>
            {/* Layer for rendering text */}
            <Layer>
              {textLayers.map((textLayer) => (
                // Only render Konva.Text if not currently editing
                !textLayer.isEditing && (
                  <Text
                    key={textLayer.id}
                    id={textLayer.id}
                    x={textLayer.x}
                    y={textLayer.y}
                    text={textLayer.text}
                    fontSize={textLayer.fontSize}
                    fill={textLayer.fill}
                    width={textLayer.width}
                    height={textLayer.height}
                    fontFamily={textLayer.fontFamily}
                    fontStyle={
                      (textLayer.isBold && textLayer.isItalic) ? 'bold italic' : 
                      textLayer.isBold ? 'bold' : 
                      textLayer.isItalic ? 'italic' : 'normal'
                    }
                    textDecoration={textLayer.isUnderline ? 'underline' : ''}
                    onDblClick={() => {
                      // Enable editing on double-click
                      setTextLayers(prev =>
                        prev.map(t => t.id === textLayer.id ? { ...t, isEditing: true } : t)
                      );
                      setEditingTextLayerId(textLayer.id);
                      // Update text formatting options when starting to edit
                      setTextFormatOptions({
                        fontSize: textLayer.fontSize * scale, // Convert back to screen size
                        fontFamily: textLayer.fontFamily,
                        isBold: textLayer.isBold,
                        isItalic: textLayer.isItalic,
                        isUnderline: textLayer.isUnderline
                      });
                    }}
                    // TODO: Add drag handling for text later
                  />
                )
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
      
      {/* Render Zoom Control Panel conditionally */}
      {isZoomPanelVisible && (
        <ZoomControlPanel
          initialScale={scale} // Pass current scale
          minScale={0.1} // Define limits
          maxScale={3.0} // Changed max scale to 3.0
          scaleStep={0.05} // Finer step
          onScaleChange={(newScale) => setScale(newScale)} // Update canvas scale state
        />
      )}

      {/* Textarea for editing */}
      {editingTextLayerId && (() => {
        const textLayer = textLayers.find(t => t.id === editingTextLayerId);
        if (!textLayer) return null;

        // Calculate position and size on screen considering stage transform
        const textareaX = (textLayer.x * scale + stagePosition.x);
        const textareaY = (textLayer.y * scale + stagePosition.y);
        const textareaFontSize = textLayer.fontSize * scale; // Font size adjusted for scale

        const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          const newText = e.target.value;
          setTextLayers(prev => 
            prev.map(t => t.id === editingTextLayerId ? { ...t, text: newText } : t)
          );
          // TODO: Dynamically adjust textarea width/height based on content
        };

        const finishEditing = () => {
          // Store the current dimensions of the textarea before finishing edit
          const textarea = document.querySelector('textarea');
          if (textarea) {
            const width = textarea.clientWidth / scale;
            const height = textarea.clientHeight / scale;
            
            setTextLayers(prev =>
              prev.map(t => t.id === editingTextLayerId ? 
                { ...t, isEditing: false, width, height } : t)
            );
          } else {
            setTextLayers(prev =>
              prev.map(t => t.id === editingTextLayerId ? { ...t, isEditing: false } : t)
            );
          }
          setEditingTextLayerId(null);
          
          // Add text update to history
          setTimeout(() => {
            saveToHistory(); // Save after state updates
          }, 0);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent newline
            finishEditing();
          } else if (e.key === 'Escape') {
            finishEditing();
          } else if (e.key === 'Delete' && textLayer.text === '') {
            // Delete empty text layer
            setTextLayers(prev => prev.filter(t => t.id !== editingTextLayerId));
            setEditingTextLayerId(null);
            
            // Add deletion to history
            setTimeout(() => {
              saveToHistory();
            }, 0);
          }
        };

        return (
          <textarea
            value={textLayer.text}
            onChange={handleTextChange}
            onBlur={finishEditing} // Finish editing when textarea loses focus
            onKeyDown={handleKeyDown}
            style={{
              position: 'absolute',
              left: `${textareaX}px`,
              top: `${textareaY}px`,
              border: '1px dashed grey',
              padding: '0',
              margin: '0',
              overflow: 'hidden',
              background: 'none',
              outline: 'none',
              resize: 'both', // Enable resizing
              fontSize: `${textareaFontSize}px`,
              lineHeight: '1.2', // Adjust as needed
              fontFamily: textLayer.fontFamily,
              color: textLayer.fill,
              fontWeight: textLayer.isBold ? 'bold' : 'normal',
              fontStyle: textLayer.isItalic ? 'italic' : 'normal',
              textDecoration: textLayer.isUnderline ? 'underline' : 'none',
              transformOrigin: 'top left',
              whiteSpace: 'pre-wrap', // Handle wrapping
              minWidth: '20px', // Minimum width
              width: textLayer.width ? `${textLayer.width * scale * 2}px` : '100px', // Use stored width if available or default
              height: textLayer.height ? `${textLayer.height * scale * 4}px` : '50px', // Use stored height if available or default
              zIndex: 11, // Ensure textarea is above canvas content
              boxSizing: 'border-box',
            }}
            autoFocus // Focus the textarea immediately
          />
        );
      })()}
    </div>
  );
}

export default App;
