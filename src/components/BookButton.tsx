"use client";

import { useActionState } from "react";
import { bookTimeSlot } from "@/app/booking-actions";

export function BookButton({ timeSlotId }: { timeSlotId: number }) {
  const [state, formAction, pending] = useActionState(bookTimeSlot, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="timeSlotId" value={timeSlotId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
        {pending ? "Booking..." : "Book"}
      </button>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
