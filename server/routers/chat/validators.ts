import { z } from "zod";
import type { ChatUIMessage } from "./types";

export type { ChatUIMessage };

export const sendMessageSchema = z.object({
  messages: z.custom<ChatUIMessage[]>(),
  conversationId: z.string().optional(),
  sessionId: z.string().optional(),
  documentContent: z
    .string()
    .optional()
    .describe("Contenu HTML actuel du document TipTap"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
