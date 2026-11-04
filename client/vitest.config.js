// /home/jwmarsh16/projects/fantasy-football-research-project/client/vitest.config.js
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js'; // ADDED: Reuse the existing React configuration.

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true, // ADDED: Support describe, it, and expect in existing tests.
      environment: 'jsdom', // ADDED: Provide browser-like APIs for React tests.
      setupFiles: './src/setupTests.js', // ADDED: Load existing DOM assertions.
    },
  }),
);