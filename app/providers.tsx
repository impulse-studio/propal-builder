"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/components/ui/sonner";
import { Provider as TooltipProvider } from "@/components/ui/tooltip";
import { createQueryClient } from "@/orpc/query/client";
import { InspxProvider } from "./_components/inspx-wrapper";

const queryClient = createQueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <InspxProvider>
        <ThemeProvider attribute="class">
          <NuqsAdapter>
            <TooltipProvider>{children}</TooltipProvider>
          </NuqsAdapter>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </InspxProvider>
    </QueryClientProvider>
  );
}
