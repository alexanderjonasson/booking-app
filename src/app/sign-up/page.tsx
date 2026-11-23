import { SignUpForm } from "@/components/SignUpForm";

export default function SignUpPage() {
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Create account</h1>
      <SignUpForm />
    </main>
  );
}
