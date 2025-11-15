import { propals } from "@/db/schema";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { getPropalsSchema } from "../validators";

export const getPropalsBase = publicProcedure
  .route({ method: "GET" })
  .input(getPropalsSchema);

export const getPropalsHandler = getPropalsBase.handler(async ({ context }) => {
  const { db } = context;

  const propalsData = await db.select().from(propals);

  return propalsData;
});
