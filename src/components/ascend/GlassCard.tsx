import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function GlassCard({
  className,
  glow,
  ...props
}: HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-3xl glass p-5 shadow-card",
        glow && "shadow-elegant",
        className,
      )}
      {...props}
    />
  );
}
