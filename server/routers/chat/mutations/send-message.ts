import { streamToEventIterator } from "@orpc/server";
import {
  convertToModelMessages,
  createUIMessageStream,
  stepCountIs,
  streamText,
} from "ai";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { editorTools } from "../tools/editor-tools";
import { sendMessageSchema } from "../validators";

export const sendMessageBase = publicProcedure
  .route({ method: "POST" })
  .input(sendMessageSchema)
  .errors({
    INVALID_INPUT: { message: "Invalid conversation input" },
  });

export const sendMessageHandler = sendMessageBase.handler(
  async ({ input, errors }) => {
    const { messages, documentContent } = input;

    if (!messages || messages.length === 0) {
      throw errors.INVALID_INPUT();
    }

    const systemMessage = `Tu es un assistant IA spécialisé dans l'édition de propositions commerciales.

Le document est structuré en blocs JSON au format TipTap. Il contient des blocs custom :
- "pricingCard": Tableaux de tarification avec titre, prix, période et liste de fonctionnalités
- "featureList": Liste de fonctionnalités avec un titre
- "callToAction": Call to action avec titre, description et bouton

IMPORTANT :
1. Lis toujours le document avant de le modifier (utilise getDocumentContent pour obtenir le JSON complet)
2. Pour trouver des blocs existants, utilise getAllBlocks (optionnellement filtré par type)
3. Pour modifier un bloc existant, utilise d'abord getAllBlocks pour trouver son index, puis updateBlock
4. Pour créer un nouveau bloc, utilise insertPricingCard, insertFeatureList ou insertCallToAction
5. Utilise les tools appropriés pour chaque type de modification
6. Respecte la structure JSON des blocs custom
7. Quand tu édites un bloc, fournis tous les attributs nécessaires dans updateBlock
8. L'utilisateur peut éditer manuellement pendant que tu travailles, vérifie toujours l'état actuel avec getDocumentContent ou getAllBlocks

Structure des blocs custom :

PricingCard:
- title: string (titre du plan)
- price: string (ex: "99", "€99")
- period: string (ex: "/mois", "/an")
- features: string[] (liste des fonctionnalités)
- highlighted: boolean (mise en évidence)

FeatureList:
- title: string (titre de la section)
- features: string[] (liste des fonctionnalités)

CallToAction:
- title: string (titre)
- description: string (description)
- buttonText: string (texte du bouton, défaut: "Get Started")
- buttonLink: string (lien du bouton, défaut: "#")

Workflow recommandé (pattern Read-Plan-Execute) :
1. Read : Utilise getDocumentContent ou getAllBlocks pour lire le document
2. Plan : Analyse ce qui doit être modifié/créé
3. Execute : Utilise les tools appropriés (insert*, updateBlock, deleteBlock)

${documentContent ? `\nContenu actuel du document (HTML):\n${documentContent}\n\nNote: Pour obtenir le JSON complet, utilise getDocumentContent.` : ""}`;

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({
          type: "data-sessionId",
          data: { sessionId: input.sessionId },
          transient: true,
        });

        const result = streamText({
          model: "google/gemini-2.5-pro",
          messages: convertToModelMessages(messages),
          system: systemMessage,
          tools: editorTools,
          providerOptions: {
            google: {
              thinkingBudget: 8192,
              includeThoughts: true,
            },
          },
          stopWhen: stepCountIs(25),
        });

        writer.merge(result.toUIMessageStream({ originalMessages: messages }));
      },
    });

    return streamToEventIterator(stream);
  },
);
