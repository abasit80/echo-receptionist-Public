"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const EchoCoreCanvas = dynamic(
  () => import("@/components/effects/echo-core-scene").then((mod) => mod.EchoCoreCanvas),
  {
    ssr: false,
    loading: () => <div className="h-full w-full rounded-2xl bg-forest-900" />,
  }
);

export function EchoCore3D({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("pointer-events-none relative overflow-hidden", compact ? "rounded-2xl" : "rounded-[2rem]", className)}>
      <EchoCoreCanvas compact={compact} />
    </div>
  );
}
