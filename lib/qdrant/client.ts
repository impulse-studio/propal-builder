import { openai } from "@ai-sdk/openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { embed } from "ai";
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
  collectionName: string = "plateforme-web-refurb",
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
  collectionName: string = "plateforme-web-refurb",
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

/**
 * Effectue une recherche sémantique dans Qdrant en utilisant une requête texte
 * @param query - Le texte de la requête à rechercher
 * @param collectionName - Le nom de la collection Qdrant (par défaut: "clients")
 * @param limit - Nombre de résultats à retourner (par défaut: 5)
 * @returns Liste des documents trouvés avec leur score de similarité
 */
export async function semanticSearch(
  query: string,
  collectionName: string,
  limit: number = 5,
) {
  const client = getQdrantClient();

  try {
    // Générer l'embedding de la requête avec OpenAI Embedding API
    const { embedding } = await embed({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      value: query,
      providerOptions: {
        openai: {
          dimensions: 1536,
        },
      },
    });

    // Effectuer la recherche dans Qdrant
    const result = await client.search(collectionName, {
      vector: embedding,
      limit,
      with_payload: true,
    });

    return result.map((hit) => ({
      id: hit.id,
      score: hit.score,
      payload: hit.payload || {},
    }));
  } catch (error) {
    console.error("Erreur lors de la recherche sémantique:", error);
    throw error;
  }
}
