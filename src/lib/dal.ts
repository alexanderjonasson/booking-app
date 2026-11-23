// Data Access Layer: every check of who is signed in goes through here,
// so the rules live in one place and always run on the server.
import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

// cache() makes sure the session is only looked up once per page render
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function requireUser() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return session;
}
