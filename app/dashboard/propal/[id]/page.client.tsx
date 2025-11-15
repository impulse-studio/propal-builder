"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ChatPanel } from "@/app/_components/chat-panel";
import { EditorStoreProvider } from "@/app/_components/editor-store";
import { ProposalEditor } from "@/app/_components/proposal-editor";
import { ResizableLayout } from "@/components/custom/resizable-layout";
import Header from "@/components/header";
import { orpc } from "@/orpc/client";

export function PropalPageClient({ propalId }: { propalId: string }) {
  const { data: propal } = useSuspenseQuery(
    orpc.propal.getPropal.queryOptions({ input: { id: propalId } }),
  );

  return (
    <EditorStoreProvider>
      <div className="flex h-screen flex-col bg-bg-weak-50">
        <Header />
        <main className="flex-1 overflow-hidden">
          <ResizableLayout
            leftPanel={<ProposalEditor content={propal.contenuJson} />}
            rightPanel={<ChatPanel />}
          />
        </main>
      </div>
    </EditorStoreProvider>
  );
}
