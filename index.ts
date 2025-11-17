/**
 * @principal-ade/industry-themed-terminal
 *
 * A xterm.js terminal wrapper that integrates with @principal-ade/industry-theme
 */

// Main components
export { ThemedTerminal } from './src/components/ThemedTerminal';
export { ThemedTerminalWithProvider } from './src/components/ThemedTerminalWithProvider';

// Types
export type {
  ThemedTerminalProps,
  ThemedTerminalRef,
  TerminalHeaderBadge,
  TerminalOverlayState,
  TerminalScrollPosition,
} from './src/types/terminal.types';

// Hooks
export { useThemedTerminal } from './src/hooks/useThemedTerminal';
export type { UseThemedTerminalReturn } from './src/hooks/useThemedTerminal';

// Utilities
export {
  createTerminalTheme,
  getTerminalCSSVariables,
} from './src/utils/terminalTheme';

// Re-export types from @principal-ade/industry-theme for convenience
export type { Theme } from '@principal-ade/industry-theme';

// Re-export xterm types for convenience
export type { Terminal, ITheme as XTermTheme, ITerminalOptions } from '@xterm/xterm';
export type { ISearchOptions } from '@xterm/addon-search';
