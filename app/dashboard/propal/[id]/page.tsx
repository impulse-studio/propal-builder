import { Suspense } from "react";
import { SlashCommandProvider } from "@/components/custom/proposal-toolbar/slash-command-provider";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { TiptapEditorWithSlashCommands } from "./_components/propal-editor";

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
        <SlashCommandProvider>
          <TiptapEditorWithSlashCommands propalId={id} />
        </SlashCommandProvider>
      </Suspense>
    </HydrateClient>
  );
}
