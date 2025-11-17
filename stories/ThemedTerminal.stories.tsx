import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { ThemedTerminalWithProvider } from '../src/components/ThemedTerminalWithProvider';
import type { ThemedTerminalRef } from '../src/types/terminal.types';

const meta = {
  title: 'Components/ThemedTerminal',
  component: ThemedTerminalWithProvider,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  argTypes: {
    onData: { action: 'data' },
    onResize: { action: 'resize' },
    onLinkClick: { action: 'link-click' },
    onClose: { action: 'close' },
    onDestroy: { action: 'destroy' },
    onPopOut: { action: 'pop-out' },
  },
} satisfies Meta<typeof ThemedTerminal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic terminal with welcome message
 */
export const Basic: Story = {
  args: {
    headerTitle: 'Terminal',
    headerSubtitle: '/home/user/project',
    autoFocus: true,
    onData: (data) => console.log('User typed:', data),
    onResize: (cols, rows) => console.log('Terminal resized:', cols, rows),
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      // Wait a bit for terminal to be fully initialized
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (isReady && terminalRef.current) {
        console.log('Writing to terminal...');
        terminalRef.current.write('Welcome to ThemedTerminal!\r\n');
        terminalRef.current.write(
          'This is a pure UI component for testing.\r\n\r\n',
        );
        terminalRef.current.write('$ ');
      }
    }, [isReady]);

    return (
      <div style={{ height: '600px', width: '100%' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} />
      </div>
    );
  },
};

/**
 * Terminal with simulated output
 */
export const WithOutput: Story = {
  args: {
    headerTitle: 'Terminal',
    headerSubtitle: '/home/user/project',
    onData: (data) => console.log('User typed:', data),
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      const lines = [
        '$ npm install\r\n',
        '\x1b[32m✓\x1b[0m Installed 245 packages in 3.2s\r\n\r\n',
        '$ npm run build\r\n',
        '\x1b[36mBuilding for production...\x1b[0m\r\n',
        '  - Compiling TypeScript... \x1b[32mdone\x1b[0m\r\n',
        '  - Bundling assets... \x1b[32mdone\x1b[0m\r\n',
        '  - Optimizing... \x1b[32mdone\x1b[0m\r\n\r\n',
        '\x1b[32m✓\x1b[0m Build completed successfully!\r\n',
        '\x1b[90mOutput: dist/\x1b[0m\r\n\r\n',
        '$ ',
      ];

      let index = 0;
      const interval = setInterval(() => {
        if (index < lines.length && terminalRef.current) {
          terminalRef.current.write(lines[index]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 200);

      return () => clearInterval(interval);
    }, [isReady]);

    return (
      <div style={{ height: '600px', width: '100%' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} />
      </div>
    );
  },
};

/**
 * Terminal with colored output and ANSI codes
 */
export const ColoredOutput: Story = {
  args: {
    headerTitle: 'Terminal',
    headerSubtitle: '/home/user/project',
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      terminalRef.current.write(
        '\x1b[1;31mError:\x1b[0m Something went wrong\r\n',
      );
      terminalRef.current.write(
        '\x1b[1;33mWarning:\x1b[0m This is deprecated\r\n',
      );
      terminalRef.current.write(
        '\x1b[1;32mSuccess:\x1b[0m Build completed\r\n',
      );
      terminalRef.current.write(
        '\x1b[1;34mInfo:\x1b[0m Starting server...\r\n',
      );
      terminalRef.current.write('\x1b[1;35mDebug:\x1b[0m Loaded config\r\n');
      terminalRef.current.write(
        '\x1b[1;36mLog:\x1b[0m Server listening on port 3000\r\n\r\n',
      );
      terminalRef.current.write(
        'Links: \x1b]8;;http://localhost:3000\x1b\\http://localhost:3000\x1b]8;;\x1b\\\r\n',
      );
      terminalRef.current.write('$ ');
    }, [isReady]);

    return (
      <div style={{ height: '600px', width: '100%' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} />
      </div>
    );
  },
};

/**
 * Terminal with a badge in the header
 */
export const WithBadge: Story = {
  args: {
    headerTitle: 'Terminal',
    headerSubtitle: '/home/user/project',
    headerBadge: {
      label: 'AI: Session-123',
      color: '#00D9FF',
    },
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);

    useEffect(() => {
      if (terminalRef.current) {
        terminalRef.current.write('Terminal with AI session badge\r\n$ ');
      }
    }, []);

    return (
      <div style={{ height: '600px', width: '100%' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} />
      </div>
    );
  },
};

/**
 * Terminal without header
 */
export const NoHeader: Story = {
  args: {
    hideHeader: true,
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);

    useEffect(() => {
      if (terminalRef.current) {
        terminalRef.current.write('Terminal without header\r\n$ ');
      }
    }, []);

    return (
      <div style={{ height: '600px', width: '100%' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} />
      </div>
    );
  },
};

/**
 * Terminal with all action buttons
 */
export const WithAllActions: Story = {
  args: {
    headerTitle: 'Terminal',
    headerSubtitle: '/home/user/project',
    onClose: () => console.log('Close clicked'),
    onDestroy: () => console.log('Destroy clicked'),
    onPopOut: () => console.log('Pop-out clicked'),
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);

    useEffect(() => {
      if (terminalRef.current) {
        terminalRef.current.write(
          'Terminal with all actions (close, destroy, pop-out)\r\n$ ',
        );
      }
    }, []);

    return (
      <div style={{ height: '600px', width: '100%' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} />
      </div>
    );
  },
};

/**
 * Terminal with ownership overlay
 */
export const OwnershipOverlay: Story = {
  args: {
    headerTitle: 'Terminal',
    headerSubtitle: '/home/user/project',
    overlayState: {
      message: 'This terminal is active in another window',
      subtitle: 'Window ID: 42',
      actions: [
        {
          label: 'Switch to Window',
          onClick: () => console.log('Switch to window'),
          primary: true,
          icon: <ArrowRight size={16} />,
        },
        {
          label: 'Take Control Here',
          onClick: () => console.log('Take control'),
          primary: false,
        },
      ],
    },
  },
  render: (args) => (
    <div style={{ height: '600px', width: '100%' }}>
      <ThemedTerminalWithProvider {...args} />
    </div>
  ),
};

/**
 * Terminal with loading overlay
 */
export const LoadingOverlay: Story = {
  args: {
    headerTitle: 'Terminal',
    headerSubtitle: '/home/user/project',
    overlayState: {
      message: 'Connecting to terminal session...',
      subtitle: 'Please wait',
    },
  },
  render: (args) => (
    <div style={{ height: '600px', width: '100%' }}>
      <ThemedTerminalWithProvider {...args} />
    </div>
  ),
};

/**
 * Terminal with error overlay
 */
export const ErrorOverlay: Story = {
  args: {
    headerTitle: 'Terminal',
    headerSubtitle: '/home/user/project',
    overlayState: {
      message: 'Failed to connect to terminal session',
      subtitle: 'Session ID not found',
      actions: [
        {
          label: 'Retry',
          onClick: () => console.log('Retry'),
          primary: true,
        },
        {
          label: 'Close',
          onClick: () => console.log('Close'),
          primary: false,
        },
      ],
    },
  },
  render: (args) => (
    <div style={{ height: '600px', width: '100%' }}>
      <ThemedTerminalWithProvider {...args} />
    </div>
  ),
};

/**
 * Interactive terminal with simulated backend
 */
export const Interactive: Story = {
  args: {
    headerTitle: 'Interactive Terminal',
    headerSubtitle: '/home/user/project',
    onClose: () => console.log('Close clicked'),
    onDestroy: () => console.log('Destroy clicked'),
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const commandBufferRef = useRef('');

    const handleData = (data: string) => {
      if (!terminalRef.current) return;

      // Handle special keys
      if (data === '\r') {
        // Enter key
        const command = commandBufferRef.current.trim();
        terminalRef.current.write('\r\n');

        // Simulate command execution
        if (command === 'help') {
          terminalRef.current.write('Available commands:\r\n');
          terminalRef.current.write('  help   - Show this help\r\n');
          terminalRef.current.write('  clear  - Clear the screen\r\n');
          terminalRef.current.write('  date   - Show current date\r\n');
          terminalRef.current.write('  echo   - Echo text\r\n');
        } else if (command === 'clear') {
          terminalRef.current.clear();
        } else if (command === 'date') {
          terminalRef.current.write(new Date().toString() + '\r\n');
        } else if (command.startsWith('echo ')) {
          terminalRef.current.write(command.substring(5) + '\r\n');
        } else if (command !== '') {
          terminalRef.current.write(`Command not found: ${command}\r\n`);
          terminalRef.current.write('Type "help" for available commands\r\n');
        }

        terminalRef.current.write('$ ');
        commandBufferRef.current = '';
      } else if (data === '\x7F') {
        // Backspace
        if (commandBufferRef.current.length > 0) {
          commandBufferRef.current = commandBufferRef.current.slice(0, -1);
          terminalRef.current.write('\b \b');
        }
      } else if (data >= String.fromCharCode(0x20)) {
        // Printable characters
        commandBufferRef.current += data;
        terminalRef.current.write(data);
      }
    };

    useEffect(() => {
      if (terminalRef.current) {
        terminalRef.current.write('Welcome to the interactive terminal!\r\n');
        terminalRef.current.write(
          'Type "help" for available commands.\r\n\r\n',
        );
        terminalRef.current.write('$ ');
      }
    }, []);

    return (
      <div style={{ height: '600px', width: '100%' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} onData={handleData} />
      </div>
    );
  },
};

/**
 * Terminal with link handling
 */
export const WithLinks: Story = {
  args: {
    headerTitle: 'Terminal',
    headerSubtitle: '/home/user/project',
    onLinkClick: (url, isLocalhost) => {
      alert(`Link clicked: ${url}\nIs localhost: ${isLocalhost}`);
    },
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);

    useEffect(() => {
      if (terminalRef.current) {
        terminalRef.current.write('Terminal with clickable links:\r\n\r\n');
        terminalRef.current.write('Localhost: http://localhost:3000\r\n');
        terminalRef.current.write('External: https://github.com\r\n\r\n');
        terminalRef.current.write('Click the links to test the handler!\r\n$ ');
      }
    }, []);

    return (
      <div style={{ height: '600px', width: '100%' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} />
      </div>
    );
  },
};

/**
 * Small terminal for compact spaces
 */
export const Small: Story = {
  args: {
    headerTitle: 'Small Terminal',
    hideHeader: false,
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);

    useEffect(() => {
      if (terminalRef.current) {
        terminalRef.current.write('$ npm start\r\n');
        terminalRef.current.write('Server running on port 3000\r\n$ ');
      }
    }, []);

    return (
      <div style={{ height: '300px', width: '400px' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} />
      </div>
    );
  },
};

/**
 * Debug terminal - Test if output is visible
 */
export const Debug: Story = {
  args: {
    headerTitle: 'Debug Terminal',
    headerSubtitle: 'Testing output visibility',
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 200);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      console.log('Terminal ref exists, writing content...');
      const term = terminalRef.current;

      // Write a bunch of visible content
      term.write('\x1b[1;32m================================\x1b[0m\r\n');
      term.write('\x1b[1;36m   TERMINAL OUTPUT TEST\x1b[0m\r\n');
      term.write('\x1b[1;32m================================\x1b[0m\r\n\r\n');

      term.write('\x1b[33mIf you can see this, the terminal is working!\x1b[0m\r\n\r\n');

      term.write('\x1b[1mTesting different colors:\x1b[0m\r\n');
      term.write('  \x1b[31m● Red text\x1b[0m\r\n');
      term.write('  \x1b[32m● Green text\x1b[0m\r\n');
      term.write('  \x1b[33m● Yellow text\x1b[0m\r\n');
      term.write('  \x1b[34m● Blue text\x1b[0m\r\n');
      term.write('  \x1b[35m● Magenta text\x1b[0m\r\n');
      term.write('  \x1b[36m● Cyan text\x1b[0m\r\n\r\n');

      term.write('\x1b[1mSample command output:\x1b[0m\r\n');
      term.write('$ npm install\r\n');
      term.write('Installing dependencies...\r\n');
      term.write('\x1b[32m✓\x1b[0m Installed 245 packages\r\n');
      term.write('\x1b[32m✓\x1b[0m Build successful\r\n\r\n');

      term.write('$ ls -la\r\n');
      term.write('drwxr-xr-x   10 user  staff    320 Jan 15 10:30 \x1b[34m.\x1b[0m\r\n');
      term.write('drwxr-xr-x   15 user  staff    480 Jan 15 10:29 \x1b[34m..\x1b[0m\r\n');
      term.write('-rw-r--r--    1 user  staff   1234 Jan 15 10:30 README.md\r\n');
      term.write('-rw-r--r--    1 user  staff    567 Jan 15 10:29 package.json\r\n\r\n');

      term.write('\x1b[1;32m$ \x1b[0m');

      console.log('Terminal content written successfully');
    }, [isReady]);

    return (
      <div style={{ height: '600px', width: '100%' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} />
      </div>
    );
  },
};
