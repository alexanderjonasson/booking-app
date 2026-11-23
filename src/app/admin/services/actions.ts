"use server";

import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { parseService, type ServiceValues } from "@/lib/services";

// On error the typed values are sent back so the form can show them again
export type ServiceFormState =
  | { error: string; values: ServiceValues }
  | { success: true }
  | null;

export async function createService(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  await requireAdmin();

  const values = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    durationMinutes: String(formData.get("durationMinutes") ?? ""),
  };

  const result = parseService(values);

  if (!result.success) {
    return { error: result.error, values };
  }

  await prisma.service.create({ data: result.data });
  refresh();
  return { success: true };
}

// A removed service is only hidden, so times and bookings that use it still work.
// Its times that nobody has booked yet are no longer offered to customers.
export async function removeService(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  await prisma.service.updateMany({
    where: { id },
    data: { isActive: false },
  });
  refresh();
}
