import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatTimeSlot } from "@/lib/format";
import { BookButton } from "@/components/BookButton";
import { signOut } from "./auth-actions";
import { cancelBooking } from "./booking-actions";

async function CurrentUser() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex gap-3">
        <Link
          href="/sign-in"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Create account
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p>
        Signed in as <strong>{session.user.name}</strong> ({session.user.role})
      </p>
      <div className="flex gap-3">
        {session.user.role === "admin" && (
          <Link
            href="/admin"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Admin
          </Link>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

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
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-semibold">Your bookings</h2>
      {bookings.length === 0 ?
        <p className="text-gray-500">You have no upcoming bookings.</p>
      : <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="flex items-center justify-between gap-4 px-4 py-3">
              <span>
                {formatTimeSlot(
                  booking.timeSlot.startsAt,
                  booking.timeSlot.endsAt,
                )}
              </span>
              <form action={cancelBooking}>
                <input type="hidden" name="id" value={booking.id} />
                <button
                  type="submit"
                  className="rounded-lg px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50">
                  Cancel
                </button>
              </form>
            </li>
          ))}
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
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-semibold">Available times</h2>
      {timeSlots.length === 0 ?
        <p className="text-gray-500">There are no available times right now.</p>
      : <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
          {timeSlots.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center justify-between gap-4 px-4 py-3">
              <span>{formatTimeSlot(slot.startsAt, slot.endsAt)}</span>
              {session ?
                <BookButton timeSlotId={slot.id} />
              : <Link
                  href="/sign-in"
                  className="text-sm font-medium text-blue-600 hover:underline">
                  Sign in to book
                </Link>
              }
            </li>
          ))}
        </ul>
      }
    </section>
  );
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Slotly</h1>
      <p className="mb-8 text-gray-600">Book a time that suits you.</p>
      <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
        <CurrentUser />
        <MyBookings />
        <AvailableTimes />
      </Suspense>
    </main>
  );
}
