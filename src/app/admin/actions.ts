"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

const timeSlotSchema = z
  .object({
    date: z.iso.date({ error: "Pick a date" }),
    startTime: z.iso.time({ precision: -1, error: "Pick a start time" }),
    endTime: z.iso.time({ precision: -1, error: "Pick an end time" }),
  })
  .transform(({ date, startTime, endTime }) => ({
    startsAt: new Date(`${date}T${startTime}`),
    endsAt: new Date(`${date}T${endTime}`),
  }))
  .refine((slot) => slot.endsAt > slot.startsAt, {
    error: "The end time must be after the start time",
  })
  .refine((slot) => slot.startsAt > new Date(), {
    error: "The time must be in the future",
  });

type TimeSlotValues = { date: string; startTime: string; endTime: string };

// On error the typed values are sent back so the form can show them again
export type TimeSlotFormState =
  | { error: string; values: TimeSlotValues }
  | { success: true }
  | null;

export async function createTimeSlot(
  _prevState: TimeSlotFormState,
  formData: FormData,
): Promise<TimeSlotFormState> {
  // Server Actions can be called directly, so the role is checked here too
  await requireAdmin();

  const values = {
    date: String(formData.get("date") ?? ""),
    startTime: String(formData.get("startTime") ?? ""),
    endTime: String(formData.get("endTime") ?? ""),
  };

  const result = timeSlotSchema.safeParse(values);

  if (!result.success) {
    return { error: result.error.issues[0].message, values };
  }

  const { startsAt, endsAt } = result.data;

  // Two slots overlap if one starts before the other ends, and vice versa
  const overlapping = await prisma.timeSlot.findFirst({
    where: { startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
  });

  if (overlapping) {
    return { error: "This time overlaps with an existing time", values };
  }

  await prisma.timeSlot.create({ data: { startsAt, endsAt } });
  refresh();
  return { success: true };
}

export async function deleteTimeSlot(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  await prisma.timeSlot.deleteMany({ where: { id } });
  refresh();
}
