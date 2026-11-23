"use client";

import { useActionState } from "react";
import { createTimeSlot } from "@/app/admin/actions";
import { formatDuration } from "@/lib/services";
import { buttonPrimary, errorText, input, label, successText } from "@/lib/ui";

type ServiceOption = { id: number; name: string; durationMinutes: number };

export function TimeSlotForm({ services }: { services: ServiceOption[] }) {
  const [state, formAction, pending] = useActionState(createTimeSlot, null);
  const values = state && "values" in state ? state.values : undefined;

  return (
    // key: after an error the form is recreated, so the select shows the
    // value that was picked (React resets forms to their first defaultValue)
    <form
      key={values ? JSON.stringify(values) : "new"}
      action={formAction}
      className="space-y-4">
      <label className="block">
        <span className={label}>Service</span>
        <select
          name="serviceId"
          required
          defaultValue={values?.serviceId ?? String(services[0]?.id ?? "")}
          className={input}>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({formatDuration(service.durationMinutes)})
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
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
