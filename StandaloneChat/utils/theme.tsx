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
    pendingStatus: '#d2d2d2',
    readStatus: '#fff',
    deliveredStatus: '#8b8b8b',
    sentStatus: '#8b8b8b',
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
    groupUserName: '#8b8b8b',
    ownFileBg: 'rgba(0, 0, 0, 0.1)',
    otherFileBg: 'rgba(0, 0, 0, 0.05)',
    timestampMine: 'rgba(255, 255, 255, 0.7)',
    reactionPopupBg: '#202A30',
    reactionMenuBg: 'rgba(30, 30, 30, 0.95)',
    reactionMenuSeparator: 'rgba(255, 255, 255, 0.1)',
    overlayBlack50: 'rgba(0,0,0,0.5)',
    overlayBlack35: 'rgba(0,0,0,0.35)',
    overlayBlack55: 'rgba(0,0,0,0.55)',
    overlayWhite20: 'rgba(255,255,255,0.2)',
    mediaThumbBg: '#ccc',
    replyMediaBg: '#eee',
    replyPreviewBorder: '#ddd',
    progressTrackBg: '#e0e0e0',
    mediumGray: '#666',
    blurFallback: '#000000CC',
    // Semantic aliases for easier theming
    bgApp: '#000',
    bgModal: '#000',
    surfaceCard: '#f8f8f8',
    surfaceBubbleOutgoing: '#EB5757',
    surfaceBubbleIncoming: '#f9f9f9',
    textPrimary: '#000',
    textSecondary: '#999',
    textInverse: '#fff',
    textGroupHeader: '#8b8b8b',
    textTimestamp: '#8b8b8b',
    textTimestampMine: 'rgba(255, 255, 255, 0.7)',
    textOnBubbleOutgoing: '#fff',
    textOnBubbleIncoming: '#000',
    textOnOverlay: '#fff',
    statusPending: '#d2d2d2',
    statusSent: '#8b8b8b',
    statusDelivered: '#8b8b8b',
    statusRead: '#fff',
    iconOnBubbleOutgoing: '#fff',
    iconAccentDanger: '#ef4136',
    borderDefault: '#eee',
    avatarPlaceholderBg: '#fafafa',
  },
  spacing: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    micro: 8,
    caption: 10,
    body2: 12,
    body: 14,
    subtitle: 13,
    title: 16,
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
      spacing: { ...defaultTheme.spacing, ...(theme as any).spacing },
      typography: { ...defaultTheme.typography, ...(theme as any).typography },
      fonts: { ...defaultTheme.fonts, ...theme.fonts },
    };
  }, [theme]);

  return <ThemeContext.Provider value={mergedTheme}>{children}</ThemeContext.Provider>;
};
