"use server";

import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { parseTimeSlot, type TimeSlotValues } from "@/lib/time-slots";

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

  const result = parseTimeSlot(values);

  if (!result.success) {
    return { error: result.error, values };
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
