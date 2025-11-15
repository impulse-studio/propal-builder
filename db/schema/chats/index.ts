export * from "./relation";
export * from "./schema";

import type { chats } from "./schema";

export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
