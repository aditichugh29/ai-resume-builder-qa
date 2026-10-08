import { defineConfig } from '@playwright/test';

// Runs the REAL React frontend (cloned from the repo) with the backend API mocked.
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  reporter: [['list'], ['json', { outputFile: 'results.json' }], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:5173', browserName: 'chromium', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --port 5173',
    cwd: process.env.CLIENT_DIR || '../../ai-resume-builder/client',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    env: { VITE_BASE_URL: 'http://mock-api.test' },
    timeout: 60000,
  },
});
