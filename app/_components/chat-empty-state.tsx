"use client";

import { RiChatAi3Line } from "@remixicon/react";

export function ChatEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <RiChatAi3Line className="mb-4 size-16 text-text-soft-400" />
      <p className="text-paragraph-md text-text-soft-400">
        Start a conversation with the AI assistant.
      </p>
    </div>
  );
}
