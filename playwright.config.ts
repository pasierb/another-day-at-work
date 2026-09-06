import { defineConfig } from 'playwright/test';

export default defineConfig({
    testDir: './e2e', timeout: 120_000, expect: { timeout: 10_000 }, workers: 1,
    outputDir: 'playtest-results/artifacts', reporter: [['line'], ['html', { outputFolder: 'playtest-results/report', open: 'never' }]],
    use: { baseURL: 'http://127.0.0.1:4173', viewport: { width: 1280, height: 720 }, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
    webServer: { command: 'npm run build:smoke && npm run preview -- --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: false, timeout: 120_000 }
});
