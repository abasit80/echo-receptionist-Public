import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage calls, leads, and your Echo receptionist."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
