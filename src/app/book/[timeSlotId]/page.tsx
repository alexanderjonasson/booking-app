import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatTimeSlot } from "@/lib/format";
import { formatDuration } from "@/lib/services";
import { ConfirmBookingForm } from "@/components/ConfirmBookingForm";
import { card, link, mutedText } from "@/lib/ui";

async function BookingContent({
  params,
}: {
  params: PageProps<"/book/[timeSlotId]">["params"];
}) {
  await connection();
  await requireUser();

  const { timeSlotId } = await params;
  const id = Number(timeSlotId);

  // Only a time that is still free, in the future and for an offered
  // service can be booked
  const timeSlot =
    Number.isInteger(id) ?
      await prisma.timeSlot.findFirst({
        where: {
          id,
          startsAt: { gt: new Date() },
          booking: { is: null },
          service: { isActive: true },
        },
        include: { service: true },
      })
    : null;

  if (!timeSlot) {
    return (
      <div className={card}>
        <h1 className="text-2xl font-bold tracking-tight">
          This time is no longer available
        </h1>
        <p className={`mt-2 ${mutedText}`}>
          Someone may have booked it, or it has been removed.{" "}
          <Link href="/" className={link}>
            See the available times
          </Link>
        </p>
      </div>
    );
  }

  const { service } = timeSlot;

  return (
    <div className={card}>
      <p className={`text-sm font-medium ${mutedText}`}>Confirm your booking</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">{service.name}</h1>

      <dl className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2 dark:bg-gray-950">
        <div>
          <dt className={mutedText}>When</dt>
          <dd className="font-medium">
            {formatTimeSlot(timeSlot.startsAt, timeSlot.endsAt)}
          </dd>
        </div>
        <div>
          <dt className={mutedText}>Length</dt>
          <dd className="font-medium">
            {formatDuration(service.durationMinutes)}
          </dd>
        </div>
        {service.description && (
          <div className="sm:col-span-2">
            <dt className={mutedText}>About</dt>
            <dd>{service.description}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6">
        <ConfirmBookingForm timeSlotId={timeSlot.id} />
      </div>
    </div>
  );
}

export default function BookPage({ params }: PageProps<"/book/[timeSlotId]">) {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      {/* params is only known when the page is requested, so it is read
          inside Suspense */}
      <Suspense fallback={<p className={mutedText}>Loading...</p>}>
        <BookingContent params={params} />
      </Suspense>
    </main>
  );
}
