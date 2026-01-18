import React, { createContext, useContext, ReactNode } from 'react';
import { colors as themeColors } from '../theme/colors';

// Single theme - no dark/light mode
interface ThemeContextType {
  colors: typeof themeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors: themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Export helper for StatusBar (always use dark text on our pale background)
export const getStatusBarStyle = () => 'dark' as const;
