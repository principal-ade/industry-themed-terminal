# @principal-ade/industry-themed-terminal

Industry-themed terminal wrapper with integrated theming support for `xterm.js`.

## Features

- Seamless integration with `@a24z/industry-theme`
- Automatic theme synchronization with xterm.js
- Built on pure UI component architecture (no backend dependencies)
- TypeScript support with full type definitions
- Custom CSS theming via CSS custom properties
- Customizable header, badges, and overlays
- Support for all xterm.js addons (FitAddon, SearchAddon, WebLinksAddon, etc.)
- Programmatic control via imperative ref API
- Scroll preservation and user intent tracking
- Optional WebGL rendering support

## Installation

```bash
npm install @principal-ade/industry-themed-terminal @xterm/xterm @a24z/industry-theme
```

or with bun:

```bash
bun add @principal-ade/industry-themed-terminal @xterm/xterm @a24z/industry-theme
```

### Optional addons:

```bash
npm install @xterm/addon-fit @xterm/addon-search @xterm/addon-web-links
```

## Usage

### Basic Usage with Theme Provider

```tsx
import { ThemedTerminalWithProvider } from '@principal-ade/industry-themed-terminal';
import '@xterm/xterm/css/xterm.css';
import '@principal-ade/industry-themed-terminal/styles.css';

function App() {
  const handleData = (data: string) => {
    // Send data to your backend (WebSocket, HTTP, etc.)
    console.log('User input:', data);
  };

  return (
    <ThemedTerminalWithProvider
      onData={handleData}
      headerTitle="Terminal"
      headerSubtitle="/home/user/project"
    />
  );
}
```

### Usage with Explicit Theme

```tsx
import { ThemedTerminal } from '@principal-ade/industry-themed-terminal';
import { useTheme } from '@a24z/industry-theme';
import '@xterm/xterm/css/xterm.css';
import '@principal-ade/industry-themed-terminal/styles.css';

function Terminal() {
  const { theme } = useTheme();

  const handleData = (data: string) => {
    // Send to backend
    websocket.send(data);
  };

  return (
    <ThemedTerminal
      theme={theme}
      onData={handleData}
      headerTitle="Terminal"
    />
  );
}
```

### With Programmatic Control

```tsx
import { ThemedTerminal, ThemedTerminalRef } from '@principal-ade/industry-themed-terminal';
import { useRef, useEffect } from 'react';

function Terminal() {
  const terminalRef = useRef<ThemedTerminalRef>(null);

  useEffect(() => {
    // Connect to backend
    const ws = new WebSocket('wss://terminal-server.example.com');

    ws.onmessage = (event) => {
      // Write data from backend to terminal
      terminalRef.current?.write(event.data);
    };

    return () => ws.close();
  }, []);

  const handleData = (data: string) => {
    ws.send(data);
  };

  const handleClear = () => {
    terminalRef.current?.clear();
  };

  return (
    <>
      <button onClick={handleClear}>Clear Terminal</button>
      <ThemedTerminal
        ref={terminalRef}
        onData={handleData}
        headerTitle="Terminal"
      />
    </>
  );
}
```

### With Custom Header and Actions

```tsx
import { ThemedTerminal } from '@principal-ade/industry-themed-terminal';

function Terminal() {
  return (
    <ThemedTerminal
      onData={handleData}
      headerTitle="Terminal"
      headerSubtitle="/home/user/project"
      headerBadge={{ label: 'Running', color: '#50fa7b' }}
      onClose={() => console.log('Hide terminal')}
      onPopOut={() => console.log('Pop out terminal')}
      onDestroy={() => console.log('Destroy terminal')}
    />
  );
}
```

### With Overlay State

```tsx
import { ThemedTerminal } from '@principal-ade/industry-themed-terminal';
import { Monitor } from 'lucide-react';

function Terminal() {
  const overlayState = {
    message: 'Terminal is owned by another window',
    subtitle: 'This terminal is currently active in a different window.',
    opacity: 1.0, // Full opacity (default) - completely hides terminal content
    actions: [
      {
        label: 'Claim Ownership',
        primary: true,
        onClick: () => console.log('Claim ownership'),
      },
    ],
  };

  return (
    <ThemedTerminal
      onData={handleData}
      overlayState={overlayState}
    />
  );
}
```

The `opacity` property controls the overlay background opacity (0-1):
- `1.0` (default): Full opacity - completely hides terminal content
- `0.85`: Semi-transparent - terminal content slightly visible
- `0.5`: Very transparent - terminal content clearly visible
- Omitted: Defaults to `1.0` for full opacity

## API

### ThemedTerminal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `Theme` | Required | Industry theme object |
| `onData` | `(data: string) => void` | - | Callback when user types |
| `onBinary` | `(data: string) => void` | - | Callback for binary data |
| `onResize` | `(cols: number, rows: number) => void` | - | Callback when terminal resizes |
| `onLinkClick` | `(url: string, isLocalhost: boolean) => void` | - | Callback when link is clicked |
| `headerTitle` | `string` | `'Terminal'` | Header title text |
| `headerSubtitle` | `string` | - | Header subtitle text |
| `headerBadge` | `{ label: string; color?: string }` | - | Header badge |
| `hideHeader` | `boolean` | `false` | Hide the header |
| `autoFocus` | `boolean` | `true` | Auto-focus on mount |
| `isVisible` | `boolean` | `true` | Visibility state |
| `scrollbarStyle` | `'overlay' \| 'hidden' \| 'thin' \| 'auto-hide'` | `'overlay'` | Scrollbar style |
| `onClose` | `() => void` | - | Hide button callback |
| `onDestroy` | `() => void` | - | Destroy button callback |
| `onPopOut` | `() => void` | - | Pop-out button callback |
| `overlayState` | `OverlayState` | - | Overlay message state |
| `className` | `string` | - | Additional CSS classes |

### ThemedTerminalWithProvider Props

Same as `ThemedTerminal` but without the `theme` prop (uses theme from context).

### ThemedTerminalRef Methods

```typescript
interface ThemedTerminalRef {
  write: (data: string | Uint8Array) => void;
  writeln: (data: string) => void;
  clear: () => void;
  scrollToBottom: () => void;
  focus: () => void;
  getTerminal: () => Terminal | null;
  findNext: (term: string, options?: ISearchOptions) => boolean;
  findPrevious: (term: string, options?: ISearchOptions) => boolean;
  clearSearch: () => void;
  fit: () => void;
}
```

### useThemedTerminal Hook

```typescript
const { theme, getTerminalOptions } = useThemedTerminal();
```

Returns:
- `theme` - Processed theme object with terminal-specific values
- `getTerminalOptions()` - Function that returns xterm.js terminal options

## Backend Integration

This package provides only the UI component. You need to provide your own backend for terminal functionality:

### WebSocket Example

```typescript
import { ThemedTerminal, ThemedTerminalRef } from '@principal-ade/industry-themed-terminal';
import { useRef, useEffect } from 'react';

function Terminal() {
  const terminalRef = useRef<ThemedTerminalRef>(null);
  const ws = useRef<WebSocket>();

  useEffect(() => {
    ws.current = new WebSocket('wss://your-terminal-backend.com');

    ws.current.onmessage = (event) => {
      terminalRef.current?.write(event.data);
    };

    ws.current.onclose = () => {
      terminalRef.current?.write('\r\nConnection closed\r\n');
    };

    return () => ws.current?.close();
  }, []);

  const handleData = (data: string) => {
    ws.current?.send(data);
  };

  const handleResize = (cols: number, rows: number) => {
    ws.current?.send(JSON.stringify({ type: 'resize', cols, rows }));
  };

  return (
    <ThemedTerminal
      ref={terminalRef}
      onData={handleData}
      onResize={handleResize}
    />
  );
}
```

## CSS Custom Properties

The package uses CSS custom properties for theming:

- `--terminal-bg` - Background color
- `--terminal-fg` - Foreground (text) color
- `--terminal-border` - Border color
- `--terminal-header-bg` - Header background
- `--terminal-font-family` - Font family
- `--terminal-font-size` - Font size

## License

MIT © Principal ADE Team
