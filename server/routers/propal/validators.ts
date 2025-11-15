import { z } from "zod";

export const getPropalsSchema = z.object({}).optional();

export type GetPropalsInput = z.infer<typeof getPropalsSchema>;

export const getPropalSchema = z.object({
  id: z.string(),
});

export type GetPropalInput = z.infer<typeof getPropalSchema>;

export const createPropalSchema = z.object({
  qdrantCollectionId: z.string().min(1),
  titre: z.string().min(1),
  contenuJson: z.unknown(),
});

export type CreatePropalInput = z.infer<typeof createPropalSchema>;
