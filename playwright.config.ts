import { defineConfig, devices } from "@playwright/test";
import { baseURL, testDatabaseUrl, testPort } from "./e2e/test-env";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  // The tests share one database, so they run one at a time
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Builds and starts the app on its own port, connected to the test database.
  // A production build is used, the same as when the app is deployed.
  webServer: {
    command: `npm run build && npm run start -- -p ${testPort}`,
    // A page that does not use the database, since the tables are created later
    url: `${baseURL}/sign-in`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
      BETTER_AUTH_URL: baseURL,
    } as Record<string, string>,
  },
});
