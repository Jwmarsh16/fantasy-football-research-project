import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:5055';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.js',
  use: { baseURL },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'npm --prefix ../client run build && python run_browser_smoke.py',
    cwd: fileURLToPath(new URL('../server/', import.meta.url)),
    url: baseURL,
    timeout: 60_000,
    gracefulShutdown: { signal: 'SIGINT', timeout: 5000 },
  },
});
