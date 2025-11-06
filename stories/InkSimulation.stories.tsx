import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useEffect, useState } from 'react';
import { ThemeProvider } from '@a24z/industry-theme';
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
