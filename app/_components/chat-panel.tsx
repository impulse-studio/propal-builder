"use client";

import { useChat } from "@ai-sdk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventIteratorToStream } from "@orpc/client";
import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MarkdownRenderer } from "@/components/ai/message/markdown-renderer";
import { UserMessage } from "@/components/ai/message/user-message";
import { CompactPromptForm } from "@/components/ai/prompt/compact-prompt-form";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai/reasoning";
import { orpcClient } from "@/orpc/client";
import type { ChatUIMessage } from "@/server/routers/chat/validators";

const inputSchema = z.object({
  input: z.string().min(1),
});

type InputSchema = z.infer<typeof inputSchema>;

export function ChatPanel() {
  const sessionIdRef = useRef<string | null>(null);

  const { messages, status, sendMessage, stop } = useChat<ChatUIMessage>({
    transport: {
      async sendMessages(options) {
        return eventIteratorToStream(
          await orpcClient.chat.sendMessage(
            {
              messages: options.messages,
              sessionId: sessionIdRef.current || undefined,
            },
            { signal: options.abortSignal },
          ),
        );
      },
      reconnectToStream() {
        throw new Error("Unsupported");
      },
    },
    onData: (dataPart) => {
      if (dataPart.type === "data-sessionId") {
        const sessionData = dataPart.data as { sessionId: string };
        sessionIdRef.current = sessionData.sessionId;
      }
    },
  });

  const { setValue, getValues } = useForm<InputSchema>({
    resolver: zodResolver(inputSchema),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  // biome-ignore lint/correctness/useExhaustiveDependencies: hackaton
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = useCallback(
    (content: string) => {
      setValue("input", content);
    },
    [setValue],
  );

  const handleSubmit = useCallback(() => {
    const values = getValues();
    const trimmed = values.input?.trim();

    if (!trimmed || isLoading) {
      return;
    }

    sendMessage({
      role: "user",
      parts: [{ type: "text", text: trimmed }],
    });
  }, [getValues, isLoading, sendMessage]);

  const getMessageText = (message: ChatUIMessage): string => {
    return message.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text",
      )
      .map((part) => part.text)
      .join("");
  };

  const getReasoningParts = (message: ChatUIMessage) => {
    return message.parts.filter(
      (
        part,
      ): part is {
        type: "reasoning";
        text: string;
        state?: "streaming" | "done";
      } => part.type === "reasoning",
    );
  };

  const getReasoningTitle = (text: string): string => {
    const lines = text.trim().split("\n");
    const firstLine = lines[0]?.trim() || "";
    if (firstLine.length > 0) {
      const cleanedTitle = firstLine.replace(/\*\*/g, "");
      return cleanedTitle.length > 60
        ? `${cleanedTitle.slice(0, 60)}...`
        : cleanedTitle;
    }
    return "";
  };

  return (
    <div className="flex h-full flex-col bg-bg-white-0">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-paragraph-md text-text-soft-400">
                Start a conversation with the AI assistant.
              </p>
            </div>
          )}
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const isTyping =
              isLoading && isLastMessage && message.role === "assistant";

            if (message.role === "user") {
              return (
                <div key={message.id} className="w-full">
                  <UserMessage message={message} />
                </div>
              );
            }

            if (message.role === "assistant") {
              const text = getMessageText(message);
              const reasoningParts = getReasoningParts(message);
              const hasReasoning = reasoningParts.length > 0;
              const lastReasoning = reasoningParts[reasoningParts.length - 1];
              const isReasoningStreaming =
                hasReasoning &&
                isTyping &&
                lastReasoning?.state === "streaming";

              const lastReasoningTitle =
                isReasoningStreaming && lastReasoning
                  ? getReasoningTitle(lastReasoning.text)
                  : undefined;

              return (
                <div key={message.id} className="w-full space-y-3">
                  {isTyping && !hasReasoning && !text && (
                    <Reasoning
                      isStreaming={true}
                      collapsible={false}
                      defaultOpen={false}
                    >
                      <ReasoningTrigger />
                      <ReasoningContent>{""}</ReasoningContent>
                    </Reasoning>
                  )}
                  {reasoningParts.map((reasoning, idx) => {
                    const isLastReasoning = idx === reasoningParts.length - 1;
                    const isStreaming = isReasoningStreaming && isLastReasoning;

                    return (
                      <Reasoning
                        key={`reasoning-${idx}`}
                        isStreaming={isStreaming}
                        defaultOpen={false}
                        title={isLastReasoning ? lastReasoningTitle : undefined}
                      >
                        <ReasoningTrigger />
                        <ReasoningContent>
                          <MarkdownRenderer typing={isStreaming} size="sm">
                            {reasoning.text}
                          </MarkdownRenderer>
                        </ReasoningContent>
                      </Reasoning>
                    );
                  })}
                  {text && (
                    <MarkdownRenderer typing={isTyping && !hasReasoning}>
                      {text}
                    </MarkdownRenderer>
                  )}
                </div>
              );
            }

            return null;
          })}
          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1]?.role !== "assistant" && (
              <div className="w-full">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-text-soft-400 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-text-soft-400 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-text-soft-400" />
                </div>
              </div>
            )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t border-stroke-soft-200 p-4">
        <CompactPromptForm
          autoFocus
          isDisabled={false}
          isError={false}
          isLoading={isLoading}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          placeholder="Type your message..."
          stop={stop}
        />
      </div>
    </div>
  );
}
