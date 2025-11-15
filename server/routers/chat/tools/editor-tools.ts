import { tool } from "ai";
import { z } from "zod";

export const editorTools = {
  findAndReplace: tool({
    description:
      "Trouve et remplace du texte dans le document. Recherche le texte exact et le remplace par le nouveau contenu. Utilisez cette fonction pour modifier des parties spécifiques du document existant.",
    inputSchema: z.object({
      searchText: z
        .string()
        .describe(
          "Le texte exact à rechercher dans le document (peut être un mot, une phrase ou un paragraphe)",
        ),
      replaceWith: z
        .string()
        .describe("Le nouveau contenu HTML qui remplacera le texte trouvé"),
      replaceAll: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Si true, remplace toutes les occurrences. Si false, remplace seulement la première occurrence",
        ),
    }),
    outputSchema: z.void(),
  }),

  insertAtPosition: tool({
    description:
      "Insère du contenu à une position spécifique dans le document. Utilisez cette fonction pour ajouter du contenu après un texte spécifique ou au début/fin du document.",
    inputSchema: z.object({
      position: z
        .enum(["start", "end", "after", "before"])
        .describe(
          "Position d'insertion: 'start' pour le début, 'end' pour la fin, 'after' pour après un texte, 'before' pour avant un texte",
        ),
      content: z.string().describe("Le contenu HTML à insérer"),
      anchorText: z
        .string()
        .optional()
        .describe(
          "Texte de référence pour 'after' ou 'before'. Requis si position est 'after' ou 'before'",
        ),
    }),
    outputSchema: z.void(),
  }),

  replaceSection: tool({
    description:
      "Remplace une section entière du document en trouvant le texte de début et de fin. Utilisez cette fonction pour modifier des sections complètes du document.",
    inputSchema: z.object({
      startText: z
        .string()
        .describe("Le texte qui marque le début de la section à remplacer"),
      endText: z
        .string()
        .optional()
        .describe(
          "Le texte qui marque la fin de la section (optionnel, utilise jusqu'à la fin si non fourni)",
        ),
      newContent: z
        .string()
        .describe("Le nouveau contenu HTML qui remplacera la section"),
    }),
    outputSchema: z.void(),
  }),

  setDocumentContent: tool({
    description:
      "Remplace complètement le contenu du document. Utilisez cette fonction uniquement si vous voulez remplacer tout le document.",
    inputSchema: z.object({
      content: z
        .string()
        .describe("Le nouveau contenu HTML complet du document"),
    }),
    outputSchema: z.void(),
  }),

  deleteText: tool({
    description:
      "Supprime du texte du document. Recherche le texte exact et le supprime.",
    inputSchema: z.object({
      textToDelete: z
        .string()
        .describe("Le texte exact à supprimer du document"),
      deleteAll: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Si true, supprime toutes les occurrences. Si false, supprime seulement la première",
        ),
    }),
    outputSchema: z.void(),
  }),

  getDocumentContent: tool({
    description:
      "Récupère le contenu actuel du document au format JSON TipTap. Utilisez cette fonction pour lire le document avant de le modifier.",
    inputSchema: z.object({
      documentId: z
        .string()
        .optional()
        .describe(
          "ID du document (optionnel, utilise le document actuel si non fourni)",
        ),
    }),
    outputSchema: z
      .object({})
      .passthrough()
      .describe("Le contenu JSON TipTap du document"),
  }),

  // Custom blocks tools
  insertPricingCard: tool({
    description:
      "Insère un bloc Pricing Card dans le document. Un Pricing Card affiche un plan tarifaire avec titre, prix, période et liste de fonctionnalités.",
    inputSchema: z.object({
      title: z.string().optional().describe("Titre du plan tarifaire"),
      price: z.string().optional().describe("Prix (ex: '99', '€99')"),
      period: z.string().optional().describe("Période (ex: '/mois', '/an')"),
      features: z
        .array(z.string())
        .optional()
        .describe("Liste des fonctionnalités incluses"),
      highlighted: z
        .boolean()
        .optional()
        .default(false)
        .describe("Si true, le bloc sera mis en évidence"),
      position: z
        .enum(["start", "end", "after", "before"])
        .optional()
        .default("end")
        .describe("Position d'insertion dans le document"),
      anchorText: z
        .string()
        .optional()
        .describe(
          "Texte de référence pour 'after' ou 'before'. Requis si position est 'after' ou 'before'",
        ),
    }),
    outputSchema: z.void(),
  }),

  insertFeatureList: tool({
    description:
      "Insère un bloc Feature List dans le document. Un Feature List affiche une liste de fonctionnalités avec un titre.",
    inputSchema: z.object({
      title: z.string().optional().describe("Titre de la section"),
      features: z
        .array(z.string())
        .optional()
        .describe("Liste des fonctionnalités"),
      position: z
        .enum(["start", "end", "after", "before"])
        .optional()
        .default("end")
        .describe("Position d'insertion dans le document"),
      anchorText: z
        .string()
        .optional()
        .describe(
          "Texte de référence pour 'after' ou 'before'. Requis si position est 'after' ou 'before'",
        ),
    }),
    outputSchema: z.void(),
  }),

  insertCallToAction: tool({
    description:
      "Insère un bloc Call to Action dans le document. Un Call to Action affiche un titre, une description et un bouton d'action.",
    inputSchema: z.object({
      title: z.string().optional().describe("Titre du call to action"),
      description: z
        .string()
        .optional()
        .describe("Description du call to action"),
      buttonText: z
        .string()
        .optional()
        .default("Get Started")
        .describe("Texte du bouton"),
      buttonLink: z.string().optional().default("#").describe("Lien du bouton"),
      position: z
        .enum(["start", "end", "after", "before"])
        .optional()
        .default("end")
        .describe("Position d'insertion dans le document"),
      anchorText: z
        .string()
        .optional()
        .describe(
          "Texte de référence pour 'after' ou 'before'. Requis si position est 'after' ou 'before'",
        ),
    }),
    outputSchema: z.void(),
  }),

  updateBlock: tool({
    description:
      "Met à jour un bloc existant dans le document. Utilisez getAllBlocks pour trouver l'index du bloc à modifier.",
    inputSchema: z.object({
      nodeIndex: z
        .number()
        .describe(
          "Index du nœud à modifier (utilisez getAllBlocks pour le trouver)",
        ),
      attrs: z
        .object({})
        .passthrough()
        .describe(
          "Nouveaux attributs du bloc (structure dépend du type de bloc)",
        ),
    }),
    outputSchema: z.void(),
  }),

  deleteBlock: tool({
    description:
      "Supprime un bloc du document. Utilisez getAllBlocks pour trouver l'index du bloc à supprimer.",
    inputSchema: z.object({
      nodeIndex: z
        .number()
        .describe(
          "Index du nœud à supprimer (utilisez getAllBlocks pour le trouver)",
        ),
    }),
    outputSchema: z.void(),
  }),

  getBlock: tool({
    description:
      "Récupère un bloc spécifique du document par son index. Utilisez getAllBlocks pour trouver l'index.",
    inputSchema: z.object({
      nodeIndex: z
        .number()
        .describe(
          "Index du nœud à récupérer (utilisez getAllBlocks pour le trouver)",
        ),
    }),
    outputSchema: z
      .object({
        type: z.string(),
        attrs: z.object({}).passthrough(),
        content: z.unknown().optional(),
      })
      .passthrough()
      .describe("Le bloc avec son type, attributs et contenu"),
  }),

  getAllBlocks: tool({
    description:
      "Récupère tous les blocs du document, optionnellement filtrés par type. Utile pour trouver les index des blocs à modifier.",
    inputSchema: z.object({
      blockType: z
        .string()
        .optional()
        .describe(
          "Type de bloc à filtrer (ex: 'pricingCard', 'featureList', 'callToAction'). Si non fourni, retourne tous les blocs.",
        ),
    }),
    outputSchema: z
      .array(
        z.object({
          index: z.number(),
          type: z.string(),
          attrs: z.object({}).passthrough(),
        }),
      )
      .describe("Liste de tous les blocs avec leur index, type et attributs"),
  }),
};
