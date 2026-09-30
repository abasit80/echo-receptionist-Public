import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Sign up to access Mission Control, call logs, and your AI receptionist."
    >
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
