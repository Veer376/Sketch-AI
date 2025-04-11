// Define theme colors and styles
export type ThemeType = 'light' | 'dark';

interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  canvas: string;
  toolbar: string;
  toolbarText: string;
  toolbarButton: string;
  toolbarButtonSelected: string;
  toolbarButtonText: string;
  toolbarButtonSelectedText: string;
}

export const themes: Record<ThemeType, ThemeColors> = {
  light: {
    background: '#f0f0f0',
    foreground: '#213547',
    primary: '#007bff',
    secondary: '#6c757d',
    canvas: '#ffffff',
    toolbar: '#ffffff',
    toolbarText: '#213547',
    toolbarButton: '#f0f0f0',
    toolbarButtonSelected: '#007bff',
    toolbarButtonText: 'black',
    toolbarButtonSelectedText: 'white',
  },
  dark: {
    background: '#242424',
    foreground: 'rgba(255, 255, 255, 0.87)',
    primary: '#646cff',
    secondary: '#8f9ba8',
    canvas: '#333333',
    toolbar: '#333333',
    toolbarText: 'rgba(255, 255, 255, 0.87)',
    toolbarButton: '#444444',
    toolbarButtonSelected: '#646cff',
    toolbarButtonText: 'rgba(255, 255, 255, 0.87)',
    toolbarButtonSelectedText: 'white',
  },
};

// Create a function to get the current theme
export const getCurrentTheme = (themeType: ThemeType = 'light'): ThemeColors => {
  return themes[themeType];
};

export default getCurrentTheme;