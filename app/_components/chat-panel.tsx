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
      onData: (dataPart) => {
        if (dataPart.type === "data-sessionId") {
          const sessionData = dataPart.data as { sessionId: string };
          sessionIdRef.current = sessionData.sessionId;
        }
      },
    });

  // Process tool calls from messages (needed for custom transport)
  const processedToolCallsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    messages.forEach((message) => {
      if (message.role === "assistant") {
        message.parts.forEach((part) => {
          // Check for tool parts that need execution
          if (
            (part.type.startsWith("tool-") || part.type === "dynamic-tool") &&
            "state" in part &&
            part.state === "input-available" &&
            "toolCallId" in part
          ) {
            const toolCallId = part.toolCallId as string;

            // Skip if already processed
            if (processedToolCallsRef.current.has(toolCallId)) {
              return;
            }

            processedToolCallsRef.current.add(toolCallId);

            // Execute tool based on type
            try {
              if (part.type === "tool-findAndReplace" && "input" in part) {
                const input = part.input as {
                  searchText: string;
                  replaceWith: string;
                  replaceAll?: boolean;
                };
                findAndReplace(
                  input.searchText,
                  input.replaceWith,
                  input.replaceAll,
                );
                addToolOutput({
                  tool: "findAndReplace",
                  toolCallId,
                  state: "output-available",
                  output: undefined,
                  errorText: undefined,
                });
              } else if (
                part.type === "tool-insertAtPosition" &&
                "input" in part
              ) {
                const input = part.input as {
                  position: "start" | "end" | "after" | "before";
                  content: string;
                  anchorText?: string;
                };
                insertAtPosition(
                  input.position,
                  input.content,
                  input.anchorText,
                );
                addToolOutput({
                  tool: "insertAtPosition",
                  toolCallId,
                  state: "output-available",
                  output: undefined,
                  errorText: undefined,
                });
              } else if (
                part.type === "tool-replaceSection" &&
                "input" in part
              ) {
                const input = part.input as {
                  startText: string;
                  endText?: string;
                  newContent: string;
                };
                replaceSection(
                  input.startText,
                  input.endText,
                  input.newContent,
                );
                addToolOutput({
                  tool: "replaceSection",
                  toolCallId,
                  state: "output-available",
                  output: undefined,
                  errorText: undefined,
                });
              } else if (
                part.type === "tool-setDocumentContent" &&
                "input" in part
              ) {
                const input = part.input as { content: string };
                replaceContent(input.content);
                addToolOutput({
                  tool: "setDocumentContent",
                  toolCallId,
                  state: "output-available",
                  output: undefined,
                  errorText: undefined,
                });
              } else if (part.type === "tool-deleteText" && "input" in part) {
                const input = part.input as {
                  textToDelete: string;
                  deleteAll?: boolean;
                };
                deleteText(input.textToDelete, input.deleteAll);
                addToolOutput({
                  tool: "deleteText",
                  toolCallId,
                  state: "output-available",
                  output: undefined,
                  errorText: undefined,
                });
              } else if (
                part.type === "tool-getDocumentContent" &&
                "input" in part
              ) {
                const content = getJSON();
                addToolOutput({
                  tool: "getDocumentContent",
                  toolCallId,
                  state: "output-available",
                  output: content || {},
                  errorText: undefined,
                });
              } else if (
                part.type === "tool-insertPricingCard" &&
                "input" in part
              ) {
                const input = part.input as {
                  title?: string;
                  price?: string;
                  period?: string;
                  features?: string[];
                  highlighted?: boolean;
                  position?: "start" | "end" | "after" | "before";
                  anchorText?: string;
                };
                // Note: Position handling would require cursor positioning
                // For now, blocks are inserted at cursor position (default: end)
                insertPricingCard({
                  title: input.title,
                  price: input.price,
                  period: input.period,
                  features: input.features,
                  highlighted: input.highlighted,
                });
                addToolOutput({
                  tool: "insertPricingCard",
                  toolCallId,
                  state: "output-available",
                  output: undefined,
                  errorText: undefined,
                });
              } else if (
                part.type === "tool-insertFeatureList" &&
                "input" in part
              ) {
                const input = part.input as {
                  title?: string;
                  features?: string[];
                  position?: "start" | "end" | "after" | "before";
                  anchorText?: string;
                };
                insertFeatureList({
                  title: input.title,
                  features: input.features,
                });
                addToolOutput({
                  tool: "insertFeatureList",
                  toolCallId,
                  state: "output-available",
                  output: undefined,
                  errorText: undefined,
                });
              } else if (
                part.type === "tool-insertCallToAction" &&
                "input" in part
              ) {
                const input = part.input as {
                  title?: string;
                  description?: string;
                  buttonText?: string;
                  buttonLink?: string;
                  position?: "start" | "end" | "after" | "before";
                  anchorText?: string;
                };
                insertCallToAction({
                  title: input.title,
                  description: input.description,
                  buttonText: input.buttonText,
                  buttonLink: input.buttonLink,
                });
                addToolOutput({
                  tool: "insertCallToAction",
                  toolCallId,
                  state: "output-available",
                  output: undefined,
                  errorText: undefined,
                });
              } else if (part.type === "tool-updateBlock" && "input" in part) {
                const input = part.input as {
                  nodeIndex: number;
                  attrs: Record<string, unknown>;
                };
                updateBlock(input.nodeIndex, input.attrs);
                addToolOutput({
                  tool: "updateBlock",
                  toolCallId,
                  state: "output-available",
                  output: undefined,
                  errorText: undefined,
                });
              } else if (part.type === "tool-deleteBlock" && "input" in part) {
                const input = part.input as { nodeIndex: number };
                deleteBlock(input.nodeIndex);
                addToolOutput({
                  tool: "deleteBlock",
                  toolCallId,
                  state: "output-available",
                  output: undefined,
                  errorText: undefined,
                });
              } else if (part.type === "tool-getBlock" && "input" in part) {
                const input = part.input as { nodeIndex: number };
                const block = getBlock(input.nodeIndex);
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
                  toolCallId,
                  state: "output-available",
                  output: outputBlock,
                  errorText: undefined,
                });
              } else if (part.type === "tool-getAllBlocks" && "input" in part) {
                const input = part.input as { blockType?: string };
                const blocks = getAllBlocks(input.blockType);
                addToolOutput({
                  tool: "getAllBlocks",
                  toolCallId,
                  state: "output-available",
                  output: blocks,
                  errorText: undefined,
                });
              }
            } catch (error) {
              console.error("Error executing tool:", error);
              const toolName = part.type.replace("tool-", "") as
                | "findAndReplace"
                | "insertAtPosition"
                | "replaceSection"
                | "setDocumentContent"
                | "deleteText"
                | "getDocumentContent"
                | "insertPricingCard"
                | "insertFeatureList"
                | "insertCallToAction"
                | "updateBlock"
                | "deleteBlock"
                | "getBlock"
                | "getAllBlocks";
              addToolOutput({
                tool: toolName,
                toolCallId,
                state: "output-error",
                errorText:
                  error instanceof Error ? error.message : "Unknown error",
              });
            }
          }
        });
      }
    });
  }, [
    messages,
    findAndReplace,
    insertAtPosition,
    replaceSection,
    replaceContent,
    deleteText,
    getContent,
    getJSON,
    insertPricingCard,
    insertFeatureList,
    insertCallToAction,
    updateBlock,
    deleteBlock,
    getBlock,
    getAllBlocks,
    addToolOutput,
  ]);

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

  const getMessageText = useCallback((message: ChatUIMessage): string => {
    return message.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text",
      )
      .map((part) => part.text)
      .join("");
  }, []);

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

                // Get tool parts
                const toolParts = message.parts.filter(
                  (part) =>
                    part.type.startsWith("tool-") ||
                    part.type === "dynamic-tool",
                );

                return (
                  <div key={message.id} className="w-full space-y-3">
                    {isTyping &&
                      !hasReasoning &&
                      !text &&
                      toolParts.length === 0 && (
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
                      const isStreaming =
                        isReasoningStreaming && isLastReasoning;

                      return (
                        <Reasoning
                          key={`reasoning-${idx}`}
                          isStreaming={isStreaming}
                          defaultOpen={false}
                          title={
                            isLastReasoning ? lastReasoningTitle : undefined
                          }
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
                    {toolParts.length > 0 && (
                      <div className="space-y-2">
                        {toolParts.map((part, idx) => {
                          const toolCallId =
                            "toolCallId" in part
                              ? part.toolCallId
                              : `tool-${idx}`;
                          return (
                            <ToolCallDisplay
                              key={`tool-${idx}-${toolCallId}`}
                              part={part}
                              isStreaming={isTyping}
                            />
                          );
                        })}
                      </div>
                    )}
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
