import { SignInForm } from "@/components/SignInForm";

export default function SignInPage() {
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Sign in</h1>
      <SignInForm />
    </main>
  );
}
