import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import ToolbarContainer from '../toolbar/ToolbarContainer';
import { getCurrentTheme } from '../../utils/theme';
import ToolManager from '../tools/ToolManager';
import { springAnimation } from '../../utils/animation';
import DotGrid from './backgrounds/Grid';
import LineGrid from './backgrounds/LineGrid';
import { GridType } from '../tools/grid/GridSubToolbar';
// import './App.css';

// Define a type for the line objects
interface LineType {
  points: number[];
  thickness: number;
  color: string; // Ensure color is part of the type
}

// Create a function to generate a colored pencil cursor
const generatePencilCursor = (color: string) => {
  return `data:image/svg+xml;base64,${btoa(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.3 8.925L15.05 4.675L16.45 3.275C17.05 2.675 17.834 2.375 18.8 2.375C19.767 2.375 20.55 2.675 21.15 3.275L22.725 4.85C23.325 5.45 23.625 6.234 23.625 7.2C23.625 8.167 23.325 8.95 22.725 9.55L21.325 10.95L19.3 8.925ZM17.875 10.35L8.675 19.55C8.175 20.05 7.584 20.42 6.9 20.662C6.217 20.904 5.517 21.025 4.8 21.025SDMuOTc1QzMuNzA4IDIxLjAyNSAzLjQ4NyAyMC45MzcgMy4zMTIgMjAuNzYyQzMuMTM3IDIwLjU4NyAzLjA1IDIwLjM2NyAzLjA1IDIwLjFWMTkuMjc1QzMuMDUgMTguNTU5IDMuMTcyIDE3Ljg1OSAzLjQxNSAxNy4xNzVDMy42NTcgMTYuNDkyIDQuMDI1IDE1LjkgNC41MjUgMTUuNEwxMy43MjUgNi4yTDE3Ljg3NSAxMC4zNVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=`)}`;
};

// Add initial state constants for positioning and scale
const INITIAL_SCALE = 1;
const INITIAL_POSITION = { x: 0, y: 0 };

function App() {
  const [lines, setLines] = useState<LineType[]>([]);
  const [history, setHistory] = useState<LineType[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const isDrawing = useRef(false);
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [stagePosition, setStagePosition] = useState(INITIAL_POSITION);
  const [selectedTool, setSelectedTool] = useState<'pencil' | 'eraser' | 'grid' | null>(null);
  const [pencilThickness, setPencilThickness] = useState(2);
  const [selectedColor, setSelectedColor] = useState<string>('black'); // Default color black, managed here
  const [gridType, setGridType] = useState<GridType>('lines');
  const [eraserSize, setEraserSize] = useState(10); // Add eraser size state here
  const theme = getCurrentTheme();
  const stageRef = useRef<any>(null);
  const toolManager = useRef(new ToolManager());
  const lastPointerPosition = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleToolSelect = (tool: 'pencil' | 'eraser' | 'grid' | null) => {
    setSelectedTool(tool);
    toolManager.current.setTool(tool);
  };

  const handlePencilOptionsChange = (options: { thickness: number }) => {
    setPencilThickness(options.thickness);
    // Color is handled by onColorChange directly
  };

  const saveToHistory = (currentLines: LineType[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...currentLines]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLines([...history[historyIndex - 1]]);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setLines([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setLines([...history[newIndex]]);
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
    if (!selectedTool) return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

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
          saveToHistory([...lines]);
        }, 0);
      }
    }
  };

  const handleMouseMove = (e: any) => {
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
      saveToHistory([...lines]);
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
      
      // Add scale limits to prevent infinite zoom
      const minScale = 0.1;  // Minimum scale (zoomed out)
      const maxScale = 5.0;  // Maximum scale (zoomed in)
      
      // Ensure the new scale is within bounds
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
        onPencilOptionsChange={handlePencilOptionsChange} // Only thickness needed now
        selectedColor={selectedColor} // Pass down the color state
        onColorChange={setSelectedColor} // Pass down the state setter
        eraserSize={eraserSize} // Pass eraserSize state
        onEraserSizeChange={setEraserSize} // Pass eraserSize setter
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex >= 0}
        canRedo={historyIndex < history.length - 1}
        onCenterCanvas={handleCenterCanvas} // Add the center canvas handler
        onResetCanvas={handleResetCanvas} // Pass the reset canvas handler
        gridType={gridType}
        onGridTypeChange={setGridType}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
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
            scaleX={scale}
            scaleY={scale}
            x={stagePosition.x}
            y={stagePosition.y}
            draggable={!selectedTool}
            style={{ backgroundColor: theme.canvas }}
          >
            <Layer>
              {gridType === 'dots' ? (
                <DotGrid
                  scale={scale}
                  stageWidth={windowSize.width}
                  stageHeight={windowSize.height}
                  stageX={stagePosition.x}
                  stageY={stagePosition.y}
                />
              ) : (
                <LineGrid
                  scale={scale}
                  stageWidth={windowSize.width}
                  stageHeight={windowSize.height}
                  stageX={stagePosition.x}
                  stageY={stagePosition.y}
                />
              )}
            </Layer>
            <Layer>{renderLines()}</Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}

export default App;
