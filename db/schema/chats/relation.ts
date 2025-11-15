import { relations } from "drizzle-orm";
import { propals } from "../propal/schema";
import { chats } from "./schema";

export const chatsRelations = relations(chats, ({ one }) => ({
  propal: one(propals, {
    fields: [chats.propalId],
    references: [propals.id],
  }),
}));
