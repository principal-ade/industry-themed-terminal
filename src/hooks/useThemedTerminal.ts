import { useTheme, type Theme } from '@a24z/industry-theme';
import { useMemo } from 'react';
import type { ITerminalOptions } from '@xterm/xterm';
import { createTerminalTheme, getTerminalCSSVariables } from '../utils/terminalTheme';

export interface UseThemedTerminalReturn {
  theme: Theme;
  getTerminalOptions: (overrides?: Partial<ITerminalOptions>) => ITerminalOptions;
  getCSSVariables: () => Record<string, string>;
}

/**
 * Hook to get themed terminal configuration
 */
export function useThemedTerminal(): UseThemedTerminalReturn {
  const { theme } = useTheme();

  const terminalOptions = useMemo(
    () => ({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: createTerminalTheme(theme),
      scrollback: 10000,
      allowProposedApi: true,
      lineHeight: 1.0,
      letterSpacing: 0,
      rightClickSelectsWord: true,
      smoothScrollDuration: 0,
      drawBoldTextInBrightColors: true,
      windowsMode: false,
      fontWeight: 'normal' as const,
      fontWeightBold: 'bold' as const,
    }),
    [theme]
  );

  const getTerminalOptions = (overrides?: Partial<ITerminalOptions>): ITerminalOptions => {
    return {
      ...terminalOptions,
      ...overrides,
      // Ensure theme is always merged
      theme: overrides?.theme
        ? { ...terminalOptions.theme, ...overrides.theme }
        : terminalOptions.theme,
    };
  };

  const getCSSVariables = () => getTerminalCSSVariables(theme);

  return {
    theme,
    getTerminalOptions,
    getCSSVariables,
  };
}
