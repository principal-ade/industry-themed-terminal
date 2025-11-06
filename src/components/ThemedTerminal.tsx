import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  Terminal as TerminalIcon,
  ExternalLink,
  ChevronDown,
  X,
  Monitor,
} from 'lucide-react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
// Disabled for performance - uncomment if needed:
// import { WebglAddon } from '@xterm/addon-webgl';
// import { Unicode11Addon } from '@xterm/addon-unicode11';
import '@xterm/xterm/css/xterm.css';
import '../styles/terminal-theme.css';

import type { Theme } from '@a24z/industry-theme';
import type { ThemedTerminalProps, ThemedTerminalRef } from '../types/terminal.types';
import type { ISearchOptions } from '@xterm/addon-search';
import { createTerminalTheme } from '../utils/terminalTheme';

export interface ThemedTerminalComponentProps extends ThemedTerminalProps {
  theme: Theme;
}

/**
 * ThemedTerminal - Pure UI component for rendering an xterm.js terminal with theme integration
 *
 * This component is decoupled from backend logic and can be used in any React application.
 * Backend integration (PTY, WebSocket, etc.) should be handled by parent components.
 *
 * @example
 * ```tsx
 * const terminalRef = useRef<ThemedTerminalRef>(null);
 *
 * <ThemedTerminal
 *   ref={terminalRef}
 *   theme={theme}
 *   headerTitle="Terminal"
 *   headerSubtitle="/home/user/project"
 *   onData={(data) => sendToBackend(data)}
 *   onResize={(cols, rows) => resizeBackend(cols, rows)}
 * />
 * ```
 */
export const ThemedTerminal = forwardRef<ThemedTerminalRef, ThemedTerminalComponentProps>(
  (
    {
      theme,
      onData,
      onResize,
      onLinkClick,
      className = '',
      hideHeader = false,
      headerTitle = 'Terminal',
      headerSubtitle,
      headerBadge,
      autoFocus = true,
      isVisible = true,
      scrollbarStyle = 'overlay',
      onClose,
      onDestroy,
      onPopOut,
      overlayState,
      cursorBlink = true,
      cursorStyle = 'block',
      scrollback = 10000,
      fontFamily,
      fontSize = 14,
      enableWebGL = false,
      enableUnicode11 = false,
      enableSearch = true,
      enableWebLinks = true,
    },
    ref,
  ) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const [terminal, setTerminal] = useState<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const searchAddonRef = useRef<SearchAddon | null>(null);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isVisibleRef = useRef(isVisible);
    const userScrolledAwayRef = useRef(false);
    const lastScrollPositionRef = useRef(0);
    const performFitRef = useRef<(() => void) | null>(null);
    const lastContainerDimensionsRef = useRef<{ width: number; height: number } | null>(null);
    const lastFitTimeRef = useRef<number>(0);

    // Keep isVisible ref in sync
    useEffect(() => {
      isVisibleRef.current = isVisible;
    }, [isVisible]);

    // Expose public methods via ref
    useImperativeHandle(
      ref,
      () => ({
        write: (data: string | Uint8Array) => {
          if (terminal) {
            terminal.write(data);
          }
        },
        writeln: (data: string) => {
          if (terminal) {
            terminal.writeln(data);
          }
        },
        scrollToBottom: () => {
          if (terminal) {
            terminal.scrollToBottom();
            userScrolledAwayRef.current = false;
          }
        },
        focus: () => {
          if (terminal) {
            terminal.focus();
          }
        },
        blur: () => {
          if (terminal) {
            terminal.blur();
          }
        },
        clear: () => {
          if (terminal) {
            terminal.clear();
          }
        },
        reset: () => {
          if (terminal) {
            terminal.reset();
          }
        },
        getTerminal: () => terminal,
        resize: (cols: number, rows: number) => {
          if (terminal) {
            terminal.resize(cols, rows);
          }
        },
        selectAll: () => {
          if (terminal) {
            terminal.selectAll();
          }
        },
        clearSelection: () => {
          if (terminal) {
            terminal.clearSelection();
          }
        },
        findNext: (searchTerm: string, searchOptions?: ISearchOptions) => {
          if (searchAddonRef.current) {
            return searchAddonRef.current.findNext(searchTerm, searchOptions);
          }
          return false;
        },
        findPrevious: (searchTerm: string, searchOptions?: ISearchOptions) => {
          if (searchAddonRef.current) {
            return searchAddonRef.current.findPrevious(
              searchTerm,
              searchOptions,
            );
          }
          return false;
        },
        clearSearch: () => {
          if (searchAddonRef.current) {
            searchAddonRef.current.clearDecorations();
          }
        },
        fit: () => {
          if (performFitRef.current) {
            performFitRef.current();
          }
        },
      }),
      [terminal],
    );

    // Initialize terminal UI
    useEffect(() => {
      if (!terminalRef.current || terminal) {
        return;
      }

      const term = new Terminal({
        cursorBlink,
        cursorStyle,
        fontSize,
        fontFamily: fontFamily || 'Menlo, Monaco, "Courier New", monospace',
        theme: createTerminalTheme(theme),
        scrollback,
        allowProposedApi: true,
        lineHeight: 1.0,
        letterSpacing: 0,
        rightClickSelectsWord: true,
        smoothScrollDuration: 0,
        drawBoldTextInBrightColors: true,
        windowsMode: false,
        fontWeight: 'normal',
        fontWeightBold: 'bold',
      });

      // Add FitAddon
      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;
      term.loadAddon(fitAddon);

      // Add SearchAddon
      if (enableSearch) {
        const searchAddon = new SearchAddon();
        searchAddonRef.current = searchAddon;
        term.loadAddon(searchAddon);
      }

      // Add Unicode11Addon if enabled
      if (enableUnicode11) {
        // Dynamically import to avoid bundle issues
        import('@xterm/addon-unicode11').then(({ Unicode11Addon }) => {
          const unicode11Addon = new Unicode11Addon();
          term.loadAddon(unicode11Addon);
          term.unicode.activeVersion = '11';
        }).catch(() => {
          console.warn('[Terminal] Unicode11Addon not available');
        });
      }

      // Add WebLinksAddon
      if (enableWebLinks) {
        const webLinksAddon = new WebLinksAddon((event, uri) => {
          event.preventDefault();

          if (onLinkClick) {
            const isLocalhost =
              /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(uri);
            onLinkClick(uri, isLocalhost);
          }
        });
        term.loadAddon(webLinksAddon);
      }

      // Open terminal in the DOM
      term.open(terminalRef.current);

      // Track user scroll intent
      const handleScroll = () => {
        const scrollPosition = term.buffer.active.viewportY;
        const baseScrollback = term.buffer.active.baseY;
        const isAtBottom =
          scrollPosition + term.rows >= baseScrollback + term.rows;

        if (scrollPosition !== lastScrollPositionRef.current) {
          userScrolledAwayRef.current = !isAtBottom;
          lastScrollPositionRef.current = scrollPosition;
        }
      };

      const scrollDisposable = term.onScroll(handleScroll);

      // Add WebGL renderer if enabled
      if (enableWebGL) {
        import('@xterm/addon-webgl').then(({ WebglAddon }) => {
          try {
            const webglAddon = new WebglAddon();
            webglAddon.onContextLoss(() => {
              webglAddon.dispose();
              console.warn('[Terminal] WebGL context lost, falling back to canvas renderer');
            });
            term.loadAddon(webglAddon);
          } catch (e) {
            console.warn('[Terminal] WebGL renderer not supported, using canvas renderer', e);
          }
        }).catch(() => {
          console.warn('[Terminal] WebglAddon not available');
        });
      }

      setTerminal(term);

      // Fit function with scroll position preservation
      const performFit = () => {
        if (!fitAddonRef.current || !terminalRef.current || !term) return;

        // Throttle fit operations to prevent excessive calls during Ink app updates
        // Allow fits at most every 50ms
        const now = Date.now();
        if (now - lastFitTimeRef.current < 50) {
          return;
        }
        lastFitTimeRef.current = now;

        const rect = terminalRef.current.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
          const scrollPosition = term.buffer.active.viewportY;
          const baseScrollback = term.buffer.active.baseY;
          const wasAtBottom =
            scrollPosition + term.rows >= baseScrollback + term.rows;

          fitAddonRef.current.fit();

          requestAnimationFrame(() => {
            if (term) {
              if (wasAtBottom && !userScrolledAwayRef.current) {
                term.scrollToBottom();
              } else {
                term.scrollToLine(scrollPosition);
              }
            }
          });
        }
      };

      performFitRef.current = performFit;

      // Handle resize with debouncing
      const handleResize = () => {
        if (!fitAddonRef.current || !isVisibleRef.current || !term) return;

        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }

        // Debounce resize operations to prevent excessive fits during Ink app rendering
        resizeTimeoutRef.current = setTimeout(() => {
          performFit();
        }, 150);
      };

      window.addEventListener('resize', handleResize);

      // ResizeObserver for container resize
      // Only trigger resize when dimensions actually change to avoid Ink app flickering
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry || !isVisibleRef.current) return;

        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;

        // Skip if dimensions are invalid
        if (newWidth <= 0 || newHeight <= 0) return;

        const lastDimensions = lastContainerDimensionsRef.current;

        // Only trigger resize if dimensions actually changed
        // This prevents ResizeObserver from firing on terminal content changes (Ink apps)
        if (
          !lastDimensions ||
          Math.abs(lastDimensions.width - newWidth) > 1 ||
          Math.abs(lastDimensions.height - newHeight) > 1
        ) {
          lastContainerDimensionsRef.current = { width: newWidth, height: newHeight };
          handleResize();
        }
      });

      if (terminalRef.current) {
        resizeObserver.observe(terminalRef.current);
      }

      return () => {
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
        scrollDisposable.dispose();
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        term.dispose();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme, onLinkClick, cursorBlink, cursorStyle, scrollback, fontSize, fontFamily, enableSearch, enableWebLinks, enableUnicode11, enableWebGL]);

    // Handle terminal data input (user typing)
    useEffect(() => {
      if (!terminal || !onData) {
        return;
      }

      const disposable = terminal.onData((data) => {
        onData(data);
      });

      return () => {
        disposable.dispose();
      };
    }, [terminal, onData]);

    // Handle terminal resize events
    useEffect(() => {
      if (!terminal || !onResize) return;

      const disposable = terminal.onResize((size) => {
        onResize(size.cols, size.rows);
      });

      return () => {
        disposable.dispose();
      };
    }, [terminal, onResize]);

    // Prevent space key from bubbling to parent containers (e.g., carousels)
    // This ensures space key works correctly in the terminal regardless of parent behavior
    useEffect(() => {
      const terminalElement = terminalRef.current;
      if (!terminalElement) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent space key from propagating to parent containers
        // This fixes issues where carousels or other scrollable containers
        // might intercept the space key before the terminal can use it
        if (e.key === ' ' || e.key === 'Space') {
          e.stopPropagation();
        }
      };

      terminalElement.addEventListener('keydown', handleKeyDown, true);

      return () => {
        terminalElement.removeEventListener('keydown', handleKeyDown, true);
      };
    }, []);

    // Focus terminal when it becomes visible
    useEffect(() => {
      if (terminal && autoFocus && isVisible) {
        setTimeout(() => {
          terminal.focus();
        }, 50);
      }
    }, [terminal, autoFocus, isVisible]);

    // Handle visibility changes - resize when becoming visible
    useEffect(() => {
      if (terminal && isVisible) {
        setTimeout(() => {
          if (performFitRef.current) {
            performFitRef.current();
          }
        }, 50);
      }
    }, [isVisible, terminal]);

    const handleDestroy = () => {
      if (onDestroy) {
        const confirmed = window.confirm(
          'Are you sure you want to close this terminal session? This will terminate any running processes.',
        );
        if (confirmed) {
          onDestroy();
        }
      }
    };

    return (
      <div
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          backgroundColor: theme.colors.background,
        }}
      >
        {/* Terminal Header */}
        {!hideHeader && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              borderBottom: `1px solid ${theme.colors.border}`,
              backgroundColor:
                theme.colors.backgroundSecondary || theme.colors.background,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TerminalIcon size={16} color={theme.colors.text} />
              <span
                style={{
                  fontSize: '14px',
                  color: theme.colors.text,
                  fontWeight: '500',
                }}
              >
                {headerTitle}
              </span>
              {headerSubtitle && (
                <span
                  style={{
                    fontSize: '12px',
                    color: theme.colors.textSecondary,
                  }}
                >
                  {headerSubtitle}
                </span>
              )}
              {headerBadge && (
                <>
                  <span
                    style={{
                      fontSize: '12px',
                      color: theme.colors.textSecondary,
                    }}
                  >
                    •
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: headerBadge.color || theme.colors.primary,
                    }}
                  >
                    {headerBadge.label}
                  </span>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {onPopOut && (
                <button
                  type="button"
                  aria-label="Pop out terminal to new window"
                  onClick={onPopOut}
                  style={{
                    padding: '4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.colors.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      theme.colors.backgroundTertiary;
                    e.currentTarget.style.color = theme.colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                  title="Open terminal in new window"
                >
                  <ExternalLink size={16} />
                </button>
              )}

              {onClose && (
                <button
                  type="button"
                  aria-label="Hide terminal"
                  onClick={onClose}
                  style={{
                    padding: '4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.colors.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      theme.colors.backgroundTertiary;
                    e.currentTarget.style.color = theme.colors.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                  title="Hide terminal (keeps session running)"
                >
                  <ChevronDown size={16} />
                </button>
              )}

              {onDestroy && (
                <button
                  type="button"
                  aria-label="Close terminal session"
                  onClick={handleDestroy}
                  style={{
                    padding: '4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.colors.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ff4444';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                  title="Close terminal session (terminate process)"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Terminal Container */}
        <div
          ref={terminalRef}
          className={`terminal-container-fix ${
            scrollbarStyle === 'hidden'
              ? 'hide-scrollbar'
              : scrollbarStyle === 'thin'
                ? 'thin-scrollbar'
                : scrollbarStyle === 'auto-hide'
                  ? 'auto-hide-scrollbar'
                  : ''
          }`}
          style={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: 0,
          }}
        >
          {/* Overlay for messages */}
          {overlayState && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.background,
                gap: '16px',
                padding: '32px',
                zIndex: 10,
              }}
            >
              <Monitor size={48} color={theme.colors.textSecondary} />
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: theme.colors.text,
                  textAlign: 'center',
                }}
              >
                {overlayState.message}
              </div>
              {overlayState.subtitle && (
                <div
                  style={{
                    fontSize: '14px',
                    color: theme.colors.textSecondary,
                    textAlign: 'center',
                    maxWidth: '400px',
                  }}
                >
                  {overlayState.subtitle}
                </div>
              )}
              {overlayState.actions && overlayState.actions.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '8px',
                  }}
                >
                  {overlayState.actions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={action.onClick}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: action.primary
                          ? theme.colors.primary
                          : 'transparent',
                        color: action.primary ? '#ffffff' : theme.colors.text,
                        border: action.primary
                          ? 'none'
                          : `1px solid ${theme.colors.border}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (action.primary) {
                          e.currentTarget.style.opacity = '0.8';
                        } else {
                          e.currentTarget.style.backgroundColor =
                            theme.colors.backgroundSecondary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (action.primary) {
                          e.currentTarget.style.opacity = '1';
                        } else {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

ThemedTerminal.displayName = 'ThemedTerminal';
