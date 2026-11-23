import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatTimeSlot } from "@/lib/format";
import { BookButton } from "@/components/BookButton";
import { buttonDanger, card, link, mutedText } from "@/lib/ui";
import { cancelBooking } from "./booking-actions";

async function MyBookings() {
  // The list depends on the current time, so it is rendered on every request
  await connection();
  const session = await getSession();
  if (!session) return null;

  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
      timeSlot: { startsAt: { gte: new Date() } },
    },
    include: { timeSlot: true },
    orderBy: { timeSlot: { startsAt: "asc" } },
  });

  return (
    <section aria-labelledby="my-bookings" className={card}>
      <h2 id="my-bookings" className="mb-4 text-lg font-semibold">
        Your bookings
      </h2>
      {bookings.length === 0 ?
        <p className={mutedText}>You have no upcoming bookings.</p>
      : <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {bookings.map((booking) => {
            const time = formatTimeSlot(
              booking.timeSlot.startsAt,
              booking.timeSlot.endsAt,
            );
            return (
              <li
                key={booking.id}
                className="flex items-center justify-between gap-4 py-3">
                <span className="font-medium">{time}</span>
                <form action={cancelBooking}>
                  <input type="hidden" name="id" value={booking.id} />
                  <button
                    type="submit"
                    aria-label={`Cancel booking ${time}`}
                    className={buttonDanger}>
                    Cancel
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      }
    </section>
  );
}

async function AvailableTimes() {
  await connection();
  const session = await getSession();

  // Upcoming times that nobody has booked yet
  const timeSlots = await prisma.timeSlot.findMany({
    where: { startsAt: { gte: new Date() }, booking: { is: null } },
    orderBy: { startsAt: "asc" },
  });

  return (
    <section aria-labelledby="available-times" className={card}>
      <h2 id="available-times" className="mb-4 text-lg font-semibold">
        Available times
      </h2>
      {timeSlots.length === 0 ?
        <p className={mutedText}>There are no available times right now.</p>
      : <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {timeSlots.map((slot) => {
            const time = formatTimeSlot(slot.startsAt, slot.endsAt);
            return (
              <li
                key={slot.id}
                className="flex items-center justify-between gap-4 py-3">
                <span className="font-medium">{time}</span>
                {session ?
                  <BookButton timeSlotId={slot.id} time={time} />
                : <Link href="/sign-in" className={`text-sm ${link}`}>
                    Sign in to book
                  </Link>
                }
              </li>
            );
          })}
        </ul>
      }
    </section>
  );
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Book a time that suits you
      </h1>
      <p className={`mt-2 mb-8 ${mutedText}`}>
        Pick an available time below. You can cancel whenever you like.
      </p>
      <div className="space-y-6">
        <Suspense fallback={<p className={mutedText}>Loading times...</p>}>
          <MyBookings />
          <AvailableTimes />
        </Suspense>
      </div>
    </main>
  );
}
