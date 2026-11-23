"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/app/auth-actions";
import {
  buttonPrimary,
  errorText,
  input,
  label,
  link,
  mutedText,
} from "@/lib/ui";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <form action={formAction} className="space-y-4">
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
          autoComplete="current-password"
          className={input}
        />
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
        {pending ? "Signing in..." : "Sign in"}
      </button>

      <p className={`text-center text-sm ${mutedText}`}>
        No account yet?{" "}
        <Link href="/sign-up" className={link}>
          Create one
        </Link>
      </p>
    </form>
  );
}
