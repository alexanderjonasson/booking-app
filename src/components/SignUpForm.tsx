"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/app/auth-actions";
import {
  buttonPrimary,
  errorText,
  input,
  label,
  link,
  mutedText,
} from "@/lib/ui";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, null);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className={label}>Name</span>
        <input
          name="name"
          required
          defaultValue={state?.name}
          autoComplete="name"
          className={input}
        />
      </label>
      <label className="block">
        <span className={label}>Email</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={state?.email}
          autoComplete="email"
          className={input}
        />
      </label>
      <label className="block">
        <span className={label}>Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          aria-describedby="password-hint"
          className={input}
        />
        <span id="password-hint" className={`mt-1 block text-xs ${mutedText}`}>
          At least 8 characters
        </span>
      </label>

      {state?.error && (
        <p role="alert" className={errorText}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`${buttonPrimary} w-full`}>
        {pending ? "Creating account..." : "Create account"}
      </button>

      <p className={`text-center text-sm ${mutedText}`}>
        Already have an account?{" "}
        <Link href="/sign-in" className={link}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
