"use client";

import { useActionState } from "react";
import { createTimeSlot } from "@/app/admin/actions";
import { buttonPrimary, errorText, input, label, successText } from "@/lib/ui";

export function TimeSlotForm() {
  const [state, formAction, pending] = useActionState(createTimeSlot, null);
  const values = state && "values" in state ? state.values : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className={label}>Date</span>
          <input
            name="date"
            type="date"
            required
            defaultValue={values?.date}
            className={input}
          />
        </label>
        <label className="block">
          <span className={label}>Start</span>
          <input
            name="startTime"
            type="time"
            required
            defaultValue={values?.startTime}
            className={input}
          />
        </label>
        <label className="block">
          <span className={label}>End</span>
          <input
            name="endTime"
            type="time"
            required
            defaultValue={values?.endTime}
            className={input}
          />
        </label>
      </div>

      {state && "error" in state && (
        <p role="alert" className={errorText}>
          {state.error}
        </p>
      )}
      {state && "success" in state && (
        <p role="status" className={successText}>
          The time was added
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "Adding..." : "Add time"}
      </button>
    </form>
  );
}
