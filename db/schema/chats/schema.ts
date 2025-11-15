import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { propals } from "../propal/schema";

export const chats = pgTable("chats", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  propalId: text("propal_id").references(() => propals.id),
  dateEnvoi: timestamp("date_envoi", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
