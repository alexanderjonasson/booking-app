"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { parseBooking } from "@/lib/bookings";

// On error the message is sent back so the form can show it again
export type BookingFormState = { error: string; note: string } | null;

export async function bookTimeSlot(
  _prevState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const session = await requireUser();

  const values = {
    timeSlotId: String(formData.get("timeSlotId") ?? ""),
    note: String(formData.get("note") ?? ""),
  };

  const result = parseBooking(values);
  if (!result.success) {
    return { error: result.error, note: values.note };
  }

  const { timeSlotId, note } = result.data;

  // The time must still be in the future and its service still offered
  const timeSlot = await prisma.timeSlot.findUnique({
    where: { id: timeSlotId },
    include: { service: true },
  });

  if (
    !timeSlot ||
    timeSlot.startsAt <= new Date() ||
    !timeSlot.service.isActive
  ) {
    return { error: "This time is no longer available", note: values.note };
  }

  try {
    await prisma.booking.create({
      data: { timeSlotId, userId: session.user.id, note },
    });
  } catch (error) {
    // P2002 = unique constraint failed: someone else booked it first
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Sorry, someone just booked this time", note: values.note };
    }
    throw error;
  }

  // redirect() works by throwing, so it is called outside the try/catch
  redirect("/?booked=1");
}

export async function cancelBooking(formData: FormData) {
  const session = await requireUser();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  // userId in the where clause: you can only cancel your own bookings
  await prisma.booking.deleteMany({
    where: { id, userId: session.user.id },
  });
  refresh();
}
