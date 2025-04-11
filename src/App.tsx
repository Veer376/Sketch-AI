import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
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

const ERASER_CURSOR = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1LjUgMTZsMy41LTMuNS00LjUtNC41LTcgNyAxLjUgMS41IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTMgMThIMjEiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik03LjUgMTVMMyAxMC41IDEwLjUgMyAxOCAxMC41IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K`;

function App() {
  const [lines, setLines] = useState<LineType[]>([]);
  const [history, setHistory] = useState<LineType[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isDrawing = useRef(false);
  const [scale, setScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState<'pencil' | 'eraser' | null>(null);
  const [pencilThickness, setPencilThickness] = useState(2);
  const theme = getCurrentTheme();
  const stageRef = useRef<any>(null);
  const toolManager = useRef(new ToolManager());
  const lastPointerPosition = useRef<{ x: number; y: number } | null>(null);

  const handleToolSelect = (tool: 'pencil' | 'eraser' | null) => {
    setSelectedTool(tool);
    toolManager.current.setTool(tool);
  };

  const handlePencilOptionsChange = (options: { thickness: number }) => {
    setPencilThickness(options.thickness);
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

  const findLineIntersection = (pointerPos: { x: number; y: number }) => {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      for (let j = 0; j < line.points.length; j += 2) {
        const x = line.points[j];
        const y = line.points[j + 1];
        const distance = Math.sqrt(Math.pow(pointerPos.x - x, 2) + Math.pow(pointerPos.y - y, 2));
        if (distance < 10) {
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
      container.style.cursor = `url('${PENCIL_CURSOR}') 0 24, auto`;
    } else if (selectedTool === 'eraser') {
      container.style.cursor = `url('${ERASER_CURSOR}') 0 24, auto`;
    } else {
      container.style.cursor = 'default';
    }
  }, [selectedTool]);

  const handleMouseDown = (e: any) => {
    if (!selectedTool) return;

    isDrawing.current = true;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    const adjustedPointer = {
      x: (pointer.x - stage.x()) / scale,
      y: (pointer.y - stage.y()) / scale,
    };

    lastPointerPosition.current = adjustedPointer;

    if (selectedTool === 'pencil') {
      setLines((prevLines) => {
        const newLines = [
          ...prevLines,
          {
            points: [adjustedPointer.x, adjustedPointer.y],
            thickness: pencilThickness,
          },
        ];
        return newLines;
      });
    } else if (selectedTool === 'eraser') {
      const lineIndex = findLineIntersection(adjustedPointer);

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
    if (!isDrawing.current || !selectedTool) return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    const adjustedPointer = {
      x: (pointer.x - stage.x()) / scale,
      y: (pointer.y - stage.y()) / scale,
    };

    if (selectedTool === 'pencil') {
      setLines((prev) => {
        const currentLine = prev[prev.length - 1];
        if (!currentLine) return prev;

        const newLine = {
          ...currentLine,
          points: [...currentLine.points, adjustedPointer.x, adjustedPointer.y],
        };
        return [...prev.slice(0, -1), newLine];
      });
    } else if (selectedTool === 'eraser') {
      const lineIndex = findLineIntersection(adjustedPointer);

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
    if (!isDrawing.current || !selectedTool) return;

    isDrawing.current = false;

    if (selectedTool === 'pencil') {
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
      stage.container().style.cursor = `url('${PENCIL_CURSOR}') 0 24, auto`;
    } else if (selectedTool === 'eraser') {
      stage.container().style.cursor = `url('${ERASER_CURSOR}') 0 24, auto`;
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
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex >= 0}
        canRedo={historyIndex < history.length - 1}
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
            draggable={!selectedTool}
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
