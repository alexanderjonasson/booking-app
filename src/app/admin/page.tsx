import { Suspense } from "react";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { TimeSlotForm } from "@/components/TimeSlotForm";
import { deleteTimeSlot } from "./actions";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

async function AdminContent() {
  const session = await requireAdmin();

  // Only upcoming times are shown
  const timeSlots = await prisma.timeSlot.findMany({
    where: { startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
  });

  return (
    <>
      <p className="mb-8 text-gray-600">Welcome, {session.user.name}.</p>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Add an available time</h2>
        <TimeSlotForm />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Upcoming times ({timeSlots.length})
        </h2>

        {timeSlots.length === 0 ?
          <p className="text-gray-500">No upcoming times yet.</p>
        : <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
            {timeSlots.map((slot) => (
              <li
                key={slot.id}
                className="flex items-center justify-between gap-4 px-4 py-3">
                <span>
                  <span className="font-medium">
                    {dateFormat.format(slot.startsAt)}
                  </span>{" "}
                  {timeFormat.format(slot.startsAt)}–
                  {timeFormat.format(slot.endsAt)}
                </span>
                <form action={deleteTimeSlot}>
                  <input type="hidden" name="id" value={slot.id} />
                  <button
                    type="submit"
                    className="rounded-lg px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        }
      </section>
    </>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Admin</h1>
      <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}
