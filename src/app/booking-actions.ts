"use server";

import { refresh } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

export type BookingFormState = { error: string } | null;

export async function bookTimeSlot(
  _prevState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const session = await requireUser();

  const timeSlotId = Number(formData.get("timeSlotId"));
  if (!Number.isInteger(timeSlotId)) {
    return { error: "Something went wrong, try again" };
  }

  const timeSlot = await prisma.timeSlot.findUnique({
    where: { id: timeSlotId },
  });

  // On errors the list is not refreshed, so the message stays next to the
  // time the customer clicked
  if (!timeSlot || timeSlot.startsAt <= new Date()) {
    return { error: "This time is no longer available" };
  }

  try {
    await prisma.booking.create({
      data: { timeSlotId, userId: session.user.id },
    });
  } catch (error) {
    // P2002 = unique constraint failed: someone else booked it first
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Sorry, someone just booked this time" };
    }
    throw error;
  }

  refresh();
  return null;
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
