import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatTimeSlot } from "@/lib/format";
import { AdminNav } from "@/components/AdminNav";
import { TimeSlotForm } from "@/components/TimeSlotForm";
import { buttonDanger, card, link, mutedText } from "@/lib/ui";
import { deleteTimeSlot } from "./actions";

async function AdminContent() {
  await connection();
  const session = await requireAdmin();

  const [services, timeSlots] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, name: true, durationMinutes: true },
      orderBy: { name: "asc" },
    }),
    // Only upcoming times are shown, with their service and who booked them
    prisma.timeSlot.findMany({
      where: { startsAt: { gte: new Date() } },
      include: {
        service: { select: { name: true, isActive: true } },
        booking: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { startsAt: "asc" },
    }),
  ]);

  const bookedCount = timeSlots.filter((slot) => slot.booking).length;

  return (
    <>
      <p className={`mb-6 ${mutedText}`}>
        Welcome, {session.user.name}. {bookedCount} of {timeSlots.length}{" "}
        upcoming times are booked.
      </p>

      <div className="space-y-6">
        <section aria-labelledby="add-time" className={card}>
          <h2 id="add-time" className="text-lg font-semibold">
            Add an available time
          </h2>
          <p className={`mt-1 mb-4 text-sm ${mutedText}`}>
            The end time is set by the length of the service.
          </p>
          {services.length === 0 ?
            <p>
              You need a service first.{" "}
              <Link href="/admin/services" className={link}>
                Add a service
              </Link>
            </p>
          : <TimeSlotForm services={services} />}
        </section>

        <section aria-labelledby="upcoming-times" className={card}>
          <h2 id="upcoming-times" className="mb-4 text-lg font-semibold">
            Upcoming times
          </h2>

          {timeSlots.length === 0 ?
            <p className={mutedText}>No upcoming times yet.</p>
          : <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {timeSlots.map((slot) => {
                const time = formatTimeSlot(slot.startsAt, slot.endsAt);
                return (
                  <li
                    key={slot.id}
                    className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {slot.service.name}
                        {!slot.service.isActive && " (removed service)"}
                      </p>
                      <p className={`text-sm ${mutedText}`}>{time}</p>
                      <p className={`text-sm ${mutedText}`}>
                        {slot.booking ?
                          `Booked by ${slot.booking.user.name} (${slot.booking.user.email})`
                        : "Available"}
                      </p>
                      {slot.booking?.note && (
                        <p className="mt-1 text-sm">
                          Message: {slot.booking.note}
                        </p>
                      )}
                    </div>
                    <form action={deleteTimeSlot}>
                      <input type="hidden" name="id" value={slot.id} />
                      <button
                        type="submit"
                        aria-label={`Delete ${slot.service.name} ${time}`}
                        className={buttonDanger}>
                        Delete
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          }
        </section>
      </div>
    </>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Admin</h1>
      <AdminNav current="/admin" />
      <Suspense fallback={<p className={`mt-2 ${mutedText}`}>Loading...</p>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}
