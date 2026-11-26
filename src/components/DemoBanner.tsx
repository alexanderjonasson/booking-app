// Shown on the live demo only (DEMO_MODE=true), so visitors know how to sign in
export function DemoBanner() {
  if (process.env.DEMO_MODE !== "true") return null;

  return (
    <aside
      aria-label="Demo"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
      <strong>This is a demo.</strong> Sign in as{" "}
      <code className="font-mono font-semibold">admin@example.com</code> or{" "}
      <code className="font-mono font-semibold">customer@example.com</code> with
      the password <code className="font-mono font-semibold">demo-password</code>
      . All data resets every night.
    </aside>
  );
}
