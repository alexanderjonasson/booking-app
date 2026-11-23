import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/services";
import { AdminNav } from "@/components/AdminNav";
import { ServiceForm } from "@/components/ServiceForm";
import { buttonDanger, card, mutedText } from "@/lib/ui";
import { removeService } from "./actions";

async function ServicesContent() {
  await connection();
  await requireAdmin();

  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <section aria-labelledby="add-service" className={card}>
        <h2 id="add-service" className="text-lg font-semibold">
          Add a service
        </h2>
        <p className={`mt-1 mb-4 text-sm ${mutedText}`}>
          A service is what customers book. Its length decides how long each
          time is.
        </p>
        <ServiceForm />
      </section>

      <section aria-labelledby="services" className={card}>
        <h2 id="services" className="mb-4 text-lg font-semibold">
          Services
        </h2>
        {services.length === 0 ?
          <p className={mutedText}>
            No services yet. Add one before you add times.
          </p>
        : <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {services.map((service) => (
              <li
                key={service.id}
                className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    {service.name}{" "}
                    <span
                      className={`ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-800 ${mutedText}`}>
                      {formatDuration(service.durationMinutes)}
                    </span>
                  </p>
                  {service.description && (
                    <p className={`mt-1 text-sm ${mutedText}`}>
                      {service.description}
                    </p>
                  )}
                </div>
                <form action={removeService}>
                  <input type="hidden" name="id" value={service.id} />
                  <button
                    type="submit"
                    aria-label={`Remove ${service.name}`}
                    className={buttonDanger}>
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        }
      </section>
    </div>
  );
}

export default function AdminServicesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Admin</h1>
      <AdminNav current="/admin/services" />
      <Suspense fallback={<p className={mutedText}>Loading...</p>}>
        <ServicesContent />
      </Suspense>
    </main>
  );
}
