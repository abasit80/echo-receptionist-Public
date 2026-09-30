"use client";

import Link from "next/link";
import { EchoCore3D } from "@/components/effects/echo-core-3d";
import { cn } from "@/lib/utils";

export function BrandLogo({
  href = "/",
  inverted = false,
  iconOnly = false,
  stacked = false,
  size = "md",
  subtitle,
  className,
}: {
  href?: string | null;
  inverted?: boolean;
  iconOnly?: boolean;
  stacked?: boolean;
  size?: "sm" | "md" | "lg";
  subtitle?: string;
  className?: string;
}) {
  const icon = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }[size];
  const word = {
    sm: "text-[15px]",
    md: "text-base",
    lg: "text-xl",
  }[size];

  const mark = (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-[18px] shadow-lg shadow-gold/30",
        icon
      )}
    >
      <EchoCore3D compact className="h-full w-full" />
    </span>
  );

  const wordmark = !iconOnly && (
    <span className={cn("min-w-0 leading-tight", stacked ? "block" : "")}>
      <span className={cn("block font-semibold tracking-tight", word)}>
        <span
          className={cn(
            "bg-clip-text text-transparent",
            inverted
              ? "bg-gradient-to-r from-white via-amber-100 to-gold-400"
              : "bg-gradient-to-r from-forest-900 via-forest-700 to-gold-700"
          )}
        >
          Echo
        </span>
        <span className={cn(inverted ? "text-slate-200" : "text-slate-800")}>
          Receptionist
        </span>
      </span>
      {subtitle && (
        <span
          className={cn(
            "mt-0.5 block text-[11px] font-medium tracking-[0.14em]",
            inverted ? "text-slate-400" : "text-slate-600"
          )}
        >
          {subtitle}
        </span>
      )}
    </span>
  );

  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        iconOnly && "justify-center",
        className
      )}
    >
      {mark}
      {wordmark}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center no-underline" aria-label="EchoReceptionist">
      {content}
    </Link>
  );
}
