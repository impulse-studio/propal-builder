import type { InferSelectModel } from "drizzle-orm";
import { json, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { chats } from "../chats/schema";

export const messages = pgTable("message", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  chatId: text("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  content: text("content").notNull(),
  experimental_attachments: json("attachments"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Message = InferSelectModel<typeof messages>;
