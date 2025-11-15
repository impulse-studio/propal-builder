export * from "./relation";
export * from "./schema";

import type { propals } from "./schema";

export type PropositionCommerciale = typeof propals.$inferSelect;
export type NewPropositionCommerciale = typeof propals.$inferInsert;
