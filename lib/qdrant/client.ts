import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "@/env";

let qdrantClient: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (!qdrantClient) {
    const apiKey = env.QDRANT_API_KEY;

    qdrantClient = new QdrantClient({
      url: env.QDRANT_URL,
      ...(apiKey && { apiKey }),
    });
  }

  return qdrantClient;
}

/**
 * Récupère les informations d'un client depuis Qdrant
 * @param clientId - L'identifiant unique du client
 * @param collectionName - Le nom de la collection Qdrant (par défaut: "clients")
 * @returns Les informations du client ou null si non trouvé
 */
export async function getClientInfo(
  clientId: string,
  collectionName: string = "clients",
) {
  const client = getQdrantClient();

  try {
    // Utiliser scroll pour récupérer les points avec un filtre
    const result = await client.scroll(collectionName, {
      filter: {
        must: [
          {
            key: "client_id",
            match: {
              value: clientId,
            },
          },
        ],
      },
      limit: 1,
    });

    if (result.points && result.points.length > 0) {
      const point = result.points[0];
      return {
        id: point.id,
        payload: point.payload || {},
        vector: point.vector,
      };
    }

    return null;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du client depuis Qdrant:",
      error,
    );
    throw error;
  }
}

/**
 * Recherche des clients similaires dans Qdrant en utilisant un vecteur de requête
 * @param queryVector - Le vecteur de requête pour la recherche de similarité
 * @param collectionName - Le nom de la collection Qdrant (par défaut: "clients")
 * @param limit - Nombre de résultats à retourner (par défaut: 5)
 * @returns Liste des clients similaires
 */
export async function searchSimilarClients(
  queryVector: number[],
  collectionName: string = "clients",
  limit: number = 5,
) {
  const client = getQdrantClient();

  try {
    const result = await client.search(collectionName, {
      vector: queryVector,
      limit,
    });

    return result.map((hit) => ({
      id: hit.id,
      score: hit.score,
      payload: hit.payload || {},
    }));
  } catch (error) {
    console.error("Erreur lors de la recherche de clients similaires:", error);
    throw error;
  }
}
