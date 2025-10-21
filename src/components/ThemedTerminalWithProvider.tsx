import { forwardRef } from 'react';
import { useTheme } from '@a24z/industry-theme';
import { ThemedTerminal } from './ThemedTerminal';
import type { ThemedTerminalProps, ThemedTerminalRef } from '../types/terminal.types';

/**
 * ThemedTerminalWithProvider - Terminal component that automatically uses theme from context
 *
 * This component wraps ThemedTerminal and automatically gets the theme from the
 * @a24z/industry-theme ThemeProvider context.
 *
 * @example
 * ```tsx
 * import { ThemeProvider } from '@a24z/industry-theme';
 * import { ThemedTerminalWithProvider } from '@principal-ade/industry-themed-terminal';
 *
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <ThemedTerminalWithProvider
 *         onData={(data) => console.log(data)}
 *       />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export const ThemedTerminalWithProvider = forwardRef<
  ThemedTerminalRef,
  ThemedTerminalProps
>((props, ref) => {
  const { theme } = useTheme();

  return <ThemedTerminal ref={ref} theme={theme} {...props} />;
});

ThemedTerminalWithProvider.displayName = 'ThemedTerminalWithProvider';
