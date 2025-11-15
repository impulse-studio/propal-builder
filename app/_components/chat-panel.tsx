"use client";

import { useChat } from "@ai-sdk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventIteratorToStream } from "@orpc/client";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
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
import type { ChatUIMessage } from "@/server/routers/chat/types";
import { ChatEmptyState } from "./chat-empty-state";
import { useEditorStore } from "./editor-store";
import { ToolCallDisplay } from "./tool-call-display";

const inputSchema = z.object({
  input: z.string().min(1),
});

type InputSchema = z.infer<typeof inputSchema>;

export function ChatPanel() {
  const sessionIdRef = useRef<string | null>(null);
  const {
    getContent,
    getJSON,
    findAndReplace,
    insertAtPosition,
    replaceSection,
    replaceContent,
    deleteText,
    insertPricingCard,
    insertFeatureList,
    insertCallToAction,
    updateBlock,
    deleteBlock,
    getBlock,
    getAllBlocks,
  } = useEditorStore();

  const { messages, status, sendMessage, stop, addToolOutput } =
    useChat<ChatUIMessage>({
      transport: {
        async sendMessages(options) {
          const documentContent = getContent();
          return eventIteratorToStream(
            await orpcClient.chat.sendMessage(
              {
                messages: options.messages,
                sessionId: sessionIdRef.current || undefined,
                documentContent: documentContent || undefined,
              },
              { signal: options.abortSignal },
            ),
          );
        },
        reconnectToStream() {
          throw new Error("Unsupported");
        },
      },
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      async onToolCall({ toolCall }) {
        // Check if it's a dynamic tool first for proper type narrowing
        if (toolCall.dynamic) {
          return;
        }

        // Execute client-side tools immediately
        switch (toolCall.toolName) {
          case "findAndReplace": {
            const { searchText, replaceWith, replaceAll } = toolCall.input;
            findAndReplace(searchText, replaceWith, replaceAll);
            addToolOutput({
              tool: "findAndReplace",
              toolCallId: toolCall.toolCallId,
              output: undefined,
            });
            break;
          }
          case "insertAtPosition": {
            const { position, content, anchorText } = toolCall.input;
            insertAtPosition(position, content, anchorText);
            addToolOutput({
              tool: "insertAtPosition",
              toolCallId: toolCall.toolCallId,
              output: undefined,
            });
            break;
          }
          case "replaceSection": {
            const { startText, endText, newContent } = toolCall.input;
            replaceSection(startText, endText, newContent);
            addToolOutput({
              tool: "replaceSection",
              toolCallId: toolCall.toolCallId,
              output: undefined,
            });
            break;
          }
          case "setDocumentContent": {
            const { content } = toolCall.input;
            replaceContent(content);
            addToolOutput({
              tool: "setDocumentContent",
              toolCallId: toolCall.toolCallId,
              output: undefined,
            });
            break;
          }
          case "deleteText": {
            const { textToDelete, deleteAll } = toolCall.input;
            deleteText(textToDelete, deleteAll);
            addToolOutput({
              tool: "deleteText",
              toolCallId: toolCall.toolCallId,
              output: undefined,
            });
            break;
          }
          case "getDocumentContent": {
            const content = getJSON();
            addToolOutput({
              tool: "getDocumentContent",
              toolCallId: toolCall.toolCallId,
              output: content || {},
            });
            break;
          }
          case "insertPricingCard": {
            const { title, price, period, features, highlighted } =
              toolCall.input;
            await insertPricingCard({
              title,
              price,
              period,
              features,
              highlighted,
            });
            addToolOutput({
              tool: "insertPricingCard",
              toolCallId: toolCall.toolCallId,
              output: undefined,
            });
            break;
          }
          case "insertFeatureList": {
            const { title, features } = toolCall.input;
            await insertFeatureList({
              title,
              features,
            });
            addToolOutput({
              tool: "insertFeatureList",
              toolCallId: toolCall.toolCallId,
              output: undefined,
            });
            break;
          }
          case "insertCallToAction": {
            const { title, description, buttonText, buttonLink } =
              toolCall.input;
            await insertCallToAction({
              title,
              description,
              buttonText,
              buttonLink,
            });
            addToolOutput({
              tool: "insertCallToAction",
              toolCallId: toolCall.toolCallId,
              output: undefined,
            });
            break;
          }
          case "updateBlock": {
            const { nodeIndex, attrs } = toolCall.input;
            updateBlock(nodeIndex, attrs);
            addToolOutput({
              tool: "updateBlock",
              toolCallId: toolCall.toolCallId,
              output: undefined,
            });
            break;
          }
          case "deleteBlock": {
            const { nodeIndex } = toolCall.input;
            deleteBlock(nodeIndex);
            addToolOutput({
              tool: "deleteBlock",
              toolCallId: toolCall.toolCallId,
              output: undefined,
            });
            break;
          }
          case "getBlock": {
            const { nodeIndex } = toolCall.input;
            const block = getBlock(nodeIndex);
            const outputBlock =
              block && "type" in block && "attrs" in block
                ? (block as {
                    type: string;
                    attrs: Record<string, unknown>;
                    content?: unknown;
                  })
                : { type: "unknown", attrs: {}, content: undefined };
            addToolOutput({
              tool: "getBlock",
              toolCallId: toolCall.toolCallId,
              output: outputBlock,
            });
            break;
          }
          case "getAllBlocks": {
            const { blockType } = toolCall.input;
            const blocks = getAllBlocks(blockType);
            addToolOutput({
              tool: "getAllBlocks",
              toolCallId: toolCall.toolCallId,
              output: blocks,
            });
            break;
          }
        }
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
        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <div className="space-y-4">
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

                // Check if message has any content
                const hasAnyContent = message.parts.some(
                  (part) =>
                    part.type === "text" ||
                    part.type === "reasoning" ||
                    part.type.startsWith("tool-") ||
                    part.type === "dynamic-tool",
                );

                return (
                  <div key={message.id} className="w-full space-y-3">
                    {isTyping && !hasAnyContent && (
                      <Reasoning
                        isStreaming={true}
                        collapsible={false}
                        defaultOpen={false}
                      >
                        <ReasoningTrigger />
                        <ReasoningContent>{""}</ReasoningContent>
                      </Reasoning>
                    )}
                    {message.parts.map((part, partIndex) => {
                      // Handle reasoning parts
                      if (part.type === "reasoning") {
                        const reasoningIndex = reasoningParts.findIndex(
                          (p) => p === part,
                        );
                        const isLastReasoning =
                          reasoningIndex === reasoningParts.length - 1;
                        const isStreaming =
                          isReasoningStreaming && isLastReasoning;

                        return (
                          <Reasoning
                            key={`part-${partIndex}-reasoning`}
                            isStreaming={isStreaming}
                            defaultOpen={false}
                            title={
                              isLastReasoning ? lastReasoningTitle : undefined
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>
                              <MarkdownRenderer typing={isStreaming} size="sm">
                                {part.text}
                              </MarkdownRenderer>
                            </ReasoningContent>
                          </Reasoning>
                        );
                      }

                      // Handle text parts
                      if (part.type === "text") {
                        return (
                          <MarkdownRenderer
                            key={`part-${partIndex}-text`}
                            typing={isTyping && !hasReasoning}
                          >
                            {part.text}
                          </MarkdownRenderer>
                        );
                      }

                      // Handle tool parts
                      if (
                        part.type.startsWith("tool-") ||
                        part.type === "dynamic-tool"
                      ) {
                        const toolCallId =
                          "toolCallId" in part
                            ? part.toolCallId
                            : `tool-${partIndex}`;
                        return (
                          <ToolCallDisplay
                            key={`part-${partIndex}-tool-${toolCallId}`}
                            part={part}
                            isStreaming={isTyping}
                          />
                        );
                      }

                      // Handle step-start parts (for multi-step)
                      if (part.type === "step-start") {
                        return partIndex > 0 ? (
                          <hr key={`part-${partIndex}-step-separator`} />
                        ) : null;
                      }

                      return null;
                    })}
                  </div>
                );
              }

              return null;
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
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
