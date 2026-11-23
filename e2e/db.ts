// Small helpers that talk straight to the test database,
// to set up data before a test and clean up between tests.
import { Client } from "pg";
import { testDatabaseUrl } from "./test-env";

async function query(sql: string, params: unknown[] = []) {
  const client = new Client({ connectionString: testDatabaseUrl });
  await client.connect();
  try {
    return await client.query(sql, params);
  } finally {
    await client.end();
  }
}

// Empties every table, so each test starts from scratch
export async function resetDatabase() {
  await query(
    `TRUNCATE "Booking", "TimeSlot", "session", "account", "verification", "user" RESTART IDENTITY CASCADE`,
  );
}

export async function createTimeSlot(startsAt: Date, endsAt: Date) {
  await query(`INSERT INTO "TimeSlot" ("startsAt", "endsAt") VALUES ($1, $2)`, [
    startsAt,
    endsAt,
  ]);
}

export async function makeAdmin(email: string) {
  await query(`UPDATE "user" SET role = 'admin' WHERE email = $1`, [email]);
}
