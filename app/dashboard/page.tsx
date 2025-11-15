import { Suspense } from "react";
import Header from "@/components/header";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { DashboardTable } from "./_components/dashboard-table.client";

export default async function DashboardPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(orpc.propal.getPropals.queryOptions());

  return (
    <div className="flex h-screen flex-col bg-bg-weak-50">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-8">
          <HydrateClient client={queryClient}>
            <Suspense fallback={<div>Loading propals...</div>}>
              <DashboardTable />
            </Suspense>
          </HydrateClient>
        </div>
      </main>
    </div>
  );
}
