"use client";

import { useActionState } from "react";
import { createTimeSlot } from "@/app/admin/actions";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export function TimeSlotForm() {
  const [state, formAction, pending] = useActionState(createTimeSlot, null);
  const values = state && "values" in state ? state.values : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Date</span>
          <input
            name="date"
            type="date"
            required
            defaultValue={values?.date}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Start</span>
          <input
            name="startTime"
            type="time"
            required
            defaultValue={values?.startTime}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">End</span>
          <input
            name="endTime"
            type="time"
            required
            defaultValue={values?.endTime}
            className={inputClass}
          />
        </label>
      </div>

      {state && "error" in state && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state && "success" in state && (
        <p role="status" className="text-sm text-green-600">
          The time was added
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
        {pending ? "Adding..." : "Add time"}
      </button>
    </form>
  );
}
