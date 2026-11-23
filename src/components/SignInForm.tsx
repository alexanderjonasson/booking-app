"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/app/auth-actions";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={state?.email}
          autoComplete="email"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
        {pending ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-gray-600">
        No account yet?{" "}
        <Link href="/sign-up" className="font-medium text-blue-600 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
