// The rules for services, kept free from the database so they can be unit tested.
import { z } from "zod";

// The lengths an admin can pick from, in minutes
export const durationOptions = [15, 30, 45, 60, 90, 120, 180, 240] as const;

export type ServiceValues = {
  name: string;
  description: string;
  durationMinutes: string;
};

type ParseResult =
  | {
      success: true;
      data: { name: string; description: string | null; durationMinutes: number };
    }
  | { success: false; error: string };

const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Give the service a name" })
    .max(60, { error: "The name can be at most 60 characters" }),
  description: z
    .string()
    .trim()
    .max(200, { error: "The description can be at most 200 characters" }),
  // The form sends text, so it is turned into a number and checked against the list
  durationMinutes: z.coerce
    .number({ error: "Pick a length from the list" })
    .refine(
      (minutes) => (durationOptions as readonly number[]).includes(minutes),
      { error: "Pick a length from the list" },
    ),
});

export function parseService(values: ServiceValues): ParseResult {
  const result = serviceSchema.safeParse(values);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { name, description, durationMinutes } = result.data;
  // An empty description is saved as "no description"
  return {
    success: true,
    data: { name, description: description || null, durationMinutes },
  };
}

// For example "30 min", "1 h" or "1 h 30 min"
export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}
