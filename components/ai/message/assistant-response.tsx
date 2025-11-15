"use client";

import { memo } from "react";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "../reasoning";
import { MarkdownRenderer } from "./markdown-renderer";

interface AssistantResponseProps {
  text: string;
  isTyping: boolean;
  hasReasoning: boolean;
}

export const AssistantResponse = memo(
  ({ text, isTyping, hasReasoning }: AssistantResponseProps) => {
    return (
      <Reasoning
        isStreaming={isTyping && !hasReasoning}
        collapsible={false}
        defaultOpen={true}
      >
        <ReasoningTrigger />
        <ReasoningContent className="text-paragraph-md text-text-strong-950">
          <MarkdownRenderer typing={isTyping && !hasReasoning}>
            {text}
          </MarkdownRenderer>
        </ReasoningContent>
      </Reasoning>
    );
  },
);

AssistantResponse.displayName = "AssistantResponse";
