import { db } from "@/db";
import { propals } from "@/db/schema";

export async function createPropalWorkflow(input: {
  qdrantCollectionId: string;
  dealSlug: string;
}) {
  "use workflow";

  const propal = await createPropalInDb({
    qdrantCollectionId: input.qdrantCollectionId,
    titre: `Propal for ${input.dealSlug}`,
    contenuJson: { type: "doc", content: [] },
  });

  return { propalId: propal.id };
}

async function createPropalInDb(input: {
  qdrantCollectionId: string;
  titre: string;
  contenuJson: unknown;
}) {
  "use step";

  const [propal] = await db
    .insert(propals)
    .values({
      qdrantCollectionId: input.qdrantCollectionId,
      titre: input.titre,
      contenuJson: input.contenuJson,
    })
    .returning();

  return propal;
}
