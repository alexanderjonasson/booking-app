// Settings shared by the Playwright config and the tests.
// The tests use their own database, so they never touch your real data.
import "dotenv/config";

function getTestDatabaseUrl() {
  // In CI the URL is given directly
  if (process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }

  // Locally: same Postgres server as the app, but a database called booking_test
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in .env");
  }
  const url = new URL(process.env.DATABASE_URL);
  url.pathname = "/booking_test";
  return url.toString();
}

export const testDatabaseUrl = getTestDatabaseUrl();

export const testPort = 3100;
export const baseURL = `http://localhost:${testPort}`;
