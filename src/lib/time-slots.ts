// The rules for time slots, kept free from the database and Next.js
// so they can be unit tested on their own.
import { z } from "zod";

export type TimeSlotValues = {
  serviceId: string;
  date: string;
  startTime: string;
};

type ParseResult =
  | { success: true; data: { serviceId: number; startsAt: Date } }
  | { success: false; error: string };

const timeSlotSchema = z.object({
  serviceId: z.coerce
    .number({ error: "Pick a service" })
    .int({ error: "Pick a service" })
    .positive({ error: "Pick a service" }),
  date: z.iso.date({ error: "Pick a date" }),
  startTime: z.iso.time({ precision: -1, error: "Pick a start time" }),
});

// Turns the form values into a service id and a start date, and checks the rules.
// `now` can be passed in, so tests don't depend on today's date.
export function parseTimeSlot(
  values: TimeSlotValues,
  now: Date = new Date(),
): ParseResult {
  const result = timeSlotSchema.safeParse(values);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { serviceId, date, startTime } = result.data;
  const startsAt = new Date(`${date}T${startTime}`);

  if (startsAt <= now) {
    return { success: false, error: "The time must be in the future" };
  }

  return { success: true, data: { serviceId, startsAt } };
}

// The end of a time is the start plus the length of the service
export function calculateEnd(startsAt: Date, durationMinutes: number) {
  return new Date(startsAt.getTime() + durationMinutes * 60_000);
}
