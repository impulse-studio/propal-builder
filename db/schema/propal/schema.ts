import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

export const propals = pgTable("propals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  titre: text("titre").notNull(),
  contenuJson: jsonb("contenu_json").notNull(),
  qdrantCollectionId: text("qdrant_collection_id").notNull(),

  dateCreation: timestamp("date_creation", { withTimezone: true })
    .defaultNow()
    .notNull(),
  dateModification: timestamp("date_modification", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
