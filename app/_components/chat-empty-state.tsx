"use client";

import { RiChatAi3Line } from "@remixicon/react";
import * as Button from "@/components/ui/button";

interface ChatEmptyStateProps {
  onSendMessage?: (message: string) => void;
}

export function ChatEmptyState({ onSendMessage }: ChatEmptyStateProps) {
  const suggestions = [
    "Créer la propal du module A",
    "Réviser une proposition complète sur le projet",
    "Créer deux propositions: module A et module B",
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <RiChatAi3Line className="mb-4 size-16 text-text-soft-400" />
      <p className="mb-6 text-paragraph-md text-text-soft-400">
        Start a conversation with the AI assistant.
      </p>

      <div className="flex flex-col space-y-2">
        {suggestions.map((suggestion, index) => (
          <Button.Root
            key={index}
            variant="primary"
            mode="stroke"
            size="small"
            onClick={() => onSendMessage?.(suggestion)}
          >
            {suggestion}
          </Button.Root>
        ))}
      </div>
    </div>
  );
}
