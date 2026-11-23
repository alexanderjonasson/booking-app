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
    `TRUNCATE "Booking", "TimeSlot", "Service", "session", "account", "verification", "user" RESTART IDENTITY CASCADE`,
  );
}

// Returns the id of the new service
export async function createService(
  name = "Consultation",
  durationMinutes = 60,
): Promise<number> {
  const result = await query(
    `INSERT INTO "Service" ("name", "durationMinutes") VALUES ($1, $2) RETURNING "id"`,
    [name, durationMinutes],
  );
  return result.rows[0].id;
}

// Creates a time for the given service, or for a new "Consultation" service
export async function createTimeSlot(
  startsAt: Date,
  endsAt: Date,
  serviceId?: number,
) {
  const id = serviceId ?? (await createService());
  await query(
    `INSERT INTO "TimeSlot" ("startsAt", "endsAt", "serviceId") VALUES ($1, $2, $3)`,
    [startsAt, endsAt, id],
  );
}

export async function removeService(id: number) {
  await query(`UPDATE "Service" SET "isActive" = false WHERE "id" = $1`, [id]);
}

export async function makeAdmin(email: string) {
  await query(`UPDATE "user" SET role = 'admin' WHERE email = $1`, [email]);
}
