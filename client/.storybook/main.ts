import type { StorybookConfig } from '@storybook/vue3-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: [
          { find: '@', replacement: path.resolve(__dirname, '../src') },
          {
            find: '@components',
            replacement: path.resolve(__dirname, '../src/components'),
          },
          { find: '@views', replacement: path.resolve(__dirname, '../src/views') },
          {
            find: '@stores',
            replacement: path.resolve(__dirname, '../src/stores'),
          },
          { find: '@api', replacement: path.resolve(__dirname, '../src/api') },
          { find: '@types', replacement: path.resolve(__dirname, '../src/types') },
        ],
      },
    });
  },
};

export default config;

