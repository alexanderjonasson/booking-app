"use server";

import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import {
  calculateEnd,
  parseTimeSlot,
  type TimeSlotValues,
} from "@/lib/time-slots";

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
    serviceId: String(formData.get("serviceId") ?? ""),
    date: String(formData.get("date") ?? ""),
    startTime: String(formData.get("startTime") ?? ""),
  };

  const result = parseTimeSlot(values);

  if (!result.success) {
    return { error: result.error, values };
  }

  const { serviceId, startsAt } = result.data;

  // The service must exist and not be removed
  const service = await prisma.service.findFirst({
    where: { id: serviceId, isActive: true },
  });
  if (!service) {
    return { error: "Pick a service", values };
  }

  const endsAt = calculateEnd(startsAt, service.durationMinutes);

  // Two times overlap if one starts before the other ends, and vice versa
  const overlapping = await prisma.timeSlot.findFirst({
    where: { startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
  });

  if (overlapping) {
    return { error: "This time overlaps with an existing time", values };
  }

  await prisma.timeSlot.create({ data: { serviceId, startsAt, endsAt } });
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
