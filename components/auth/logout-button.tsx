"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({
  light = false,
  iconOnly = false,
  className,
}: {
  light?: boolean;
  iconOnly?: boolean;
  className?: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action="/api/auth/logout"
      method="post"
      className={iconOnly ? "" : "flex-1"}
      onSubmit={() => setPending(true)}
    >
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending}
        aria-label="Log out"
        className={cn(
          "w-full",
          iconOnly ? "h-8 w-8 px-0" : "h-8 justify-start px-2",
        light
          ? "border border-slate-400 bg-white text-slate-900 hover:bg-slate-200 hover:text-slate-950"
          : "text-slate-200 hover:bg-white/10 hover:text-white",
          className
        )}
      >
        <LogOut className={cn("h-4 w-4", !iconOnly && "mr-2")} />
        {!iconOnly && (pending ? "Signing out…" : "Log out")}
      </Button>
    </form>
  );
}
