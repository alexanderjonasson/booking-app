import Link from "next/link";

const links = [
  { href: "/admin", label: "Times" },
  { href: "/admin/services", label: "Services" },
];

// Tabs between the admin pages. aria-current tells screen readers
// which page is open.
export function AdminNav({ current }: { current: "/admin" | "/admin/services" }) {
  return (
    <nav aria-label="Admin" className="mt-4 mb-8 flex gap-2">
      {links.map((link) => {
        const isCurrent = link.href === current;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isCurrent ? "page" : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isCurrent ?
                "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
