import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider } from '@a24z/industry-theme';
import '@xterm/xterm/css/xterm.css';
import '../src/styles/terminal-theme.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;
