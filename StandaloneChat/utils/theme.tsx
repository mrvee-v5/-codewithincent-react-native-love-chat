import React, { createContext, useContext, useMemo } from 'react';

export const defaultTheme = {
  colors: {
    primary: '#e6e1e1',
    darkPrimary: '#e3e3e4ff',
    lightRed: '#EB5757',
    darkRed: '#ef4136',
    black: '#000',
    lightBlack: '#605e5eff',
    gray: '#999',
    white: '#fff',
    darkBrown: '#54392A',
    lightGrey: '#f8f8f8',
    softGray: '#fafafa',
    borderGray: '#eee',
    textGray: '#eee',
    softRed: '#fff7f7',
    verySoftGray: '#f9f9f9',
    timestamp: '#8b8b8b',
    ownMessageBubble: '#EB5757',
    otherMessageBubble: '#f9f9f9',
    ownMessageText: '#fff',
    otherMessageText: '#000',
    ownFileBg: 'rgba(0, 0, 0, 0.1)',
    otherFileBg: 'rgba(0, 0, 0, 0.05)',
  },
  fonts: {
    light: 'System',
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    extraBold: 'System',
  },
};

export type Theme = typeof defaultTheme;
export type PartialTheme = {
  [K in keyof Theme]?: Partial<Theme[K]>;
};

const ThemeContext = createContext<Theme>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({
  theme,
  children,
}: {
  theme?: PartialTheme;
  children: React.ReactNode;
}) => {
  const mergedTheme = useMemo(() => {
    if (!theme) return defaultTheme;
    return {
      ...defaultTheme,
      colors: { ...defaultTheme.colors, ...theme.colors },
      fonts: { ...defaultTheme.fonts, ...theme.fonts },
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  );
};
