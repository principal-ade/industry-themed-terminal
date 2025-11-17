import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useEffect, useState } from 'react';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { ThemedTerminalWithProvider } from '../src/components/ThemedTerminalWithProvider';
import type { ThemedTerminalRef } from '../src/types/terminal.types';

const meta = {
  title: 'Components/InkSimulation',
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
} satisfies Meta<typeof ThemedTerminalWithProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Simulates an Ink-style React app with rapid line updates
 * This tests the scrollbar stability fix for Ink applications
 */
export const SpinnerAndProgress: Story = {
  args: {
    headerTitle: 'Ink-style App Simulation',
    headerSubtitle: 'Testing rapid terminal updates',
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      const term = terminalRef.current;
      const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      let spinnerIndex = 0;
      let progress = 0;
      let frame = 0;

      // Initial content
      term.write('\x1b[1;36m╭─ Building Project ─╮\x1b[0m\r\n');
      term.write('│                    │\r\n'); // Line for spinner
      term.write('│                    │\r\n'); // Line for progress bar
      term.write('│                    │\r\n'); // Line for status
      term.write('\x1b[1;36m╰────────────────────╯\x1b[0m\r\n\r\n');
      term.write('Static content above\r\n');
      term.write('More static content\r\n\r\n');

      const interval = setInterval(() => {
        if (progress >= 100) {
          clearInterval(interval);

          // Show completion
          term.write('\x1b[4A'); // Move up 4 lines
          term.write('\x1b[2K\r'); // Clear line
          term.write('│ \x1b[32m✓\x1b[0m Building...     │\r\n');
          term.write('\x1b[2K\r'); // Clear line
          term.write('│ \x1b[32m████████████\x1b[0m 100% │\r\n');
          term.write('\x1b[2K\r'); // Clear line
          term.write('│ \x1b[32mCompleted!\x1b[0m       │\r\n');
          term.write('\x1b[1A'); // Move up 1 line to stay in position
          return;
        }

        // Update spinner, progress bar, and status
        const spinner = spinnerFrames[spinnerIndex];
        spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
        progress = Math.min(progress + 2, 100);

        const barLength = 12;
        const filled = Math.floor((progress / 100) * barLength);
        const progressBar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

        // Move cursor up 4 lines, then rewrite each line
        term.write('\x1b[4A'); // Move up 4 lines

        // Line 1: Spinner
        term.write('\x1b[2K\r'); // Clear entire line and return to start
        term.write(`│ \x1b[36m${spinner}\x1b[0m Building...     │\r\n`);

        // Line 2: Progress bar
        term.write('\x1b[2K\r');
        term.write(`│ \x1b[36m${progressBar}\x1b[0m ${progress.toString().padStart(3)}% │\r\n`);

        // Line 3: Status message
        term.write('\x1b[2K\r');
        const statuses = [
          'Compiling...    ',
          'Bundling...     ',
          'Optimizing...   ',
          'Finalizing...   ',
        ];
        const status = statuses[Math.floor((progress / 100) * statuses.length)] || statuses[0];
        term.write(`│ ${status}│\r\n`);

        // Line 4: Move back to position
        term.write('\x1b[1A'); // Move up 1 line to stay in position

        frame++;
      }, 50); // Update every 50ms (rapid updates like Ink)

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
 * Simulates multiple concurrent tasks like npm install output
 */
export const MultiTaskProgress: Story = {
  args: {
    headerTitle: 'Package Installation',
    headerSubtitle: 'Simulating npm install with Ink',
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      const term = terminalRef.current;

      // Initial setup
      term.write('\x1b[1;36m$ npm install\x1b[0m\r\n\r\n');
      term.write('Installing packages...\r\n\r\n');

      // Package installation tasks
      const packages = [
        { name: 'react', size: '6.2 MB' },
        { name: 'typescript', size: '18.4 MB' },
        { name: 'webpack', size: '12.1 MB' },
        { name: 'eslint', size: '8.3 MB' },
      ];

      // Write initial task lines
      packages.forEach((pkg) => {
        term.write(`⠋ ${pkg.name.padEnd(15)} ${pkg.size}\r\n`);
      });
      term.write('\r\n');
      term.write('Downloaded: 0 / 4\r\n');
      term.write('Progress: [            ] 0%\r\n');

      let completed = 0;
      let totalProgress = 0;
      const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      let spinnerIndex = 0;

      const interval = setInterval(() => {
        if (completed >= packages.length) {
          clearInterval(interval);

          // Show final completion
          term.write(`\x1b[${packages.length + 2}A`); // Move up to start
          packages.forEach((pkg) => {
            term.write('\x1b[2K\r');
            term.write(`\x1b[32m✓\x1b[0m ${pkg.name.padEnd(15)} ${pkg.size}\r\n`);
          });
          term.write('\x1b[2K\r\r\n');
          term.write('\x1b[2K\rDownloaded: 4 / 4\r\n');
          term.write('\x1b[2K\rProgress: [\x1b[32m████████████\x1b[0m] 100%\r\n\r\n');
          term.write('\x1b[32m✓\x1b[0m Installed 245 packages in 3.2s\r\n$ ');
          return;
        }

        spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
        totalProgress = Math.min(totalProgress + 3, 100);

        // Randomly complete a package
        if (Math.random() > 0.92 && completed < packages.length) {
          completed++;
        }

        // Move cursor up to redraw
        term.write(`\x1b[${packages.length + 2}A`); // Move up past all lines

        // Redraw each package line
        packages.forEach((pkg, i) => {
          term.write('\x1b[2K\r'); // Clear line
          if (i < completed) {
            term.write(`\x1b[32m✓\x1b[0m ${pkg.name.padEnd(15)} ${pkg.size}\r\n`);
          } else {
            term.write(`\x1b[36m${spinnerFrames[spinnerIndex]}\x1b[0m ${pkg.name.padEnd(15)} ${pkg.size}\r\n`);
          }
        });

        // Update stats
        term.write('\x1b[2K\r\r\n');
        term.write('\x1b[2K\r');
        term.write(`Downloaded: ${completed} / ${packages.length}\r\n`);

        // Progress bar
        term.write('\x1b[2K\r');
        const barLength = 12;
        const filled = Math.floor((totalProgress / 100) * barLength);
        const bar = '█'.repeat(filled) + ' '.repeat(barLength - filled);
        term.write(`Progress: [\x1b[36m${bar}\x1b[0m] ${totalProgress}%\r\n`);

        // Move back
        term.write('\x1b[2A');
      }, 80); // Update every 80ms

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
 * Simulates a test runner with live updates
 */
export const TestRunner: Story = {
  args: {
    headerTitle: 'Test Runner',
    headerSubtitle: 'Simulating Jest with Ink',
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      const term = terminalRef.current;

      term.write('\x1b[1;32m RUNS \x1b[0m test/app.test.ts\r\n');
      term.write('\x1b[1;32m RUNS \x1b[0m test/utils.test.ts\r\n');
      term.write('\x1b[1;32m RUNS \x1b[0m test/components.test.ts\r\n\r\n');
      term.write('Tests: 0 passed, 0 total\r\n');
      term.write('Time:  0.000s\r\n');

      let passed = 0;
      let time = 0;
      const statuses = ['RUNS', 'RUNS', 'PASS'];
      let statusIndex = 0;

      const interval = setInterval(() => {
        if (passed >= 15) {
          clearInterval(interval);

          // Final result
          term.write('\x1b[5A'); // Move up
          term.write('\x1b[2K\r\x1b[42;30m PASS \x1b[0m test/app.test.ts\r\n');
          term.write('\x1b[2K\r\x1b[42;30m PASS \x1b[0m test/utils.test.ts\r\n');
          term.write('\x1b[2K\r\x1b[42;30m PASS \x1b[0m test/components.test.ts\r\n\r\n');
          term.write('\x1b[2K\r\x1b[1;32mTests: 15 passed, 15 total\x1b[0m\r\n');
          term.write('\x1b[2K\rTime:  2.345s\r\n\r\n');
          term.write('\x1b[42;30m PASS \x1b[0m All tests passed!\r\n$ ');
          return;
        }

        passed++;
        time += 0.15;
        statusIndex = Math.floor((passed / 15) * 3);

        // Update display - move cursor up and rewrite
        term.write('\x1b[5A'); // Move up 5 lines

        // Test file statuses
        const currentStatus = statuses[Math.min(statusIndex, 2)];
        const bgColor = currentStatus === 'PASS' ? '42;30' : '43;30';

        term.write('\x1b[2K\r');
        term.write(passed > 5
          ? `\x1b[42;30m PASS \x1b[0m test/app.test.ts\r\n`
          : `\x1b[43;30m ${currentStatus} \x1b[0m test/app.test.ts\r\n`);

        term.write('\x1b[2K\r');
        term.write(passed > 10
          ? `\x1b[42;30m PASS \x1b[0m test/utils.test.ts\r\n`
          : `\x1b[43;30m ${currentStatus} \x1b[0m test/utils.test.ts\r\n`);

        term.write('\x1b[2K\r');
        term.write(`\x1b[${bgColor}m ${currentStatus} \x1b[0m test/components.test.ts\r\n\r\n`);

        // Stats
        term.write('\x1b[2K\r');
        term.write(`Tests: \x1b[32m${passed} passed\x1b[0m, ${passed} total\r\n`);
        term.write('\x1b[2K\r');
        term.write(`Time:  ${time.toFixed(3)}s\r\n`);

        term.write('\x1b[2A'); // Move back up
      }, 100);

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
 * Extreme case: Very rapid updates (stress test)
 */
export const StressTest: Story = {
  args: {
    headerTitle: 'Stress Test',
    headerSubtitle: 'Extreme rapid updates - tests scrollbar stability',
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      const term = terminalRef.current;

      term.write('\x1b[1;33m⚠ STRESS TEST - Rapid Updates\x1b[0m\r\n\r\n');
      term.write('Counter: 0\r\n');
      term.write('FPS: 0\r\n');
      term.write('Status: Running\r\n\r\n');
      term.write('This tests the scrollbar stability fix.\r\n');
      term.write('The scrollbar should remain stable!\r\n');

      let counter = 0;
      let lastTime = Date.now();
      let fps = 0;

      const interval = setInterval(() => {
        if (counter >= 500) {
          clearInterval(interval);
          term.write('\x1b[4A'); // Move up
          term.write('\x1b[2K\rCounter: \x1b[32m500 (Done!)\x1b[0m\r\n');
          term.write('\x1b[2K\rFPS: 0\r\n');
          term.write('\x1b[2K\rStatus: \x1b[32mCompleted\x1b[0m\r\n');
          return;
        }

        counter++;
        const now = Date.now();
        fps = Math.round(1000 / (now - lastTime));
        lastTime = now;

        // Very rapid cursor movements and line clears
        term.write('\x1b[4A'); // Move up 4 lines
        term.write('\x1b[2K\r');
        term.write(`Counter: \x1b[36m${counter}\x1b[0m\r\n`);
        term.write('\x1b[2K\r');
        term.write(`FPS: \x1b[33m${fps}\x1b[0m\r\n`);
        term.write('\x1b[2K\r');
        term.write(`Status: \x1b[32mRunning\x1b[0m ${'.'.repeat(counter % 4)}\r\n`);
        term.write('\x1b[3A'); // Move back up
      }, 20); // Update every 20ms (50 FPS) - very fast!

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
 * Simulates Claude Code-style file tree with expanding/collapsing
 * Tests large content rewrites (100+ lines) and scrollbar behavior
 */
export const FileTreeExplorer: Story = {
  args: {
    headerTitle: 'File Tree Explorer',
    headerSubtitle: 'Simulating dynamic file tree like Claude Code',
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      const term = terminalRef.current;

      // MUCH larger file tree structure (100+ files)
      const fileTree = {
        'src/': {
          'components/': {
            'common/': {
              'Button.tsx': null,
              'Input.tsx': null,
              'Card.tsx': null,
              'Modal.tsx': null,
              'Table.tsx': null,
              'Dropdown.tsx': null,
              'Checkbox.tsx': null,
              'Radio.tsx': null,
              'Switch.tsx': null,
              'Slider.tsx': null,
              'Tabs.tsx': null,
              'Accordion.tsx': null,
              'Tooltip.tsx': null,
              'Badge.tsx': null,
              'Avatar.tsx': null,
            },
            'layout/': {
              'Header.tsx': null,
              'Footer.tsx': null,
              'Sidebar.tsx': null,
              'Container.tsx': null,
              'Grid.tsx': null,
              'Flex.tsx': null,
              'Stack.tsx': null,
              'Divider.tsx': null,
            },
            'forms/': {
              'FormField.tsx': null,
              'TextInput.tsx': null,
              'TextArea.tsx': null,
              'Select.tsx': null,
              'FileUpload.tsx': null,
              'DatePicker.tsx': null,
              'TimePicker.tsx': null,
              'ColorPicker.tsx': null,
              'RangeInput.tsx': null,
            },
            'feedback/': {
              'Alert.tsx': null,
              'Toast.tsx': null,
              'Spinner.tsx': null,
              'ProgressBar.tsx': null,
              'Skeleton.tsx': null,
              'ErrorBoundary.tsx': null,
            },
          },
          'hooks/': {
            'useAuth.ts': null,
            'useData.ts': null,
            'useTheme.ts': null,
            'useLocalStorage.ts': null,
            'useSessionStorage.ts': null,
            'useDebounce.ts': null,
            'useThrottle.ts': null,
            'useMediaQuery.ts': null,
            'useWindowSize.ts': null,
            'useFetch.ts': null,
            'useForm.ts': null,
            'useValidation.ts': null,
            'useRouter.ts': null,
            'useAsync.ts': null,
            'useClickOutside.ts': null,
          },
          'utils/': {
            'format.ts': null,
            'validate.ts': null,
            'api.ts': null,
            'storage.ts': null,
            'date.ts': null,
            'string.ts': null,
            'number.ts': null,
            'array.ts': null,
            'object.ts': null,
            'crypto.ts': null,
            'url.ts': null,
            'regex.ts': null,
          },
          'pages/': {
            'Home.tsx': null,
            'Dashboard.tsx': null,
            'Settings.tsx': null,
            'Profile.tsx': null,
            'Users.tsx': null,
            'Analytics.tsx': null,
            'Reports.tsx': null,
            'Billing.tsx': null,
            'Notifications.tsx': null,
            'Help.tsx': null,
          },
          'services/': {
            'auth.service.ts': null,
            'api.service.ts': null,
            'storage.service.ts': null,
            'analytics.service.ts': null,
            'notification.service.ts': null,
            'logger.service.ts': null,
          },
          'store/': {
            'index.ts': null,
            'auth.slice.ts': null,
            'user.slice.ts': null,
            'ui.slice.ts': null,
            'data.slice.ts': null,
          },
          'types/': {
            'index.ts': null,
            'api.types.ts': null,
            'auth.types.ts': null,
            'user.types.ts': null,
            'common.types.ts': null,
          },
        },
        'tests/': {
          'unit/': {
            'components/': {
              'Button.test.tsx': null,
              'Input.test.tsx': null,
              'Card.test.tsx': null,
              'Modal.test.tsx': null,
              'Table.test.tsx': null,
            },
            'hooks/': {
              'useAuth.test.ts': null,
              'useData.test.ts': null,
              'useTheme.test.ts': null,
            },
            'utils/': {
              'format.test.ts': null,
              'validate.test.ts': null,
              'api.test.ts': null,
            },
          },
          'integration/': {
            'auth.test.ts': null,
            'api.test.ts': null,
            'routing.test.ts': null,
            'forms.test.ts': null,
          },
          'e2e/': {
            'login.spec.ts': null,
            'signup.spec.ts': null,
            'dashboard.spec.ts': null,
            'settings.spec.ts': null,
          },
        },
        'docs/': {
          'README.md': null,
          'API.md': null,
          'CONTRIBUTING.md': null,
          'CHANGELOG.md': null,
          'LICENSE.md': null,
          'SECURITY.md': null,
        },
        'scripts/': {
          'build.sh': null,
          'deploy.sh': null,
          'test.sh': null,
          'lint.sh': null,
        },
        'config/': {
          'webpack.config.js': null,
          'babel.config.js': null,
          'jest.config.js': null,
          'eslint.config.js': null,
        },
        'public/': {
          'index.html': null,
          'favicon.ico': null,
          'manifest.json': null,
          'robots.txt': null,
        },
        'package.json': null,
        'tsconfig.json': null,
        'tsconfig.node.json': null,
        '.gitignore': null,
        '.env.example': null,
        'README.md': null,
      };

      let expanded = new Set<string>();
      let selectedIndex = 0;
      let animFrame = 0;
      let isFirstDraw = true;

      // Enter alternate screen buffer for full-screen app
      term.write('\x1b[?1049h');
      // Clear the alternate screen
      term.write('\x1b[2J\x1b[H');

      const renderTree = (tree: any, prefix = '', path = '') => {
        const lines: string[] = [];
        const entries = Object.entries(tree);

        entries.forEach(([name, children], index) => {
          const isLast = index === entries.length - 1;
          const currentPath = path + name;
          const isDir = children !== null;
          const isExpanded = expanded.has(currentPath);

          const connector = isLast ? '└─ ' : '├─ ';
          const icon = isDir ? (isExpanded ? '📂' : '📁') : '📄';

          lines.push(`${prefix}${connector}${icon} ${name}`);

          if (isDir && isExpanded && children) {
            const newPrefix = prefix + (isLast ? '   ' : '│  ');
            const childLines = renderTree(children, newPrefix, currentPath);
            lines.push(...childLines);
          }
        });

        return lines;
      };

      const draw = () => {
        const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'][animFrame % 10];

        const lines = renderTree(fileTree);

        if (!isFirstDraw) {
          // Move cursor to home position and rewrite everything
          term.write('\x1b[H');
        }
        isFirstDraw = false;

        // Header (4 lines)
        term.write('\x1b[2K\r\x1b[1;36m╭─ Project Explorer ─────────────────────────────────────╮\x1b[0m\r\n');
        term.write(`\x1b[2K\r\x1b[1;36m│\x1b[0m \x1b[33m${spinner}\x1b[0m Watching for changes...                           \x1b[1;36m│\x1b[0m\r\n`);
        term.write('\x1b[2K\r\x1b[1;36m╰────────────────────────────────────────────────────────╯\x1b[0m\r\n');
        term.write('\x1b[2K\r\r\n');

        // File tree lines - MASSIVE rewrite of 100+ lines
        lines.forEach((line, idx) => {
          term.write('\x1b[2K\r');
          if (idx === selectedIndex) {
            term.write(`\x1b[44;37m${line.padEnd(60)}\x1b[0m\r\n`);
          } else {
            term.write(`${line}\r\n`);
          }
        });

        // Footer (3 lines)
        term.write('\x1b[2K\r\r\n');
        term.write('\x1b[2K\r\x1b[2m──────────────────────────────────────────────────────────\x1b[0m\r\n');
        term.write(`\x1b[2K\r\x1b[33m${expanded.size}\x1b[0m folders expanded | \x1b[36m${lines.length}\x1b[0m items visible\r\n`);
        term.write('\x1b[2K\r\x1b[2m[Use ↑↓ to navigate, → to expand, ← to collapse]\x1b[0m\r\n');
      };

      // Initial draw
      draw();

      let step = 0;
      const steps = [
        () => { expanded.add('src/'); selectedIndex = 0; },
        () => { expanded.add('src/components/'); selectedIndex = 1; },
        () => { expanded.add('src/components/common/'); selectedIndex = 2; },
        () => { expanded.add('src/components/layout/'); selectedIndex = 18; },
        () => { expanded.add('src/components/forms/'); selectedIndex = 27; },
        () => { expanded.add('src/components/feedback/'); selectedIndex = 37; },
        () => { expanded.add('src/hooks/'); selectedIndex = 45; },
        () => { expanded.add('src/utils/'); selectedIndex = 61; },
        () => { expanded.add('src/pages/'); selectedIndex = 74; },
        () => { expanded.add('src/services/'); selectedIndex = 85; },
        () => { expanded.add('src/store/'); selectedIndex = 92; },
        () => { expanded.add('src/types/'); selectedIndex = 98; },
        () => { expanded.add('tests/'); selectedIndex = 105; },
        () => { expanded.add('tests/unit/'); selectedIndex = 106; },
        () => { expanded.add('tests/unit/components/'); selectedIndex = 107; },
        () => { expanded.delete('src/components/common/'); selectedIndex = 2; },
        () => { expanded.add('src/components/common/'); selectedIndex = 2; },
        () => { expanded.delete('tests/unit/components/'); selectedIndex = 107; },
        () => { expanded.add('tests/unit/components/'); selectedIndex = 107; },
      ];

      const interval = setInterval(() => {
        if (step >= steps.length * 2) {
          clearInterval(interval);
          return;
        }

        animFrame++;

        // Execute step every 2 frames
        if (step % 2 === 0) {
          const stepIndex = Math.floor(step / 2);
          if (stepIndex < steps.length) {
            steps[stepIndex]();
          }
        }

        draw();
        step++;
      }, 120);

      return () => {
        clearInterval(interval);
        // Exit alternate screen buffer
        term.write('\x1b[?1049l');
      };
    }, [isReady]);

    return (
      <div style={{ height: '600px', width: '100%' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} />
      </div>
    );
  },
};

/**
 * Simulates streaming logs with colors and formatting
 * Tests scrolling behavior with 250+ lines of continuous content
 */
export const StreamingLogs: Story = {
  args: {
    headerTitle: 'Build Logs',
    headerSubtitle: 'Simulating streaming build output with 250+ lines',
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      const term = terminalRef.current;

      const files = [
        'src/components/Button.tsx', 'src/components/Input.tsx', 'src/components/Card.tsx',
        'src/components/Modal.tsx', 'src/components/Table.tsx', 'src/components/Dropdown.tsx',
        'src/components/Checkbox.tsx', 'src/components/Radio.tsx', 'src/components/Switch.tsx',
        'src/components/Slider.tsx', 'src/components/Tabs.tsx', 'src/components/Accordion.tsx',
        'src/hooks/useAuth.ts', 'src/hooks/useData.ts', 'src/hooks/useTheme.ts',
        'src/hooks/useLocalStorage.ts', 'src/hooks/useDebounce.ts', 'src/hooks/useThrottle.ts',
        'src/utils/format.ts', 'src/utils/validate.ts', 'src/utils/api.ts',
        'src/utils/storage.ts', 'src/utils/date.ts', 'src/utils/string.ts',
        'src/pages/Home.tsx', 'src/pages/Dashboard.tsx', 'src/pages/Settings.tsx',
        'src/pages/Profile.tsx', 'src/pages/Users.tsx', 'src/pages/Analytics.tsx',
        'src/services/auth.service.ts', 'src/services/api.service.ts', 'src/services/storage.service.ts',
        'src/store/auth.slice.ts', 'src/store/user.slice.ts', 'src/store/ui.slice.ts',
        'src/types/api.types.ts', 'src/types/auth.types.ts', 'src/types/user.types.ts',
        'tests/Button.test.tsx', 'tests/Input.test.tsx', 'tests/auth.test.ts',
        'tests/api.test.ts', 'tests/utils.test.ts', 'tests/hooks.test.ts',
      ];

      const logTemplates = [
        { prefix: '\x1b[36m[INFO]\x1b[0m', template: (file: string) => `Compiling ${file}...` },
        { prefix: '\x1b[36m[INFO]\x1b[0m', template: (file: string) => `Type checking ${file}...` },
        { prefix: '\x1b[36m[INFO]\x1b[0m', template: (file: string) => `Bundling ${file}...` },
        { prefix: '\x1b[32m[SUCCESS]\x1b[0m', template: (file: string) => `✓ ${file} compiled successfully` },
        { prefix: '\x1b[33m[WARN]\x1b[0m', template: () => 'Module size exceeds recommended limit' },
        { prefix: '\x1b[33m[WARN]\x1b[0m', template: () => 'Unused import detected' },
        { prefix: '\x1b[35m[DEBUG]\x1b[0m', template: () => `Cache hit ratio: ${Math.floor(Math.random() * 30 + 70)}%` },
        { prefix: '\x1b[35m[DEBUG]\x1b[0m', template: () => `Memory: ${Math.floor(Math.random() * 500 + 300)} MB` },
      ];

      const generalLogs = [
        '\x1b[36m[INFO]\x1b[0m Starting build process...',
        '\x1b[36m[INFO]\x1b[0m Loading configuration from tsconfig.json...',
        '\x1b[36m[INFO]\x1b[0m Resolving module dependencies...',
        '\x1b[36m[INFO]\x1b[0m Initializing TypeScript compiler...',
        '\x1b[36m[INFO]\x1b[0m Setting up webpack bundler...',
        '\x1b[36m[INFO]\x1b[0m Loading babel transformations...',
        '\x1b[36m[INFO]\x1b[0m Analyzing dependency graph...',
        '\x1b[35m[DEBUG]\x1b[0m Node version: v18.17.0',
        '\x1b[35m[DEBUG]\x1b[0m NPM version: 9.6.7',
        '\x1b[35m[DEBUG]\x1b[0m Platform: darwin arm64',
      ];

      term.write('\x1b[1;36m$ npm run build --verbose\x1b[0m\r\n\r\n');

      // Write initial logs
      generalLogs.forEach(log => {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        term.write(`\x1b[2m${timestamp}\x1b[0m ${log}\r\n`);
      });

      term.write('\r\n\x1b[1;33m─── Compilation Phase ───\x1b[0m\r\n\r\n');

      let logIndex = 0;
      let fileIndex = 0;

      const interval = setInterval(() => {
        if (logIndex >= 250) {
          clearInterval(interval);
          term.write('\r\n\x1b[1;33m─── Optimization Phase ───\x1b[0m\r\n\r\n');

          const optimizationLogs = [
            '\x1b[36m[INFO]\x1b[0m Minifying JavaScript bundles...',
            '\x1b[36m[INFO]\x1b[0m Optimizing CSS output...',
            '\x1b[36m[INFO]\x1b[0m Compressing images...',
            '\x1b[36m[INFO]\x1b[0m Generating source maps...',
            '\x1b[36m[INFO]\x1b[0m Calculating bundle sizes...',
            '\x1b[32m[SUCCESS]\x1b[0m Main bundle: 1.2 MB (gzipped: 345 KB)',
            '\x1b[32m[SUCCESS]\x1b[0m Vendor bundle: 856 KB (gzipped: 234 KB)',
            '\x1b[32m[SUCCESS]\x1b[0m CSS bundle: 145 KB (gzipped: 28 KB)',
          ];

          optimizationLogs.forEach(log => {
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            term.write(`\x1b[2m${timestamp}\x1b[0m ${log}\r\n`);
          });

          term.write('\r\n\x1b[42;30m BUILD SUCCESS \x1b[0m Build completed successfully!\r\n');
          term.write('\x1b[2m────────────────────────────────────────────────────\x1b[0m\r\n');
          term.write('Output: \x1b[36mdist/\x1b[0m\r\n');
          term.write('Files: \x1b[33m234\x1b[0m compiled\r\n');
          term.write('Time: \x1b[33m18.734s\x1b[0m\r\n');
          term.write('Size: \x1b[33m2.1 MB\x1b[0m (gzipped: 607 KB)\r\n');
          term.write('$ ');
          return;
        }

        const file = files[fileIndex % files.length];
        const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
        const message = template.template(file);
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];

        term.write(`\x1b[2m${timestamp}\x1b[0m ${template.prefix} ${message}\r\n`);

        // Occasionally add extra context logs
        if (logIndex % 15 === 0) {
          term.write(`\x1b[2m${timestamp}\x1b[0m \x1b[35m[DEBUG]\x1b[0m Processed ${logIndex} operations...\r\n`);
        }

        if (logIndex % 30 === 0 && logIndex > 0) {
          term.write(`\x1b[2m${timestamp}\x1b[0m \x1b[36m[INFO]\x1b[0m Progress: ${Math.floor((logIndex / 250) * 100)}% complete\r\n`);
        }

        logIndex++;
        fileIndex++;
      }, 60); // Fast streaming - 60ms per log

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
 * Simulates a complex dashboard with multiple panels updating
 * Tests large screen rewrites (80+ lines rewritten every update)
 */
export const ComplexDashboard: Story = {
  args: {
    headerTitle: 'System Dashboard',
    headerSubtitle: 'Massive dashboard with 80+ lines updating',
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      const term = terminalRef.current;

      // Multiple servers with their own metrics
      const servers = [
        { name: 'web-01.prod', region: 'us-east-1', cpu: 45, mem: 60, disk: 72, network: 125 },
        { name: 'web-02.prod', region: 'us-east-1', cpu: 52, mem: 58, disk: 68, network: 98 },
        { name: 'web-03.prod', region: 'us-west-2', cpu: 38, mem: 62, disk: 75, network: 156 },
        { name: 'api-01.prod', region: 'us-east-1', cpu: 67, mem: 74, disk: 55, network: 234 },
        { name: 'api-02.prod', region: 'us-west-2', cpu: 71, mem: 69, disk: 58, network: 198 },
        { name: 'db-01.prod', region: 'us-east-1', cpu: 83, mem: 88, disk: 91, network: 445 },
        { name: 'db-02.prod', region: 'us-east-1', cpu: 79, mem: 85, disk: 89, network: 412 },
        { name: 'cache-01.prod', region: 'us-east-1', cpu: 24, mem: 92, disk: 45, network: 567 },
        { name: 'cache-02.prod', region: 'us-west-2', cpu: 28, mem: 89, disk: 42, network: 523 },
        { name: 'worker-01.prod', region: 'us-east-1', cpu: 55, mem: 48, disk: 62, network: 87 },
      ];

      let activeUsers = 1847;
      let requests = 45823;
      let errors = 12;
      let warnings = 34;
      let isFirstDraw = true;

      // Enter alternate screen buffer for full-screen apps
      term.write('\x1b[?1049h');
      // Clear the alternate screen
      term.write('\x1b[2J\x1b[H');

      const drawDashboard = () => {
        const activities = [
          { time: '14:32:15', type: 'INFO', msg: 'Health check passed on all servers' },
          { time: '14:32:18', type: 'WARN', msg: 'High memory usage on db-01.prod' },
          { time: '14:32:22', type: 'INFO', msg: 'Auto-scaling triggered for web tier' },
          { time: '14:32:25', type: 'SUCCESS', msg: 'Deployed version 2.3.4 to production' },
          { time: '14:32:29', type: 'ERROR', msg: 'Connection timeout on api-02.prod' },
          { time: '14:32:33', type: 'INFO', msg: 'Cache hit ratio: 94.2%' },
          { time: '14:32:37', type: 'WARN', msg: 'SSL certificate expires in 30 days' },
          { time: '14:32:41', type: 'INFO', msg: 'Database backup completed successfully' },
          { time: '14:32:44', type: 'SUCCESS', msg: 'Load balancer health check passed' },
          { time: '14:32:48', type: 'INFO', msg: 'New instance launched: web-04.prod' },
        ];

        const alerts = [
          { severity: 'CRITICAL', server: 'db-01.prod', msg: 'CPU usage above 80% for 5 minutes' },
          { severity: 'WARNING', server: 'db-02.prod', msg: 'Disk usage approaching limit' },
          { severity: 'WARNING', server: 'cache-01.prod', msg: 'Memory usage above 90%' },
        ];

        if (!isFirstDraw) {
          // Move cursor to home position and rewrite everything
          term.write('\x1b[H');
        }
        isFirstDraw = false;

        // Header (3 lines)
        term.write('\x1b[2K\r\x1b[1;36m╔══════════════════════════════════════════════════════════════════════╗\x1b[0m\r\n');
        term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m                    PRODUCTION INFRASTRUCTURE DASHBOARD                  \x1b[1;36m║\x1b[0m\r\n');
        term.write('\x1b[2K\r\x1b[1;36m╠══════════════════════════════════════════════════════════════════════╣\x1b[0m\r\n');

        // Overall Stats (5 lines)
        term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m \x1b[1mOverall Statistics\x1b[0m                                                    \x1b[1;36m║\x1b[0m\r\n');
        term.write(`\x1b[2K\r\x1b[1;36m║\x1b[0m   Active Users:    \x1b[36m${activeUsers.toString().padStart(6)}\x1b[0m                                    \x1b[1;36m║\x1b[0m\r\n`);
        term.write(`\x1b[2K\r\x1b[1;36m║\x1b[0m   Requests/min:    \x1b[36m${requests.toString().padStart(6)}\x1b[0m                                    \x1b[1;36m║\x1b[0m\r\n`);
        term.write(`\x1b[2K\r\x1b[1;36m║\x1b[0m   Errors:          \x1b[31m${errors.toString().padStart(6)}\x1b[0m                                    \x1b[1;36m║\x1b[0m\r\n`);
        term.write(`\x1b[2K\r\x1b[1;36m║\x1b[0m   Warnings:        \x1b[33m${warnings.toString().padStart(6)}\x1b[0m                                    \x1b[1;36m║\x1b[0m\r\n`);
        term.write('\x1b[2K\r\x1b[1;36m╠══════════════════════════════════════════════════════════════════════╣\x1b[0m\r\n');

        // Server metrics table (14 lines - header(4) + servers(10))
        term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m \x1b[1mServer Metrics\x1b[0m                                                        \x1b[1;36m║\x1b[0m\r\n');
        term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m                                                                      \x1b[1;36m║\x1b[0m\r\n');
        term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m   \x1b[1mServer         Region      CPU   Mem   Disk  Network\x1b[0m           \x1b[1;36m║\x1b[0m\r\n');
        term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m   ─────────────────────────────────────────────────────────────    \x1b[1;36m║\x1b[0m\r\n');

        servers.forEach(server => {
          const cpuColor = server.cpu > 80 ? '\x1b[31m' : server.cpu > 60 ? '\x1b[33m' : '\x1b[32m';
          const memColor = server.mem > 80 ? '\x1b[31m' : server.mem > 60 ? '\x1b[33m' : '\x1b[32m';
          const diskColor = server.disk > 80 ? '\x1b[31m' : server.disk > 60 ? '\x1b[33m' : '\x1b[32m';

          term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m   ');
          term.write(`${server.name.padEnd(14)} `);
          term.write(`${server.region.padEnd(11)} `);
          term.write(`${cpuColor}${server.cpu.toString().padStart(3)}%\x1b[0m `);
          term.write(`${memColor}${server.mem.toString().padStart(3)}%\x1b[0m `);
          term.write(`${diskColor}${server.disk.toString().padStart(3)}%\x1b[0m `);
          term.write(`\x1b[36m${server.network.toString().padStart(4)} KB/s\x1b[0m`);
          term.write('   \x1b[1;36m║\x1b[0m\r\n');
        });

        term.write('\x1b[2K\r\x1b[1;36m╠══════════════════════════════════════════════════════════════════════╣\x1b[0m\r\n');

        // Recent Activity Log (12 lines - header(2) + activities(10))
        term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m \x1b[1mRecent Activity\x1b[0m                                                       \x1b[1;36m║\x1b[0m\r\n');
        term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m                                                                      \x1b[1;36m║\x1b[0m\r\n');

        activities.forEach(activity => {
          let typeColor = '\x1b[36m';
          if (activity.type === 'ERROR') typeColor = '\x1b[31m';
          else if (activity.type === 'WARN') typeColor = '\x1b[33m';
          else if (activity.type === 'SUCCESS') typeColor = '\x1b[32m';

          term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m   ');
          term.write(`\x1b[2m${activity.time}\x1b[0m `);
          term.write(`${typeColor}[${activity.type.padEnd(7)}]\x1b[0m `);
          term.write(`${activity.msg.slice(0, 42).padEnd(42)}`);
          term.write(' \x1b[1;36m║\x1b[0m\r\n');
        });

        term.write('\x1b[2K\r\x1b[1;36m╠══════════════════════════════════════════════════════════════════════╣\x1b[0m\r\n');

        // Alerts (5 lines - header(2) + alerts(3))
        term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m \x1b[1mActive Alerts\x1b[0m                                                         \x1b[1;36m║\x1b[0m\r\n');
        term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m                                                                      \x1b[1;36m║\x1b[0m\r\n');

        if (alerts.length === 0) {
          term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m   \x1b[32m✓ No active alerts\x1b[0m                                               \x1b[1;36m║\x1b[0m\r\n');
        } else {
          alerts.forEach(alert => {
            const severityColor = alert.severity === 'CRITICAL' ? '\x1b[41;37m' : '\x1b[43;30m';
            term.write('\x1b[2K\r\x1b[1;36m║\x1b[0m   ');
            term.write(`${severityColor} ${alert.severity} \x1b[0m `);
            term.write(`${alert.server.padEnd(15)} ${alert.msg.slice(0, 33).padEnd(33)}`);
            term.write(' \x1b[1;36m║\x1b[0m\r\n');
          });
        }

        // Footer (2 lines)
        term.write('\x1b[2K\r\x1b[1;36m╚══════════════════════════════════════════════════════════════════════╝\x1b[0m\r\n');

        const now = new Date().toLocaleTimeString();
        term.write(`\x1b[2K\r\x1b[2mLast updated: ${now} | Refresh rate: 200ms | Total servers: ${servers.length}\x1b[0m\r\n`);
      };

      // Initial draw
      drawDashboard();

      const interval = setInterval(() => {
        // Simulate metric changes for all servers
        servers.forEach(server => {
          server.cpu = Math.max(20, Math.min(95, server.cpu + (Math.random() - 0.5) * 10));
          server.mem = Math.max(40, Math.min(95, server.mem + (Math.random() - 0.5) * 5));
          server.disk = Math.max(40, Math.min(95, server.disk + (Math.random() - 0.5) * 2));
          server.network = Math.max(50, Math.min(600, server.network + (Math.random() - 0.5) * 50));
        });

        activeUsers = Math.max(1000, Math.min(5000, activeUsers + Math.floor((Math.random() - 0.5) * 100)));
        requests = Math.max(30000, Math.min(80000, requests + Math.floor((Math.random() - 0.5) * 1000)));
        if (Math.random() > 0.85) errors += 1;
        if (Math.random() > 0.8) warnings += 1;

        drawDashboard();
      }, 200);

      return () => {
        clearInterval(interval);
        // Exit alternate screen buffer
        term.write('\x1b[?1049l');
      };
    }, [isReady]);

    return (
      <div style={{ height: '600px', width: '100%' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} />
      </div>
    );
  },
};

/**
 * Pattern 1: Pure streaming with scrollback (like npm install)
 * Content scrolls naturally, no in-place updates
 */
export const PureStreamingLogs: Story = {
  args: {
    headerTitle: 'Pure Streaming Pattern',
    headerSubtitle: 'Content scrolls naturally - scrollback works',
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      const term = terminalRef.current;

      term.write('\x1b[1;36m$ npm run build\x1b[0m\r\n\r\n');

      let lineCount = 0;
      const interval = setInterval(() => {
        if (lineCount >= 100) {
          clearInterval(interval);
          term.write('\r\n\x1b[32m✓ Build completed successfully!\x1b[0m\r\n');
          return;
        }

        const level = lineCount % 7 === 0 ? 'ERROR' : lineCount % 4 === 0 ? 'WARN' : 'INFO';
        const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[36m';

        // Just append - never rewrite
        term.write(`${color}[${level}]\x1b[0m Compiling src/file-${lineCount}.tsx...\r\n`);
        lineCount++;
      }, 80);

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
 * Pattern 2: Hybrid - Scrolling content + Fixed status (like Claude Code)
 * This is the tricky one that causes the duplication bug if done wrong!
 */
export const HybridScrollingWithStatus: Story = {
  args: {
    headerTitle: 'Hybrid Pattern (Scrolling + Fixed Status)',
    headerSubtitle: 'How Claude Code should work - with scrollback',
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      const term = terminalRef.current;

      term.write('\x1b[1;36m$ Running tests...\x1b[0m\r\n\r\n');

      // Reserve space for fixed status (3 lines)
      term.write('┌─ Status ──────────────────────┐\r\n');
      term.write('│ Tests: 0/50 | Progress: 0%   │\r\n');
      term.write('└────────────────────────────────┘\r\n\r\n');

      let testsPassed = 0;
      let statusLinePosition = 3; // Track where status block is

      const interval = setInterval(() => {
        if (testsPassed >= 50) {
          clearInterval(interval);
          // Update final status
          term.write(`\x1b[${statusLinePosition + 1}A`); // Move up to status
          term.write('\x1b[2K\r│ \x1b[32mTests: 50/50 | Complete! ✓\x1b[0m  │\r\n');
          term.write(`\x1b[${statusLinePosition + 1}B`); // Move back down
          term.write('\r\n\x1b[32m✓ All tests passed!\x1b[0m\r\n');
          return;
        }

        testsPassed++;
        const progress = Math.floor((testsPassed / 50) * 100);

        // Append new test result (scrolling content)
        term.write(`\x1b[32m✓\x1b[0m test/file-${testsPassed}.test.ts\r\n`);
        statusLinePosition++; // Status moved down by one line

        // Update status in place (KEY: know exactly where it is)
        term.write(`\x1b[${statusLinePosition + 1}A`); // Move up to status line
        term.write(`\x1b[2K\r│ Tests: ${testsPassed}/50 | Progress: ${progress}% │\r\n`);
        term.write(`\x1b[${statusLinePosition + 1}B`); // Move back down

      }, 100);

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
 * Pattern 3: Full-screen with virtual scrolling (like htop, vim)
 * Uses alternate screen buffer - no native scrollback
 */
export const ViewportAwareDashboard: Story = {
  args: {
    headerTitle: 'Viewport-Aware Dashboard',
    headerSubtitle: 'Properly handles content larger than viewport',
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      const term = terminalRef.current;
      const xtermInstance = term.getTerminal();

      if (!xtermInstance) return;

      // Get viewport dimensions
      const getViewportHeight = () => xtermInstance.rows - 1; // -1 for status line

      // Generate 200 log lines (way more than viewport)
      const allLogs: string[] = [];
      for (let i = 0; i < 200; i++) {
        const level = i % 5 === 0 ? 'ERROR' : i % 3 === 0 ? 'WARN' : 'INFO';
        const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[36m';
        allLogs.push(`${color}[${level}]\x1b[0m Line ${i + 1}: Processing item ${i + 1}...`);
      }

      let scrollOffset = 0;
      let autoScroll = true;

      // Enter alternate screen buffer
      term.write('\x1b[?1049h');
      term.write('\x1b[2J\x1b[H');

      const render = () => {
        const viewportHeight = getViewportHeight();

        // KEY: Only render what fits in the viewport!
        const maxOffset = Math.max(0, allLogs.length - viewportHeight);
        if (autoScroll) {
          scrollOffset = maxOffset; // Stick to bottom
        }

        // Move to home
        term.write('\x1b[H');

        // Render only visible lines
        const visibleLogs = allLogs.slice(scrollOffset, scrollOffset + viewportHeight);

        visibleLogs.forEach((log, idx) => {
          term.write('\x1b[2K\r'); // Clear line
          term.write(log + '\r\n');
        });

        // Fill remaining space if needed
        const remaining = viewportHeight - visibleLogs.length;
        for (let i = 0; i < remaining; i++) {
          term.write('\x1b[2K\r\r\n');
        }

        // Status line at bottom
        term.write('\x1b[2K\r');
        const showing = `${scrollOffset + 1}-${Math.min(scrollOffset + viewportHeight, allLogs.length)}`;
        term.write(`\x1b[7m Lines ${showing}/${allLogs.length} | ` +
                   `Viewport: ${viewportHeight} | ` +
                   `${autoScroll ? '[AUTO-SCROLL]' : '[MANUAL]'} | ` +
                   `↑/↓: Scroll  Space: Toggle auto-scroll \x1b[0m`);
      };

      // Initial render
      render();

      // Simulate new logs arriving
      let logCounter = 200;
      const interval = setInterval(() => {
        logCounter++;
        const level = logCounter % 5 === 0 ? 'ERROR' : logCounter % 3 === 0 ? 'WARN' : 'INFO';
        const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[36m';
        allLogs.push(`${color}[${level}]\x1b[0m Line ${logCounter}: Processing item ${logCounter}...`);

        // Keep max 500 logs
        if (allLogs.length > 500) allLogs.shift();

        render();
      }, 200);

      // Handle scroll with arrow keys
      const handleData = (data: string) => {
        if (data === '\x1b[A') { // Up arrow
          autoScroll = false;
          scrollOffset = Math.max(0, scrollOffset - 1);
          render();
        } else if (data === '\x1b[B') { // Down arrow
          const viewportHeight = getViewportHeight();
          const maxOffset = Math.max(0, allLogs.length - viewportHeight);
          scrollOffset = Math.min(maxOffset, scrollOffset + 1);
          if (scrollOffset === maxOffset) autoScroll = true;
          render();
        } else if (data === ' ') { // Space
          autoScroll = !autoScroll;
          render();
        }
      };

      // This would normally be set via onData prop, but for demo we'll skip it
      // In a real app: pass handleData to the terminal's onData

      return () => {
        clearInterval(interval);
        term.write('\x1b[?1049l');
      };
    }, [isReady]);

    return (
      <div style={{ height: '600px', width: '100%' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} />
      </div>
    );
  },
};

/**
 * Simulates an interactive selection menu with large list (100+ items)
 * Tests cursor repositioning and massive line clearing/rewriting
 */
export const InteractiveMenu: Story = {
  args: {
    headerTitle: 'Interactive Menu',
    headerSubtitle: 'Large selection list with 100+ items and search',
  },
  render: (args) => {
    const terminalRef = useRef<ThemedTerminalRef>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isReady || !terminalRef.current) return;

      const term = terminalRef.current;

      // Generate 120+ items for massive rewrites
      const categories = [
        { name: 'Development', icon: '⚡', items: [
          'Start Development Server', 'Start Dev Server (Watch Mode)', 'Start Dev Server (Debug)',
          'Run TypeScript Compiler', 'Run Webpack Dev Server', 'Start Vite Server',
          'Run Metro Bundler', 'Start Expo Dev Server', 'Run Next.js Dev Server',
        ]},
        { name: 'Build', icon: '📦', items: [
          'Build for Production', 'Build for Staging', 'Build for Development',
          'Build with Source Maps', 'Build Optimized', 'Build Docker Image',
          'Build and Analyze Bundle', 'Build Library Package', 'Build Documentation Site',
        ]},
        { name: 'Testing', icon: '🧪', items: [
          'Run All Tests', 'Run Unit Tests', 'Run Integration Tests', 'Run E2E Tests',
          'Run Test Suite (Watch)', 'Run Tests with Coverage', 'Run Specific Test File',
          'Run Tests in Debug Mode', 'Run Visual Regression Tests', 'Run Performance Tests',
          'Run Security Tests', 'Run Accessibility Tests',
        ]},
        { name: 'Code Quality', icon: '✨', items: [
          'Lint Code', 'Lint and Fix', 'Format Code', 'Type Check',
          'Run Prettier', 'Run ESLint', 'Run Stylelint', 'Check Code Complexity',
          'Analyze Bundle Size', 'Check for Unused Dependencies', 'Audit Dependencies',
        ]},
        { name: 'Database', icon: '🗄️', items: [
          'Run Database Migrations', 'Rollback Migration', 'Seed Database',
          'Create Migration', 'Reset Database', 'Backup Database', 'Restore Database',
          'Generate Database Schema', 'Optimize Database', 'Database Health Check',
        ]},
        { name: 'Deployment', icon: '🚀', items: [
          'Deploy to Production', 'Deploy to Staging', 'Deploy to Development',
          'Deploy to Preview Environment', 'Rollback Deployment', 'Deploy Docker Containers',
          'Deploy to AWS', 'Deploy to Vercel', 'Deploy to Netlify', 'Deploy to Heroku',
          'Deploy Serverless Functions', 'Update CDN Cache',
        ]},
        { name: 'Git Operations', icon: '🌿', items: [
          'Create Feature Branch', 'Create Hotfix Branch', 'Merge Branch',
          'Rebase Current Branch', 'Cherry Pick Commit', 'Create Release Tag',
          'Push to Remote', 'Pull Latest Changes', 'Fetch All Branches',
          'Clean Stale Branches', 'Show Git Status',
        ]},
        { name: 'Docker', icon: '🐳', items: [
          'Build Docker Image', 'Run Docker Container', 'Stop All Containers',
          'Remove All Containers', 'Prune Docker System', 'Docker Compose Up',
          'Docker Compose Down', 'View Container Logs', 'Shell into Container',
        ]},
        { name: 'Documentation', icon: '📚', items: [
          'Generate API Documentation', 'Build Storybook', 'Generate TypeDoc',
          'Update README', 'Generate Changelog', 'Build Documentation Site',
          'Preview Documentation', 'Deploy Documentation',
        ]},
        { name: 'Monitoring', icon: '📊', items: [
          'View Application Logs', 'View Error Logs', 'View Access Logs',
          'View Performance Metrics', 'View Memory Usage', 'View CPU Usage',
          'View Network Stats', 'Monitor Database Queries', 'Check Health Endpoints',
        ]},
        { name: 'Utilities', icon: '🔧', items: [
          'Clean Build Directory', 'Clear Cache', 'Reset Node Modules',
          'Update All Dependencies', 'Check for Updates', 'Generate SSL Certificate',
          'Configure Environment Variables', 'Setup Git Hooks', 'Initialize Project',
        ]},
      ];

      const items: string[] = [];
      categories.forEach(cat => {
        cat.items.forEach(item => {
          items.push(`${cat.icon} ${item} [${cat.name}]`);
        });
      });

      let selectedIndex = 0;
      let searchQuery = '';
      let isSearching = false;
      let isFirstDraw = true;

      // Enter alternate screen buffer for full-screen app
      term.write('\x1b[?1049h');
      // Clear the alternate screen
      term.write('\x1b[2J\x1b[H');

      const draw = () => {
        const filteredItems = items.filter(item =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (!isFirstDraw) {
          // Move cursor to home position and rewrite everything
          term.write('\x1b[H');
        }
        isFirstDraw = false;

        // Header (3 lines)
        term.write('\x1b[2K\r\x1b[1;35m╔════════════════════════════════════════════════════════════════╗\x1b[0m\r\n');
        term.write('\x1b[2K\r\x1b[1;35m║\x1b[0m              SELECT AN ACTION TO PERFORM (120+ OPTIONS)          \x1b[1;35m║\x1b[0m\r\n');
        term.write('\x1b[2K\r\x1b[1;35m╚════════════════════════════════════════════════════════════════╝\x1b[0m\r\n');
        term.write('\x1b[2K\r\r\n');

        // Search box (0-2 lines)
        if (isSearching) {
          term.write(`\x1b[2K\r\x1b[33m🔍 Search:\x1b[0m ${searchQuery}_\r\n`);
          term.write('\x1b[2K\r\r\n');
        }

        // Items - can be 100+ lines that get completely rewritten
        filteredItems.forEach((item, index) => {
          term.write('\x1b[2K\r');
          if (index === selectedIndex) {
            term.write(`  \x1b[44;37m▶ ${item.padEnd(60)}\x1b[0m\r\n`);
          } else {
            term.write(`    ${item}\r\n`);
          }
        });

        // Footer (4 lines)
        term.write('\x1b[2K\r\r\n');
        term.write('\x1b[2K\r\x1b[2m──────────────────────────────────────────────────────────────────\x1b[0m\r\n');
        term.write('\x1b[2K\r\x1b[2m↑/↓: Navigate  Enter: Select  /: Search  Esc: Exit  PgUp/PgDn: Page\x1b[0m\r\n');
        term.write(`\x1b[2K\r\x1b[2mShowing ${filteredItems.length} items${searchQuery ? ` (filtered from ${items.length})` : ''}\x1b[0m\r\n`);
      };

      // Initial draw
      draw();

      let step = 0;
      const steps = [
        () => { selectedIndex = 5; },
        () => { selectedIndex = 15; },
        () => { selectedIndex = 25; },
        () => { selectedIndex = 35; },
        () => { selectedIndex = 45; },
        () => { selectedIndex = 55; },
        () => { isSearching = true; searchQuery = 'd'; selectedIndex = 0; },
        () => { searchQuery = 'de'; },
        () => { searchQuery = 'dep'; },
        () => { searchQuery = 'deplo'; },
        () => { searchQuery = 'deploy'; },
        () => { selectedIndex = 1; },
        () => { selectedIndex = 3; },
        () => { isSearching = false; searchQuery = ''; selectedIndex = 0; },
        () => { selectedIndex = 10; },
        () => { selectedIndex = 30; },
        () => { selectedIndex = 60; },
        () => { selectedIndex = 90; },
        () => { isSearching = true; searchQuery = 't'; selectedIndex = 0; },
        () => { searchQuery = 'te'; },
        () => { searchQuery = 'tes'; },
        () => { searchQuery = 'test'; },
        () => { selectedIndex = 2; },
        () => { isSearching = false; searchQuery = ''; selectedIndex = 0; },
      ];

      const interval = setInterval(() => {
        if (step >= steps.length) {
          clearInterval(interval);
          return;
        }

        steps[step]();
        draw();
        step++;
      }, 300);

      return () => {
        clearInterval(interval);
        // Exit alternate screen buffer
        term.write('\x1b[?1049l');
      };
    }, [isReady]);

    return (
      <div style={{ height: '600px', width: '100%' }}>
        <ThemedTerminalWithProvider ref={terminalRef} {...args} />
      </div>
    );
  },
};
