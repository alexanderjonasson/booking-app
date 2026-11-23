import { Suspense } from "react";
import { requireAdmin } from "@/lib/dal";

async function AdminContent() {
  const session = await requireAdmin();

  return (
    <p className="text-gray-600">
      Welcome, {session.user.name}. Here you will manage the available times.
    </p>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Admin</h1>
      <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}
