import { relations } from "drizzle-orm";
import { chats } from "../chats/schema";
import { propals } from "./schema";

export const propalsRelations = relations(propals, ({ many }) => ({
  chats: many(chats),
}));
