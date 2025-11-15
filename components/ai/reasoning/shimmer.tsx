"use client";

import { cn } from "@/lib/utils/cn";

interface ShimmerProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

export function Shimmer({ children, duration = 1.5, className }: ShimmerProps) {
  return (
    <span
      className={cn("inline-block animate-pulse", className)}
      style={{
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </span>
  );
}
