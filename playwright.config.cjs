const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  workers: 2,
  timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:4399', browserName: 'chromium', reducedMotion: 'reduce' },
  webServer: {
    command: 'node server.cjs --port=4399',
    url: 'http://127.0.0.1:4399',
    reuseExistingServer: false,
  },
});
