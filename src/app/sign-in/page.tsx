import { SignInForm } from "@/components/SignInForm";
import { card, mutedText } from "@/lib/ui";

export default function SignInPage() {
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-12">
      <div className={card}>
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className={`mt-1 mb-6 text-sm ${mutedText}`}>
          Welcome back! Sign in to book a time.
        </p>
        <SignInForm />
      </div>
    </main>
  );
}
