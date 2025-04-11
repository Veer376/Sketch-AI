import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { Tool } from './components/Toolbar';
import ToolbarContainer from './components/toolbar/ToolbarContainer';
import { getCurrentTheme } from './utils/theme';
import ToolManager from './components/tools/ToolManager';
import './App.css';

// Define a type for the line objects
interface LineType {
  points: number[];
  thickness: number;
}

// Base64 encoded pencil cursor
const PENCIL_CURSOR = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5LjMgOC45MjVMMTUuMDUgNC42NzVMMTYuNDUgMy4yNzVDMTcuMDUgMi42NzUgMTcuODM0IDIuMzc1IDE4LjggMi4zNzVDMTkuNzY3IDIuMzc1IDIwLjU1IDIuNjc1IDIxLjE1IDMuMjc1TDIyLjcyNSA0Ljg1QzIzLjMyNSA1LjQ1IDIzLjYyNSA2LjIzNCAyMy42MjUgNy4yQzIzLjYyNSA4LjE2NyAyMy4zMjUgOC45NSAyMi43MjUgOS41NUwyMS4zMjUgMTAuOTVMMTkuMyA4LjkyNVpNMTcuODc1IDEwLjM1TDguNjc1IDE5LjU1QzguMTc1IDIwLjA1IDcuNTg0IDIwLjQyIDYuOSAyMC42NjJDNi4yMTcgMjAuOTA0IDUuNTE3IDIxLjAyNSA0LjggMjEuMDI1SDMuOTc1QzMuNzA4IDIxLjAyNSAzLjQ4NyAyMC45MzcgMy4zMTIgMjAuNzYyQzMuMTM3IDIwLjU4NyAzLjA1IDIwLjM2NyAzLjA1IDIwLjFWMTkuMjc1QzMuMDUgMTguNTU5IDMuMTcyIDE3Ljg1OSAzLjQxNSAxNy4xNzVDMy42NTcgMTYuNDkyIDQuMDI1IDE1LjkgNC41MjUgMTUuNEwxMy43MjUgNi4yTDE3Ljg3NSAxMC4zNVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=`;

function App() {
  const [lines, setLines] = useState<LineType[]>([]);
  const isDrawing = useRef(false);
  const [scale, setScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState<Tool>(null);
  const [pencilThickness, setPencilThickness] = useState(2);
  const theme = getCurrentTheme();
  const stageRef = useRef<any>(null);
  const toolManager = useRef(new ToolManager());

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    toolManager.current.setTool(tool);
  };

  const handlePencilOptionsChange = (options: { thickness: number }) => {
    setPencilThickness(options.thickness);
  };

  // Update cursor based on selected tool
  useEffect(() => {
    if (!stageRef.current) return;
    
    const stage = stageRef.current;
    const container = stage.container();
    
    if (selectedTool === 'pencil') {
      container.style.cursor = `url('${PENCIL_CURSOR}') 0 24, auto`;
    } else {
      container.style.cursor = 'default';
    }
  }, [selectedTool]);

  const handleMouseDown = (e: any) => {
    if (selectedTool !== 'pencil') return;
    isDrawing.current = true;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    // Adjust pointer position based on scale and position
    const adjustedPointer = {
      x: (pointer.x - stage.x()) / scale,
      y: (pointer.y - stage.y()) / scale,
    };

    // Start a new line with current thickness
    setLines((prev) => [...prev, { 
      points: [adjustedPointer.x, adjustedPointer.y],
      thickness: pencilThickness
    }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || selectedTool !== 'pencil') return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    // Adjust pointer position based on scale and position
    const adjustedPointer = {
      x: (pointer.x - stage.x()) / scale,
      y: (pointer.y - stage.y()) / scale,
    };

    // Continue drawing line
    setLines((prev) => {
      const currentLine = prev[prev.length - 1];
      if (!currentLine) return prev;

      const newLine = {
        ...currentLine,
        points: [...currentLine.points, adjustedPointer.x, adjustedPointer.y],
      };
      return [...prev.slice(0, -1), newLine];
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
  };

  const handleDragStart = (e: any) => {
    const stage = e.target.getStage();
    stage.container().style.cursor = 'grabbing';
  };

  const handleDragEnd = (e: any) => {
    const stage = e.target.getStage();
    stage.container().style.cursor = 'default';
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
      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

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
    } else {
      const newPos = {
        x: stage.x() - e.evt.deltaX,
        y: stage.y() - e.evt.deltaY,
      };

      setStagePosition(newPos);
    }
  };

  return (
    <div
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
            width={window.innerWidth}
            height={window.innerHeight}
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
            draggable={selectedTool !== 'pencil'}
            style={{ backgroundColor: theme.canvas }}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={theme.foreground}
                  strokeWidth={(line.thickness || 2) / scale}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}

export default App;
