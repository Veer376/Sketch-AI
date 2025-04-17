import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Line, Text, Group, Rect } from 'react-konva';
import ToolbarContainer from '../toolbar/ToolbarContainer';
import { getCurrentTheme } from '../../utils/theme';
import ToolManager from '../tools/ToolManager';
import { springAnimation } from '../../utils/animation';
import Dot from './backgrounds/Dot';
import Grid from './backgrounds/Grid';
import { GridType } from '../tools/grid/GridSubToolbar';
import ZoomControlPanel from '../controls/ZoomControlPanel';
import { TextFormattingOptions } from '../tools/text/TextSubToolbar';
import { NoteStyle, NOTE_STYLES } from '../tools/note/NoteSubToolbar';

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

// Define a type for the note layer objects
interface NoteLayerType {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  width: number;
  height: number;
  styleId: string;
  isEditing?: boolean;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

// Define a type for Gemini response card with additional styling properties
interface GeminiResponseCardType {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  response: string;
  isVisible: boolean;
  animationComplete?: boolean;
  isResizing?: boolean;
}

// Define a type for the history state that includes lines, text layers, and notes
interface HistoryState {
  lines: LineType[];
  textLayers: TextLayerType[];
  noteLayers: NoteLayerType[];
  geminiResponseCards: GeminiResponseCardType[];
}

// Export Canvas ref interface for parent components to use
export interface CanvasRef {
  getStage: () => any;
  captureImage: () => string;
  addGeminiResponseCard: (response: string, position?: { x: number, y: number }) => string;
  updateGeminiResponseCard: (id: string, updates: Partial<GeminiResponseCardType>) => void;
  removeGeminiResponseCard: (id: string) => void;
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

// Convert Canvas to forwardRef component
const Canvas = forwardRef<CanvasRef>((_, ref) => {
  const [lines, setLines] = useState<LineType[]>([]);
  const [textLayers, setTextLayers] = useState<TextLayerType[]>([]); // State for text layers
  const [noteLayers, setNoteLayers] = useState<NoteLayerType[]>([]); // State for note layers
  const [geminiResponseCards, setGeminiResponseCards] = useState<GeminiResponseCardType[]>([]); // State for Gemini response cards
  const [editingTextLayerId, setEditingTextLayerId] = useState<string | null>(null); // State to track the ID of the text layer being edited
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null); // State to track the ID of the note being edited
  const [history, setHistory] = useState<HistoryState[]>([]); // Update history to store both lines and text layers
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const isDrawing = useRef(false);
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [stagePosition, setStagePosition] = useState(INITIAL_POSITION);
  const [selectedTool, setSelectedTool] = useState<'pencil' | 'eraser' | 'grid' | 'text' | 'note' | null>(null);
  const [pencilThickness, setPencilThickness] = useState(4);
  const [selectedColor, setSelectedColor] = useState<string>('red'); // Default color black, managed here
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
  const [selectedNoteStyle, setSelectedNoteStyle] = useState<string>('yellow-note'); // Default note style

  // Effect to handle Gemini response card animations
  useEffect(() => {
    // Find any visible cards that need animation
    const cardsNeedingAnimation = geminiResponseCards.filter(
      card => card.isVisible && !card.animationComplete
    );
    
    // Set up timers for each card
    const timers = cardsNeedingAnimation.map(card => {
      return setTimeout(() => {
        setGeminiResponseCards(prev => 
          prev.map(c => c.id === card.id ? { ...c, animationComplete: true } : c)
        );
      }, 2000);
    });
    
    // Clean up all timers on unmount or when dependencies change
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [geminiResponseCards]);

  // Expose the stageRef to parent components
  useImperativeHandle(ref, () => ({
    // Return the Stage instance
    getStage: () => stageRef.current,
    
    // Helper method to capture the canvas as a data URL WITH all drawings and elements
    captureImage: () => {
      if (stageRef.current) {
        // This approach will properly capture all Konva layers including strokes, text, etc.
        // We're using the toCanvas method which creates a real HTML canvas with all layers
        const dataURL = stageRef.current.toDataURL({
          pixelRatio: 2, // Higher quality
          mimeType: 'image/png',
          // Make sure we include all the content
          callback: (img: HTMLImageElement) => {
            console.log('Canvas exported successfully', img.width, img.height);
          }
        });
        
        return dataURL;
      }
      return null;
    },

    // Add a Gemini response card to the canvas
    addGeminiResponseCard: (response: string, position = { x: 0, y: 0 }) => {
      const newCard: GeminiResponseCardType = {
        id: Date.now().toString(),
        x: position.x,
        y: position.y,
        width: 300,
        height: 150,
        response,
        isVisible: true,
      };
      setGeminiResponseCards((prev) => [...prev, newCard]);
      return newCard.id;
    },

    // Update an existing Gemini response card
    updateGeminiResponseCard: (id: string, updates: Partial<GeminiResponseCardType>) => {
      setGeminiResponseCards((prev) =>
        prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
      );
    },

    // Remove a Gemini response card from the canvas
    removeGeminiResponseCard: (id: string) => {
      setGeminiResponseCards((prev) => prev.filter((card) => card.id !== id));
    },
  }));

  const handleToolSelect = (tool: 'pencil' | 'eraser' | 'grid' | 'text' | 'note' | null) => {
    setSelectedTool(tool);
    toolManager.current.setTool(tool);
  };

  const handlePencilOptionsChange = (options: { thickness: number }) => {
    setPencilThickness(options.thickness);
    // Color is handled by onColorChange directly
  };

  const saveToHistory = () => {
    // Create a new history entry with current lines, text layers, note layers, and Gemini response cards
    const newHistoryEntry: HistoryState = {
      lines: [...lines],
      textLayers: [...textLayers],
      noteLayers: [...noteLayers],
      geminiResponseCards: [...geminiResponseCards],
    };
    
    // Slice history to remove any future states
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newHistoryEntry);
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Update handleUndo and handleRedo to include Gemini response cards
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      // Restore previous state
      const prevState = history[historyIndex - 1];
      setLines([...prevState.lines]);
      setTextLayers([...prevState.textLayers]);
      setNoteLayers([...prevState.noteLayers]);
      setGeminiResponseCards([...prevState.geminiResponseCards]);
    } else if (historyIndex === 0) {
      // Clear everything if we're at the first history state
      setHistoryIndex(-1);
      setLines([]);
      setTextLayers([]);
      setNoteLayers([]);
      setGeminiResponseCards([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      // If we're at -1 (the initial state), we need to go to index 0
      const newIndex = historyIndex === -1 ? 0 : historyIndex + 1;
      setHistoryIndex(newIndex);
      // Restore next state
      const nextState = history[newIndex];
      setLines([...nextState.lines]);
      setTextLayers([...nextState.textLayers]);
      setNoteLayers([...nextState.noteLayers]);
      setGeminiResponseCards([...nextState.geminiResponseCards]);
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
      if (containerRef.current) {
        // Get the actual container size instead of the window size
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        setWindowSize({
          width: containerWidth,
          height: containerHeight
        });
      } else {
        // Fallback to window size if container ref isn't available
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };

    // Call once to set initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: any) => {
    // Prevent default touch behavior when using drawing tools
    if (selectedTool === 'pencil' || selectedTool === 'eraser' || selectedTool === 'text' || selectedTool === 'note') {
      e.evt.preventDefault();
    }

    // If editing text or note, clicking outside should finish editing
    if (editingTextLayerId || editingNoteId) {
      return; 
    }

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
    } else if (selectedTool === 'note') {
      isDrawing.current = false; // Don't treat note insertion as drawing
      const newNote: NoteLayerType = {
        id: Date.now().toString(), // Simple unique ID
        x: adjustedPointer.x,
        y: adjustedPointer.y,
        text: '', // Set initial text to empty string
        fontSize: textFormatOptions.fontSize / scale,
        width: 200 / scale, // Notes are larger than text boxes
        height: 150 / scale,
        styleId: selectedNoteStyle,
        isEditing: true,
        fontFamily: textFormatOptions.fontFamily,
        isBold: textFormatOptions.isBold,
        isItalic: textFormatOptions.isItalic,
        isUnderline: textFormatOptions.isUnderline,
      };

      setNoteLayers(prev => [...prev, newNote]);
      setEditingNoteId(newNote.id); // Set the new note as editing
      setSelectedTool(null); // Deselect note tool immediately

      // Add note creation to history
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
    setTextLayers([]); // Clear all text layers
    setNoteLayers([]); // Clear all notes
    setGeminiResponseCards([]); // Clear all Gemini response cards
    
    // Reset history for a clean slate
    setHistory([]);
    setHistoryIndex(-1);
    
    // Reset any active editing states
    setEditingTextLayerId(null);
    setEditingNoteId(null);
    
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

  // Function to handle note style changes
  const handleNoteStyleChange = (styleId: string) => {
    setSelectedNoteStyle(styleId);
    
    // If editing a note, apply the style change
    if (editingNoteId) {
      setNoteLayers(prev => 
        prev.map(note => note.id === editingNoteId ? { ...note, styleId } : note)
      );
    }
  };

  // Function to find the note style by ID
  const getNoteStyle = (styleId: string): NoteStyle => {
    return NOTE_STYLES.find(style => style.id === styleId) || NOTE_STYLES[0];
  };
  
  // Render notes function
  const renderNotes = () => {
    return noteLayers.map((note) => (
      !note.isEditing && (
        <Group
          key={note.id}
          x={note.x}
          y={note.y}
          width={note.width}
          height={note.height}
          draggable={selectedTool === null}
          onDragStart={(e) => {
            // Set cursor to grabbing during drag
            const stage = e.target.getStage();
            if (stage) {
              stage.container().style.cursor = 'grabbing';
            }
          }}
          onDragEnd={(e) => {
            // Update the note's position in state
            const newPos = e.target.position();
            setNoteLayers(prev =>
              prev.map(n => n.id === note.id ? 
                { ...n, x: newPos.x, y: newPos.y } : n
              )
            );
            
            // Reset cursor
            const stage = e.target.getStage();
            if (stage) {
              stage.container().style.cursor = 'default';
            }
            
            // Save to history after position update
            setTimeout(() => {
              saveToHistory();
            }, 0);
          }}
          onDblClick={() => {
            // Enable editing on double-click
            setNoteLayers(prev =>
              prev.map(n => n.id === note.id ? { ...n, isEditing: true } : n)
            );
            setEditingNoteId(note.id);
            // Update text formatting options
            setTextFormatOptions({
              fontSize: note.fontSize * scale,
              fontFamily: note.fontFamily,
              isBold: note.isBold,
              isItalic: note.isItalic,
              isUnderline: note.isUnderline
            });
          }}
        >
          {/* Note background */}
          <Rect
            width={note.width}
            height={note.height}
            fill={getNoteStyle(note.styleId).backgroundColor}
            stroke={getNoteStyle(note.styleId).borderColor}
            strokeWidth={1}
            shadowColor="rgba(0,0,0,0.3)"
            shadowBlur={5}
            shadowOffsetX={2}
            shadowOffsetY={2}
            cornerRadius={3}
          />
          {/* Note header */}
          <Rect
            width={note.width}
            height={8}
            fill={getNoteStyle(note.styleId).accentColor}
            cornerRadius={[3, 3, 0, 0]}
          />
          {/* Note text */}
          <Text
            x={10}
            y={15}
            text={note.text}
            fontSize={note.fontSize}
            fontFamily={note.fontFamily}
            fill="#333333"
            width={note.width - 20}
            height={note.height - 25}
            fontStyle={
              (note.isBold && note.isItalic) ? 'bold italic' : 
              note.isBold ? 'bold' : 
              note.isItalic ? 'italic' : 'normal'
            }
            textDecoration={note.isUnderline ? 'underline' : ''}
          />
        </Group>
      )
    ));
  };

  // Render Gemini response cards function - with beautiful UI
  const renderGeminiResponseCards = () => {
    return geminiResponseCards.map((card) => {
      if (!card.isVisible) return null;
      
      return (
        <Group
          key={card.id}
          x={card.x}
          y={card.y}
          width={card.width}
          height={card.height}
          draggable={selectedTool === null}
          onDragStart={() => {
            // Set cursor to grabbing during drag
            const stage = stageRef.current;
            if (stage) {
              stage.container().style.cursor = 'grabbing';
            }
          }}
          onDragEnd={(e) => {
            // Update the card's position in state
            const newPos = e.target.position();
            setGeminiResponseCards(prev =>
              prev.map(c => c.id === card.id ? 
                { ...c, x: newPos.x, y: newPos.y } : c
              )
            );
            
            // Reset cursor
            const stage = e.target.getStage();
            if (stage) {
              stage.container().style.cursor = 'default';
            }
            
            // Save to history after position update
            setTimeout(() => {
              saveToHistory();
            }, 0);
          }}
        >
          {/* Outer border with gradient - the rounded rectangle with Gemini gradient colors */}
          <Rect
            width={card.width}
            height={card.height}
            cornerRadius={20}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: card.width, y: card.height }}
            fillLinearGradientColorStops={[
              0, '#8e2de2',
              0.5, '#4a00e0',
              1, '#8e2de2'
            ]}
            shadowColor="rgba(0,0,0,0.3)"
            shadowBlur={10}
            shadowOffsetX={3}
            shadowOffsetY={3}
          />
          
          {/* Inner content container - white background with rounded corners */}
          <Rect
            x={2}
            y={2}
            width={card.width - 4}
            height={card.height - 4}
            fill={theme.canvas === '#ffffff' ? 'white' : '#1e1e1e'}
            cornerRadius={18}
          />
          
          {/* Card title */}
          <Text
            x={16}
            y={15}
            text="Gemini Response"
            fontSize={18}
            fontFamily="Arial"
            fontStyle="bold"
            fill={theme.canvas === '#ffffff' ? '#333333' : '#FFFFFF'}
          />
          
          {/* Response content */}
          <Text
            x={16}
            y={45}
            text={card.response}
            fontSize={14}
            fontFamily="Arial"
            fill={theme.canvas === '#ffffff' ? '#333333' : '#DDDDDD'}
            width={card.width - 32}
            height={card.height - 60}
            wrap="word"
          />
          
          {/* Close button */}
          <Group
            x={card.width - 30}
            y={15}
            onClick={() => {
              setGeminiResponseCards(prev => 
                prev.map(c => c.id === card.id ? { ...c, isVisible: false } : c)
              );
              // Save to history after closing
              setTimeout(() => {
                saveToHistory();
              }, 0);
            }}
          >
            <Rect
              width={24}
              height={24}
              cornerRadius={12}
              fill={theme.canvas === '#ffffff' ? '#f0f0f0' : '#333333'}
            />
            <Text
              x={8}
              y={2}
              text="×"
              fontSize={20}
              fontFamily="Arial"
              fill={theme.canvas === '#ffffff' ? '#666666' : '#AAAAAA'}
            />
          </Group>
          
          {/* Resize handle in bottom-right corner */}
          <Group
            x={card.width - 18}
            y={card.height - 18}
            onMouseDown={(e) => {
              // Start resizing
              setGeminiResponseCards(prev => 
                prev.map(c => c.id === card.id ? { ...c, isResizing: true } : c)
              );
              
              // Store the initial mouse position
              const stage = e.target.getStage();
              if (stage) {
                const mousePos = stage.getPointerPosition();
                if (mousePos) {
                  lastPointerPosition.current = {
                    x: mousePos.x / scale,
                    y: mousePos.y / scale
                  };
                }
              }
            }}
          >
            <Line
              points={[0, 12, 12, 0]}
              stroke={theme.canvas === '#ffffff' ? '#999999' : '#666666'}
              strokeWidth={1}
            />
            <Line
              points={[4, 12, 12, 4]}
              stroke={theme.canvas === '#ffffff' ? '#999999' : '#666666'}
              strokeWidth={1}
            />
            <Line
              points={[8, 12, 12, 8]}
              stroke={theme.canvas === '#ffffff' ? '#999999' : '#666666'}
              strokeWidth={1}
            />
          </Group>
        </Group>
      );
    });
  };

  // Track resizing of Gemini response cards
  useEffect(() => {
    const handleMouseMoveResizeCard = (e: MouseEvent) => {
      // Check if any card is being resized
      const resizingCard = geminiResponseCards.find(card => card.isResizing);
      if (!resizingCard || !lastPointerPosition.current) return;

      // Get mouse position adjusted for scale
      const stage = stageRef.current;
      if (!stage) return;
      
      const mousePos = stage.getPointerPosition();
      if (!mousePos) return;
      
      const adjustedMousePos = {
        x: (mousePos.x - stage.x()) / scale,
        y: (mousePos.y - stage.y()) / scale
      };

      // Calculate new dimensions based on drag distance
      const deltaX = adjustedMousePos.x - lastPointerPosition.current.x;
      const deltaY = adjustedMousePos.y - lastPointerPosition.current.y;
      
      setGeminiResponseCards(prev => 
        prev.map(card => {
          if (card.id === resizingCard.id) {
            return {
              ...card,
              width: Math.max(200, card.width + deltaX),
              height: Math.max(150, card.height + deltaY)
            };
          }
          return card;
        })
      );
      
      // Update last pointer position
      lastPointerPosition.current = adjustedMousePos;
    };

    const handleMouseUpResizeCard = () => {
      // When mouse is released, stop resizing any cards
      const resizingCard = geminiResponseCards.find(card => card.isResizing);
      if (resizingCard) {
        setGeminiResponseCards(prev => 
          prev.map(card => card.id === resizingCard.id ? { ...card, isResizing: false } : card)
        );
        // Save to history after resizing
        setTimeout(() => {
          saveToHistory();
        }, 0);
      }
    };

    window.addEventListener('mousemove', handleMouseMoveResizeCard);
    window.addEventListener('mouseup', handleMouseUpResizeCard);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveResizeCard);
      window.removeEventListener('mouseup', handleMouseUpResizeCard);
    };
  }, [geminiResponseCards, scale, saveToHistory]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
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
        selectedNoteStyle={selectedNoteStyle}
        onNoteStyleChange={handleNoteStyleChange}
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
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0, 
          overflow: 'hidden',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
        }}
      >
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
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          scaleX={scale}
          scaleY={scale}
          x={stagePosition.x}
          y={stagePosition.y}
          draggable={!(selectedTool === 'pencil' || selectedTool === 'eraser')}
          style={{ 
            backgroundColor: theme.canvas,
            width: '100%',
            height: '100%'
          }}
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
                  draggable={selectedTool === null}
                  onDragStart={(e) => {
                    // Set cursor to grabbing during drag
                    const stage = e.target.getStage();
                    if (stage) {
                      stage.container().style.cursor = 'grabbing';
                    }
                  }}
                  onDragEnd={(e) => {
                    // Update the text layer's position in state
                    const newPos = e.target.position();
                    setTextLayers(prev =>
                      prev.map(t => t.id === textLayer.id ? 
                        { ...t, x: newPos.x, y: newPos.y } : t)
                    );
                    
                    // Reset cursor
                    const stage = e.target.getStage();
                    if (stage) {
                      stage.container().style.cursor = 'default';
                    }
                    
                    // Save to history after position update
                    setTimeout(() => {
                      saveToHistory();
                    }, 0);
                  }}
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
                />
              )
            ))}
          </Layer>
          {/* Layer for rendering notes */}
          <Layer>
            {renderNotes()}
          </Layer>
          {/* Layer for rendering Gemini response cards */}
          <Layer>
            {renderGeminiResponseCards()}
          </Layer>
        </Stage>
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

      {/* Textarea for editing text layers */}
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

      {/* Textarea for editing notes */}
      {editingNoteId && (() => {
        const note = noteLayers.find(n => n.id === editingNoteId);
        if (!note) return null;

        // Calculate position and size on screen considering stage transform
        const textareaX = (note.x * scale + stagePosition.x);
        const textareaY = (note.y * scale + stagePosition.y);
        const textareaFontSize = note.fontSize * scale;
        const noteStyle = getNoteStyle(note.styleId);

        const handleNoteTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          const newText = e.target.value;
          setNoteLayers(prev => 
            prev.map(n => n.id === editingNoteId ? { ...n, text: newText } : n)
          );
        };

        const finishNoteEditing = () => {
          // Store the current dimensions of the textarea
          const textarea = document.querySelector('textarea.note-textarea');
          if (textarea) {
            const width = textarea.clientWidth / scale;
            const height = textarea.clientHeight / scale;
            
            setNoteLayers(prev =>
              prev.map(n => n.id === editingNoteId ? 
                { ...n, isEditing: false, width, height } : n)
            );
          } else {
            setNoteLayers(prev =>
              prev.map(n => n.id === editingNoteId ? { ...n, isEditing: false } : n)
            );
          }
          setEditingNoteId(null);
          
          // Add note update to history
          setTimeout(() => {
            saveToHistory();
          }, 0);
        };

        const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent newline
            finishNoteEditing();
          } else if (e.key === 'Escape') {
            finishNoteEditing();
          } else if (e.key === 'Delete' && note.text === '') {
            // Delete empty note
            setNoteLayers(prev => prev.filter(n => n.id !== editingNoteId));
            setEditingNoteId(null);
            
            // Add deletion to history
            setTimeout(() => {
              saveToHistory();
            }, 0);
          }
        };

        return (
          <div
            style={{
              position: 'absolute',
              left: `${textareaX}px`,
              top: `${textareaY}px`,
              width: `${note.width * scale}px`,
              height: `${note.height * scale}px`,
              borderRadius: '3px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              zIndex: 11,
            }}
          >
            {/* Note header */}
            <div
              style={{
                width: '100%',
                height: '20px',
                backgroundColor: noteStyle.accentColor,
                borderTopLeftRadius: '3px',
                borderTopRightRadius: '3px',
              }}
            ></div>
            
            {/* Note textarea */}
            <textarea
              className="note-textarea"
              value={note.text}
              onChange={handleNoteTextChange}
              onBlur={finishNoteEditing}
              onKeyDown={handleNoteKeyDown}
              style={{
                width: '100%',
                height: 'calc(100% - 20px)',
                border: 'none',
                padding: '10px',
                margin: '0',
                overflow: 'hidden',
                background: noteStyle.backgroundColor,
                outline: 'none',
                resize: 'both',
                fontSize: `${textareaFontSize}px`,
                lineHeight: '1.4',
                fontFamily: note.fontFamily,
                color: '#333333',
                fontWeight: note.isBold ? 'bold' : 'normal',
                fontStyle: note.isItalic ? 'italic' : 'normal',
                textDecoration: note.isUnderline ? 'underline' : 'none',
                boxSizing: 'border-box',
                whiteSpace: 'pre-wrap',
              }}
              autoFocus
            />
          </div>
        );
      })()}
    </div>
  );
});

// Add display name for debugging
Canvas.displayName = 'Canvas';

export default Canvas;

// Export interfaces and types that might be needed in other components
export type {
  LineType,
  TextLayerType,
  NoteLayerType,
  GeminiResponseCardType,
  HistoryState
};