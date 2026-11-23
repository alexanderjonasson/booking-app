import { SignUpForm } from "@/components/SignUpForm";
import { card, mutedText } from "@/lib/ui";

export default function SignUpPage() {
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-12">
      <div className={card}>
        <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
        <p className={`mt-1 mb-6 text-sm ${mutedText}`}>
          It only takes a minute.
        </p>
        <SignUpForm />
      </div>
    </main>
  );
}
