// Fills the database with demo data for the live demo.
// It EMPTIES the database first, so it only runs with --confirm.
//
// Usage: npm run seed:demo -- --confirm
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../src/lib/prisma";
import { stockholmTimeToDate } from "../src/lib/time-zone";
import { calculateEnd } from "../src/lib/time-slots";

export const demoPassword = "demo-password";

const users = [
  { name: "Demo Admin", email: "admin@example.com", role: "admin" },
  { name: "Demo Customer", email: "customer@example.com", role: "customer" },
  { name: "Sara Lind", email: "sara@example.com", role: "customer" },
  { name: "Jonas Berg", email: "jonas@example.com", role: "customer" },
];

const services = [
  {
    name: "Consultation",
    description: "A first meeting to talk about your needs and goals",
    durationMinutes: 45,
  },
  {
    name: "Follow-up",
    description: "A shorter meeting to check how things are going",
    durationMinutes: 30,
  },
  {
    name: "Workshop",
    description: "A longer session where we work through the plan together",
    durationMinutes: 120,
  },
];

// Each weekday gets these times, in Stockholm time
const dailySchedule = [
  { time: "09:00", service: "Consultation" },
  { time: "10:00", service: "Follow-up" },
  { time: "13:00", service: "Workshop" },
  { time: "15:30", service: "Consultation" },
];

// The next `count` weekdays, starting tomorrow, as "YYYY-MM-DD" in Stockholm
function nextWeekdays(count: number) {
  const format = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const days: string[] = [];
  const day = new Date();

  while (days.length < count) {
    day.setUTCDate(day.getUTCDate() + 1);
    const parts = Object.fromEntries(
      format.formatToParts(day).map((part) => [part.type, part.value]),
    );
    if (parts.weekday !== "Sat" && parts.weekday !== "Sun") {
      days.push(`${parts.year}-${parts.month}-${parts.day}`);
    }
  }
  return days;
}

async function main() {
  if (!process.argv.includes("--confirm")) {
    console.error(
      "This empties the database. Run it with: npm run seed:demo -- --confirm",
    );
    process.exit(1);
  }

  await prisma.$executeRawUnsafe(
    `TRUNCATE "Booking", "TimeSlot", "Service", "session", "account", "verification", "user" RESTART IDENTITY CASCADE`,
  );

  // Users are created the same way Better Auth does it: a user row and a
  // "credential" account row with the hashed password
  const password = await hashPassword(demoPassword);
  const userIds = new Map<string, string>();

  for (const user of users) {
    const id = randomUUID();
    userIds.set(user.email, id);
    await prisma.user.create({
      data: { id, name: user.name, email: user.email, role: user.role },
    });
    await prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: id,
        providerId: "credential",
        userId: id,
        password,
      },
    });
  }

  const serviceByName = new Map<string, { id: number; durationMinutes: number }>();
  for (const service of services) {
    const created = await prisma.service.create({ data: service });
    serviceByName.set(service.name, created);
  }

  const timeSlotIds: number[] = [];
  for (const date of nextWeekdays(10)) {
    for (const slot of dailySchedule) {
      const service = serviceByName.get(slot.service)!;
      const startsAt = stockholmTimeToDate(date, slot.time);
      const created = await prisma.timeSlot.create({
        data: {
          serviceId: service.id,
          startsAt,
          endsAt: calculateEnd(startsAt, service.durationMinutes),
        },
      });
      timeSlotIds.push(created.id);
    }
  }

  // A few bookings, so the admin page has something to show
  const bookings = [
    {
      slot: 0,
      email: "sara@example.com",
      note: "I would like to talk about a new website for my shop",
    },
    { slot: 2, email: "jonas@example.com", note: null },
    {
      slot: 5,
      email: "customer@example.com",
      note: "Looking forward to it!",
    },
  ];
  for (const booking of bookings) {
    await prisma.booking.create({
      data: {
        timeSlotId: timeSlotIds[booking.slot],
        userId: userIds.get(booking.email)!,
        note: booking.note,
      },
    });
  }

  console.log(
    `Demo data created: ${users.length} users, ${services.length} services, ${timeSlotIds.length} times, ${bookings.length} bookings.`,
  );
}

main().finally(() => prisma.$disconnect());
