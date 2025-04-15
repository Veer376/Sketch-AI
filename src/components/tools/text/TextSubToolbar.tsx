import React from 'react';
import { getCurrentTheme } from '../../../utils/theme';
import DiscreteSliderControl from '../../shared/DiscreteSliderControl';

// Icons for formatting options
const BoldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12H14C16.2091 12 18 10.2091 18 8C18 5.79086 16.2091 4 14 4H6V12ZM6 12H15C17.2091 12 19 13.7909 19 16C19 18.2091 17.2091 20 15 20H6V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ItalicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 4H10M14 20H5M15 4L9 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UnderlineIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4V11C6 14.3137 8.68629 17 12 17C15.3137 17 18 14.3137 18 11V4M6 21H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export interface TextFormattingOptions {
  fontSize: number;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

export interface TextSubToolbarProps {
  isVisible: boolean;
  options: TextFormattingOptions;
  onOptionsChange: (options: Partial<TextFormattingOptions>) => void;
  onHoverChange: (isHovered: boolean) => void;
  parentPosition: { x: number; y: number };
  parentWidth: number;
  snapSide: 'left' | 'right';
  toolButtonY: number;
}

// Use the same constants across all subtoolbars for consistency
const SUBTOOLBAR_WIDTH = 280;
const CONNECTOR_SIZE = 10;

const TextSubToolbar: React.FC<TextSubToolbarProps> = ({
  isVisible,
  options,
  onOptionsChange,
  onHoverChange,
  parentPosition,
  parentWidth,
  snapSide,
  toolButtonY,
}) => {
  const theme = getCurrentTheme();

  if (!isVisible) {
    return null;
  }

  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
  ];

  const handleFontSizeChange = (newSize: number) => {
    onOptionsChange({ fontSize: newSize });
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onOptionsChange({ fontFamily: e.target.value });
  };

  const toggleBold = () => {
    onOptionsChange({ isBold: !options.isBold });
  };

  const toggleItalic = () => {
    onOptionsChange({ isItalic: !options.isItalic });
  };

  const toggleUnderline = () => {
    onOptionsChange({ isUnderline: !options.isUnderline });
  };

  // Calculate the toolbar vertical midpoint - accurately point to the center of the button
  const toolHeight = 36; // Standard tool button height
  const toolVerticalCenter = toolButtonY + (toolHeight / 2);

  const subToolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${Math.max(20, toolVerticalCenter - 150)}px`, // Center with minimum top margin
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

  const formatButtonStyle = (isActive: boolean): React.CSSProperties => ({
    backgroundColor: isActive ? theme.toolbarButtonSelected : theme.toolbarButton,
    color: isActive ? theme.toolbarButtonSelectedText : theme.toolbarButtonText,
    border: 'none',
    borderRadius: '4px',
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  });

  return (
    <div
      style={subToolbarStyle}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {/* Visual connector to the tool */}
      <div style={connectorStyle}></div>
      
      <div style={{ 
        padding: '5px', 
        textAlign: 'center', 
        color: theme.toolbarText, 
        fontWeight: 'bold'
      }}>
        Text Formatting
      </div>
      
      {/* Font Family Dropdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="font-family" style={{ color: theme.toolbarButtonText, fontSize: '12px' }}>
          Font Family
        </label>
        <select
          id="font-family"
          value={options.fontFamily}
          onChange={handleFontFamilyChange}
          style={{
            backgroundColor: theme.toolbarButton,
            color: theme.toolbarButtonText,
            border: 'none',
            borderRadius: '4px',
            padding: '6px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {fontFamilies.map(font => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>
      
      {/* Font Size Slider */}
      <DiscreteSliderControl
        label="Font Size"
        value={options.fontSize}
        min={8}
        max={72}
        step={2}
        onChange={handleFontSizeChange}
        unit="px"
        marks={true}
      />
      
      {/* Text Style Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={toggleBold}
          style={formatButtonStyle(options.isBold)}
          title="Bold"
        >
          <BoldIcon />
        </button>
        <button
          onClick={toggleItalic}
          style={formatButtonStyle(options.isItalic)}
          title="Italic"
        >
          <ItalicIcon />
        </button>
        <button
          onClick={toggleUnderline}
          style={formatButtonStyle(options.isUnderline)}
          title="Underline"
        >
          <UnderlineIcon />
        </button>
      </div>
    </div>
  );
};

export default TextSubToolbar;