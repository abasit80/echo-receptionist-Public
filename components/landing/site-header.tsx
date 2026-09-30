"use client";

import Link from "next/link";
import { EchoCore3D } from "@/components/effects/echo-core-3d";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#features", label: "AI Stack" },
  { href: "/#industries", label: "Industries" },
  { href: "/#automation", label: "Automation" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/demo", label: "Live Demo" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-forest/80 backdrop-blur-2xl">
      <div
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-gold-500/70 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="group flex items-center gap-3" aria-label="EchoReceptionist home">
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(212,160,23,0.35)] transition-transform duration-500 group-hover:[transform:rotateY(16deg)_rotateX(-10deg)_scale(1.08)] [transform-style:preserve-3d]">
            <EchoCore3D compact className="h-12 w-12" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-white via-amber-100 to-gold-400 bg-clip-text text-transparent">
                Echo
              </span>
              <span className="text-slate-100">Receptionist</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-gold-400">
              AI Voice OS
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition",
                "hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden text-slate-200 hover:bg-white/10 hover:text-white sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild className="bg-gold text-forest-900 shadow-lg shadow-gold/20 hover:bg-gold-400">
            <Link href="/signup">Launch Console</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
