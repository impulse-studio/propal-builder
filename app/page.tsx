import { ResizableLayout } from "@/components/custom/resizable-layout";
import Header from "@/components/header";

export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-bg-weak-50">
      <Header />
      <main className="flex-1 overflow-hidden">
        <ResizableLayout
          leftPanel={
            <div className="flex h-full items-center justify-center bg-bg-white-0">
              <p className="text-paragraph-md text-text-soft-400">
                Voilà. Ici il y aura un tip tap éditor.
              </p>
            </div>
          }
          rightPanel={
            <div className="flex h-full items-center justify-center bg-bg-white-0">
              <p className="text-paragraph-md text-text-soft-400">
                Ici il y aura un agent avec un chat.
              </p>
            </div>
          }
        />
      </main>
    </div>
  );
}
