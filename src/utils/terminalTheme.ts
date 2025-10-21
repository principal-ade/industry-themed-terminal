import type { Theme } from '@a24z/industry-theme';
import type { ITheme } from '@xterm/xterm';

/**
 * Creates xterm.js theme configuration from industry theme
 */
export function createTerminalTheme(theme: Theme): ITheme {
  return {
    background: theme.colors.background,
    foreground: theme.colors.text,
    cursor: theme.colors.primary,
    cursorAccent: theme.colors.background,
    selectionBackground: theme.colors.primary + '40', // 25% opacity
    selectionForeground: theme.colors.text,
    selectionInactiveBackground: theme.colors.backgroundSecondary,
    // ANSI colors
    black: '#000000',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#6272a4',
    magenta: '#bd93f9',
    cyan: '#8be9fd',
    white: '#bfbfbf',
    brightBlack: '#4d4d4d',
    brightRed: '#ff6e67',
    brightGreen: '#5af78e',
    brightYellow: '#f4f99d',
    brightBlue: '#6cadff',
    brightMagenta: '#ff92d0',
    brightCyan: '#9aedfe',
    brightWhite: '#e6e6e6',
  };
}

/**
 * Get CSS variables for terminal theming
 */
export function getTerminalCSSVariables(theme: Theme): Record<string, string> {
  return {
    '--terminal-bg': theme.colors.background,
    '--terminal-fg': theme.colors.text,
    '--terminal-border': theme.colors.border,
    '--terminal-header-bg': theme.colors.backgroundSecondary || theme.colors.background,
    '--terminal-font-family': 'Menlo, Monaco, "Courier New", monospace',
    '--terminal-font-size': '14px',
  };
}
