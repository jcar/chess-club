import { defineConfig, devices } from "@playwright/test";

// Runs against the *static export*, the same artifact GitHub Pages serves.
// PW_PAGES=1 builds with the GitHub Pages base path and serves it under
// /chess-club/, which catches any URL that forgot withBasePath().
const PAGES = !!process.env.PW_PAGES;
const PORT = PAGES ? 4322 : 4321;
const PREFIX = PAGES ? "/chess-club" : "";
const BASE_URL = `http://localhost:${PORT}${PREFIX}/`;

const build = PAGES
  ? `NEXT_PUBLIC_BASE_PATH=${PREFIX} npm run build && rm -rf .pages && mkdir -p .pages && cp -r out .pages${PREFIX} && npx serve .pages -l ${PORT} --no-port-switching --no-clipboard`
  : `npm run build && npx serve out -l ${PORT} --no-port-switching --no-clipboard`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"]],
  use: { baseURL: BASE_URL, trace: "on-first-retry" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "ipad", use: { ...devices["iPad (gen 7)"], browserName: "chromium" } },
    { name: "ipad-landscape", use: { ...devices["iPad (gen 7) landscape"], browserName: "chromium" } },
    { name: "iphone", use: { ...devices["iPhone 14"], browserName: "chromium" } },
  ],
  webServer: {
    command: build,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
