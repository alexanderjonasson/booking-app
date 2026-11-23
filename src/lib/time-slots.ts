// The rules for time slots, kept free from the database and Next.js
// so they can be unit tested on their own.
import { z } from "zod";

export type TimeSlotValues = { date: string; startTime: string; endTime: string };

type ParseResult =
  | { success: true; data: { startsAt: Date; endsAt: Date } }
  | { success: false; error: string };

const timeSlotSchema = z.object({
  date: z.iso.date({ error: "Pick a date" }),
  startTime: z.iso.time({ precision: -1, error: "Pick a start time" }),
  endTime: z.iso.time({ precision: -1, error: "Pick an end time" }),
});

// Turns the form values into dates and checks the rules.
// `now` can be passed in, so tests don't depend on today's date.
export function parseTimeSlot(
  values: TimeSlotValues,
  now: Date = new Date(),
): ParseResult {
  const result = timeSlotSchema.safeParse(values);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { date, startTime, endTime } = result.data;
  const startsAt = new Date(`${date}T${startTime}`);
  const endsAt = new Date(`${date}T${endTime}`);

  if (endsAt <= startsAt) {
    return { success: false, error: "The end time must be after the start time" };
  }
  if (startsAt <= now) {
    return { success: false, error: "The time must be in the future" };
  }

  return { success: true, data: { startsAt, endsAt } };
}

