import Link from "next/link";
import { EchoCore3D } from "@/components/effects/echo-core-3d";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-forest">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3" aria-label="EchoReceptionist home">
          <EchoCore3D compact className="h-11 w-11" />
          <span className="text-sm font-semibold tracking-tight text-white">EchoReceptionist</span>
        </Link>
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          Back to home
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-8">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-panel">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
