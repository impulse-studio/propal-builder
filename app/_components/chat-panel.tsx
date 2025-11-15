"use client";

import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Root as ButtonRoot } from "@/components/ui/button";
import { Root as TextareaRoot } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import { orpcClient } from "@/orpc/client";
import type { ChatUIMessage } from "@/server/routers/chat/validators";

export function ChatPanel() {
  const sessionIdRef = useRef<string | null>(null);
  const [input, setInput] = useState("");

  const { messages, status, sendMessage } = useChat<ChatUIMessage>({
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "streaming";

  // biome-ignore lint/correctness/useExhaustiveDependencies: hackaton
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({
      role: "user",
      parts: [{ type: "text", text: input }],
    });
    setInput("");
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-4 py-3",
                  message.role === "user"
                    ? "bg-primary-base text-static-white"
                    : "bg-bg-weak-50 text-text-strong-950",
                )}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.parts
                      .filter(
                        (part): part is { type: "text"; text: string } =>
                          part.type === "text",
                      )
                      .map((part) => part.text)
                      .join("")}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-xl bg-bg-weak-50 px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-text-soft-400 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-text-soft-400 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-text-soft-400" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="border-t border-stroke-soft-200 p-4"
      >
        <div className="flex gap-2">
          <TextareaRoot
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
            simple
          />
          <ButtonRoot
            type="submit"
            disabled={isLoading || !input.trim()}
            variant="primary"
            mode="filled"
            size="medium"
          >
            Send
          </ButtonRoot>
        </div>
      </form>
    </div>
  );
}
