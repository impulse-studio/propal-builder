import { propals } from "@/db/schema";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { createPropalSchema } from "../validators";

export const createPropalBase = publicProcedure
  .route({ method: "POST" })
  .input(createPropalSchema)
  .errors({
    PROPAL_CREATION_FAILED: {
      status: 500,
    },
  });

export const createPropalHandler = createPropalBase.handler(
  async ({ context, input, errors }) => {
    const { db } = context;

    try {
      const [propal] = await db
        .insert(propals)
        .values({
          qdrantCollectionId: input.qdrantCollectionId,
          titre: input.titre,
          contenuJson: input.contenuJson,
        })
        .returning();

      return propal;
    } catch (error) {
      console.error("Failed to create propal:", error);
      throw errors.PROPAL_CREATION_FAILED();
    }
  },
);
