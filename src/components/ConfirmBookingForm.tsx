"use client";

import { useActionState } from "react";
import Link from "next/link";
import { bookTimeSlot } from "@/app/booking-actions";
import { maxNoteLength } from "@/lib/bookings";
import {
  buttonPrimary,
  buttonSecondary,
  errorText,
  input,
  label,
  mutedText,
} from "@/lib/ui";

export function ConfirmBookingForm({ timeSlotId }: { timeSlotId: number }) {
  const [state, formAction, pending] = useActionState(bookTimeSlot, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="timeSlotId" value={timeSlotId} />

      <label className="block">
        <span className={label}>
          Message <span className={`font-normal ${mutedText}`}>(optional)</span>
        </span>
        <textarea
          name="note"
          rows={4}
          maxLength={maxNoteLength}
          placeholder="Anything we should know before we meet?"
          defaultValue={state?.note}
          aria-describedby="note-hint"
          className={input}
        />
        <span id="note-hint" className={`mt-1 block text-xs ${mutedText}`}>
          At most {maxNoteLength} characters
        </span>
      </label>

      {state?.error && (
        <p role="alert" className={errorText}>
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? "Booking..." : "Confirm booking"}
        </button>
        <Link href="/" className={buttonSecondary}>
          Back
        </Link>
      </div>
    </form>
  );
}
