import { Suspense } from "react";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { DashboardTable } from "./_components/dashboard-table.client";

export default async function DashboardPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(orpc.propal.getPropals.queryOptions());

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Propals</h1>
      <HydrateClient client={queryClient}>
        <Suspense fallback={<div>Loading propals...</div>}>
          <DashboardTable />
        </Suspense>
      </HydrateClient>
    </div>
  );
}
