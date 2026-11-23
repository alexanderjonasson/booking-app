import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOut } from "./auth-actions";

async function CurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <div className="flex gap-3">
        <Link
          href="/sign-in"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Create account
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p>
        Signed in as <strong>{session.user.name}</strong> ({session.user.role})
      </p>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
          Sign out
        </button>
      </form>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Slotly</h1>
      <p className="mb-8 text-gray-600">Book a time that suits you.</p>
      <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
        <CurrentUser />
      </Suspense>
    </main>
  );
}
