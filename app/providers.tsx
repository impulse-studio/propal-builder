import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/components/ui/sonner";
import { Provider as TooltipProvider } from "@/components/ui/tooltip";
import { InspxProvider } from "./_components/inspx-wrapper";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <InspxProvider>
      <ThemeProvider attribute="class">
        <NuqsAdapter>
          <TooltipProvider>{children}</TooltipProvider>
        </NuqsAdapter>
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </InspxProvider>
  );
}
