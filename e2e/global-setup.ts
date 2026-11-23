// Runs once before all tests: creates the test database if needed
// and applies the Prisma migrations to it.
import { execSync } from "node:child_process";
import { Client } from "pg";
import { testDatabaseUrl } from "./test-env";

export default async function globalSetup() {
  const url = new URL(testDatabaseUrl);
  const databaseName = url.pathname.slice(1);

  // Connect to the default "postgres" database to be able to create a new one
  url.pathname = "/postgres";
  const client = new Client({ connectionString: url.toString() });
  await client.connect();
  const existing = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [databaseName],
  );
  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE "${databaseName}"`);
  }
  await client.end();

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: "inherit",
  });
}
