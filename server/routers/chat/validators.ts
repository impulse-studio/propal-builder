import type { UIMessage } from "ai";
import { z } from "zod";

export type ChatUIMessage = UIMessage;

export const sendMessageSchema = z.object({
  messages: z.custom<ChatUIMessage[]>(),
  conversationId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
