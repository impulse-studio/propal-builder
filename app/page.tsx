import { ResizableLayout } from "@/components/custom/resizable-layout";
import Header from "@/components/header";
import { ChatPanel } from "./_components/chat-panel";
import { EditorStoreProvider } from "./_components/editor-store";
import { ProposalEditor } from "./_components/proposal-editor";

export default function Home() {
  return (
    <EditorStoreProvider>
      <div className="flex h-screen flex-col bg-bg-weak-50">
        <Header />
        <main className="flex-1 overflow-hidden">
          <ResizableLayout
            leftPanel={<ProposalEditor />}
            rightPanel={<ChatPanel />}
          />
        </main>
      </div>
    </EditorStoreProvider>
  );
}
