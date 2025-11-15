import { eq } from "drizzle-orm";
import { propals } from "@/db/schema";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { getPropalSchema } from "../validators";

export const getPropalBase = publicProcedure
  .route({ method: "GET" })
  .input(getPropalSchema)
  .errors({
    PROPAL_NOT_FOUND: {
      status: 404,
    },
  });

export const getPropalHandler = getPropalBase.handler(
  async ({ context, input, errors }) => {
    const { db } = context;
    const { id } = input;

    const [propal] = await db
      .select()
      .from(propals)
      .where(eq(propals.id, id))
      .limit(1);

    if (!propal) {
      throw errors.PROPAL_NOT_FOUND();
    }

    return propal;
  },
);
