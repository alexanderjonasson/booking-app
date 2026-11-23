"use client";

import { useActionState } from "react";
import { bookTimeSlot } from "@/app/booking-actions";
import { buttonPrimary, errorText } from "@/lib/ui";

type BookButtonProps = {
  timeSlotId: number;
  // Used in the label, so a screen reader says which time the button books
  time: string;
};

export function BookButton({ timeSlotId, time }: BookButtonProps) {
  const [state, formAction, pending] = useActionState(bookTimeSlot, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="timeSlotId" value={timeSlotId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={`Book ${time}`}
        className={`${buttonPrimary} px-3 py-1`}>
        {pending ? "Booking..." : "Book"}
      </button>
      {state?.error && (
        <p role="alert" className={errorText}>
          {state.error}
        </p>
      )}
    </form>
  );
}
