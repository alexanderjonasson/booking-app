// The rules for bookings, kept free from the database so they can be unit tested.
import { z } from "zod";

export const maxNoteLength = 500;

type ParseResult =
  | { success: true; data: { timeSlotId: number; note: string | null } }
  | { success: false; error: string };

const bookingSchema = z.object({
  timeSlotId: z.coerce
    .number({ error: "Something went wrong, try again" })
    .int({ error: "Something went wrong, try again" })
    .positive({ error: "Something went wrong, try again" }),
  note: z.string().trim().max(maxNoteLength, {
    error: `The message can be at most ${maxNoteLength} characters`,
  }),
});

export function parseBooking(values: {
  timeSlotId: string;
  note: string;
}): ParseResult {
  const result = bookingSchema.safeParse(values);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { timeSlotId, note } = result.data;
  // An empty message is saved as "no message"
  return { success: true, data: { timeSlotId, note: note || null } };
}
