import { Suspense } from "react";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { PropalPageClient } from "./page.client";

export default async function PropalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    orpc.propal.getPropal.queryOptions({ input: { id } }),
  );

  return (
    <HydrateClient client={queryClient}>
      <Suspense fallback={<div>Loading propal...</div>}>
        <PropalPageClient propalId={id} />
      </Suspense>
    </HydrateClient>
  );
}
