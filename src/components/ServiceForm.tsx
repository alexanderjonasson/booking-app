"use client";

import { useActionState } from "react";
import { createService } from "@/app/admin/services/actions";
import { durationOptions, formatDuration } from "@/lib/services";
import {
  buttonPrimary,
  errorText,
  input,
  label,
  mutedText,
  successText,
} from "@/lib/ui";

export function ServiceForm() {
  const [state, formAction, pending] = useActionState(createService, null);
  const values = state && "values" in state ? state.values : undefined;

  return (
    // key: after an error the form is recreated, so the select shows the
    // value that was picked (React resets forms to their first defaultValue)
    <form
      key={values ? JSON.stringify(values) : "new"}
      action={formAction}
      className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <label className="block">
          <span className={label}>Name</span>
          <input
            name="name"
            required
            maxLength={60}
            placeholder="e.g. Consultation"
            defaultValue={values?.name}
            className={input}
          />
        </label>
        <label className="block">
          <span className={label}>Length</span>
          <select
            name="durationMinutes"
            required
            defaultValue={values?.durationMinutes ?? "30"}
            className={input}>
            {durationOptions.map((minutes) => (
              <option key={minutes} value={minutes}>
                {formatDuration(minutes)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className={label}>
          Description <span className={`font-normal ${mutedText}`}>(optional)</span>
        </span>
        <textarea
          name="description"
          rows={2}
          maxLength={200}
          placeholder="What does the customer get?"
          defaultValue={values?.description}
          className={input}
        />
      </label>

      {state && "error" in state && (
        <p role="alert" className={errorText}>
          {state.error}
        </p>
      )}
      {state && "success" in state && (
        <p role="status" className={successText}>
          The service was added
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "Adding..." : "Add service"}
      </button>
    </form>
  );
}
