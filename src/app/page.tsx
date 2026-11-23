import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatTimeSlot } from "@/lib/format";
import { formatDuration } from "@/lib/services";
import {
  buttonDanger,
  buttonPrimary,
  card,
  link,
  mutedText,
  successText,
} from "@/lib/ui";
import { cancelBooking } from "./booking-actions";

const durationBadge = `ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-800 ${mutedText}`;

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
    include: { timeSlot: { include: { service: true } } },
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
            const { service } = booking.timeSlot;
            const time = formatTimeSlot(
              booking.timeSlot.startsAt,
              booking.timeSlot.endsAt,
            );
            return (
              <li
                key={booking.id}
                className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{service.name}</p>
                  <p className={`text-sm ${mutedText}`}>{time}</p>
                  {booking.note && (
                    <p className={`mt-1 text-sm ${mutedText}`}>
                      Your message: {booking.note}
                    </p>
                  )}
                </div>
                <form action={cancelBooking}>
                  <input type="hidden" name="id" value={booking.id} />
                  <button
                    type="submit"
                    aria-label={`Cancel ${service.name} ${time}`}
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

  // Upcoming times that nobody has booked yet, for services that are offered
  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      startsAt: { gte: new Date() },
      booking: { is: null },
      service: { isActive: true },
    },
    include: { service: true },
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
                <div className="min-w-0">
                  <p className="font-medium">
                    {slot.service.name}{" "}
                    <span className={durationBadge}>
                      {formatDuration(slot.service.durationMinutes)}
                    </span>
                  </p>
                  <p className={`text-sm ${mutedText}`}>{time}</p>
                  {slot.service.description && (
                    <p className={`mt-1 text-sm ${mutedText}`}>
                      {slot.service.description}
                    </p>
                  )}
                </div>
                {session ?
                  <Link
                    href={`/book/${slot.id}`}
                    aria-label={`Book ${slot.service.name} ${time}`}
                    className={`${buttonPrimary} shrink-0 px-3 py-1`}>
                    Book
                  </Link>
                : <Link href="/sign-in" className={`shrink-0 text-sm ${link}`}>
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

// Shown after a booking, when the booking page sends the customer back here
async function BookedMessage({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const { booked } = await searchParams;
  if (booked !== "1") return null;

  return (
    <p
      role="status"
      className={`rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-medium dark:border-green-900 dark:bg-green-950 ${successText}`}>
      Your booking is confirmed. See you then!
    </p>
  );
}

export default function Home({ searchParams }: PageProps<"/">) {
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
          <BookedMessage searchParams={searchParams} />
          <MyBookings />
          <AvailableTimes />
        </Suspense>
      </div>
    </main>
  );
}
