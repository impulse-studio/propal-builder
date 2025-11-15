import { relations } from "drizzle-orm";
import { chats } from "../chats/schema";
import { messages } from "./schema";

export const messageRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));
