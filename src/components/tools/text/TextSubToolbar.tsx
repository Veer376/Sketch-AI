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
  const estimatedWidth = 220;

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

  const subToolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${toolButtonY}px`,
    left: snapSide === 'left' 
      ? `${parentPosition.x + parentWidth + 10}px`
      : `${parentPosition.x - estimatedWidth - 10}px`,
    backgroundColor: theme.toolbar,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 9,
    width: `${estimatedWidth}px`,
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
      <h3 style={{ margin: '0 0 4px', color: theme.toolbarButtonText, fontSize: '14px' }}>Text Formatting</h3>
      
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