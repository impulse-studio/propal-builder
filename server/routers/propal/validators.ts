import { z } from "zod";

export const getPropalsSchema = z.object({}).optional();

export type GetPropalsInput = z.infer<typeof getPropalsSchema>;
