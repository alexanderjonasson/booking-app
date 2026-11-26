import Link from "next/link";
import { getSession } from "@/lib/dal";
import { signOut } from "@/app/auth-actions";
import { buttonPrimary, buttonSecondary, mutedText } from "@/lib/ui";

export async function Header() {
  const session = await getSession();

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="rounded text-xl font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          Bookwell
        </Link>

        <nav aria-label="Main" className="flex items-center gap-3">
          {session ?
            <>
              <span className={`hidden text-sm sm:inline ${mutedText}`}>
                {session.user.name}
              </span>
              {session.user.role === "admin" && (
                <Link href="/admin" className={buttonSecondary}>
                  Admin
                </Link>
              )}
              <form action={signOut}>
                <button type="submit" className={buttonSecondary}>
                  Sign out
                </button>
              </form>
            </>
          : <>
              <Link href="/sign-in" className={buttonSecondary}>
                Sign in
              </Link>
              <Link href="/sign-up" className={buttonPrimary}>
                Create account
              </Link>
            </>
          }
        </nav>
      </div>
    </header>
  );
}
