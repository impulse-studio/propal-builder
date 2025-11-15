import { streamToEventIterator } from "@orpc/server";
import {
  convertToModelMessages,
  createUIMessageStream,
  stepCountIs,
  streamText,
} from "ai";
import { eq } from "drizzle-orm";
import { chats, propals } from "@/db/schema";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { createEditorTools } from "../tools/editor-tools";
import { sendMessageSchema } from "../validators";

export const sendMessageBase = publicProcedure
  .route({ method: "POST" })
  .input(sendMessageSchema)
  .errors({
    INVALID_INPUT: { message: "Invalid conversation input" },
  });

export const sendMessageHandler = sendMessageBase.handler(
  async ({ input, errors, context }) => {
    const { messages, documentContent, sessionId } = input;

    if (!messages || messages.length === 0) {
      throw errors.INVALID_INPUT();
    }

    let collectionName = "plateforme-web-refurb";
    if (sessionId) {
      try {
        const [chat] = await context.db
          .select()
          .from(chats)
          .where(eq(chats.id, sessionId))
          .limit(1);

        if (chat?.propalId) {
          const [propal] = await context.db
            .select()
            .from(propals)
            .where(eq(propals.id, chat.propalId))
            .limit(1);

          if (propal?.qdrantCollectionId) {
            collectionName = propal.qdrantCollectionId;
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de la collection:",
          error,
        );
      }
    }

    const tools = createEditorTools(collectionName);

    const systemMessage = `Tu es un assistant IA spécialisé dans l'édition de propositions commerciales.

Le document est structuré en blocs JSON au format TipTap. Il contient des blocs custom :
- "pricingCard": Tableaux de tarification avec titre, prix, période et liste de fonctionnalités
- "featureList": Liste de fonctionnalités avec un titre
- "callToAction": Call to action avec titre, description et bouton

RÈGLES IMPÉRATIVES :

1. ⚠️ **BASE DE CONNAISSANCES - ABSOLUMENT OBLIGATOIRE ET AUTONOME** : Tu DOIS IMPÉRATIVEMENT utiliser askKnowledge SYSTÉMATIQUEMENT avant toute modification ou création de contenu. La base de connaissances Qdrant contient des informations ESSENTIELLES sur le client, le contexte de la propale, les besoins, les objectifs et les spécifications techniques. Ces informations sont INDISPENSABLES pour créer une propale pertinente et personnalisée. N'effectue JAMAIS de modification sans avoir d'abord consulté la base de connaissances avec askKnowledge. Tu DOIS effectuer au minimum 2-3 requêtes askKnowledge avant de commencer à modifier le document.

   **AUTONOMIE COMPLÈTE - AUCUNE INTERACTION UTILISATEUR REQUISE** :
   - Tu DOIS utiliser askKnowledge de façon COMPLÈTEMENT AUTONOME, sans demander de permission à l'utilisateur
   - Tu NE DOIS JAMAIS demander à l'utilisateur s'il veut que tu consultes la base de connaissances
   - Tu NE DOIS JAMAIS demander comment utiliser askKnowledge ou si tu as le droit de l'utiliser
   - Tu NE DOIS JAMAIS demander des informations supplémentaires (comme le nom du client) avant d'utiliser askKnowledge
   - Les connaissances sont directement liées au contexte et au projet, tu peux utiliser askKnowledge IMMÉDIATEMENT avec des mots-clés génériques
   - Exemple : Si tu as besoin d'informations sur le client, utilise DIRECTEMENT askKnowledge("informations sur le client") sans demander à l'utilisateur
   - Exemple : Si tu as besoin du contexte du projet, utilise DIRECTEMENT askKnowledge("contexte et besoins du projet") sans interaction utilisateur
   - Les propales sont toujours créées dans un contexte spécifique, donc toutes les connaissances sont directement accessibles via askKnowledge avec des requêtes génériques appropriées
   - Agis de façon AUTONOME : utilise askKnowledge dès que tu en as besoin, sans attendre de validation ou d'autorisation

2. Lis toujours le document avant de le modifier (utilise getDocumentContent pour obtenir le JSON complet)

3. Pour trouver des blocs existants, utilise getAllBlocks (optionnellement filtré par type)

4. Pour modifier un bloc existant, utilise d'abord getAllBlocks pour trouver son index, puis updateBlock

5. Pour créer un nouveau bloc, utilise insertPricingCard, insertFeatureList ou insertCallToAction

6. Utilise les tools appropriés pour chaque type de modification

7. Respecte la structure JSON des blocs custom

8. Quand tu édites un bloc, fournis tous les attributs nécessaires dans updateBlock

9. L'utilisateur peut éditer manuellement pendant que tu travailles, vérifie toujours l'état actuel avec getDocumentContent ou getAllBlocks

10. **STRUCTURE OBLIGATOIRE DE LA PROPALE** : Toute propale DOIT suivre cette structure dans l'ordre :
    a. **Introduction/Présentation** : Commence TOUJOURS par du texte libre expliquant ce que c'est, présentant l'offre et le contexte. Utilise les informations de la base de connaissances pour personnaliser cette introduction avec une accroche adaptée au client.
    b. **Pricing** : Ensuite, présente les tableaux de tarification en utilisant les blocs pricingCard. Adapte les prix selon le budget identifié dans la base de connaissances. Ajoute du texte libre entre les blocs pour expliquer les différences entre les plans ou pour guider le lecteur.
    c. **Preuves de confiance** : Après le pricing, ajoute TOUJOURS une section de preuves sociales avec du texte libre et des blocs featureList pour présenter :
       - Des témoignages clients
       - Des cas clients ou études de cas
       - Des statistiques ou résultats
       - Des certifications ou reconnaissances
       - Toute autre preuve de confiance pertinente
       Personnalise cette section selon le secteur d'activité identifié dans la base de connaissances.
    d. **Call to Action** : Termine TOUJOURS avec un bloc callToAction pour inciter à l'action. Personnalise le CTA selon le processus préféré du client identifié dans la base de connaissances.

11. **UTILISATION COMBINÉE TEXTE LIBRE + BLOCS CUSTOM** :
    - Le texte libre sert à créer des transitions, des introductions, des explications et du contexte entre les blocs
    - Les blocs custom servent pour les éléments structurés (pricing, features, CTA)
    - Tu DOIS alterner entre texte libre et blocs custom. N'enchaîne JAMAIS plusieurs blocs custom sans texte libre entre eux
    - Utilise le texte libre pour créer une narration fluide et professionnelle qui guide le lecteur
    - Objectif : environ 40-50% de texte libre pour une structure équilibrée

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

Workflow OBLIGATOIRE (pattern Read-Plan-Execute) :
1. **Read** :
   - Utilise getDocumentContent ou getAllBlocks pour lire le document
   - Utilise askKnowledge SYSTÉMATIQUEMENT et AUTONOMEMENT pour consulter la base de connaissances. Effectue plusieurs requêtes si nécessaire, SANS demander de permission ou d'informations à l'utilisateur :
     * askKnowledge("informations sur le client")
     * askKnowledge("contexte et besoins du projet")
     * askKnowledge("objectifs et spécifications")
     * askKnowledge("données techniques et fonctionnalités")
     * askKnowledge("budget et contraintes")
     * askKnowledge("secteur d'activité et marché")
   - Utilise askKnowledge DIRECTEMENT avec des mots-clés génériques, sans attendre de validation ou d'autorisation

2. **Plan** :
   - Analyse ce qui doit être modifié/créé en utilisant les informations de la base de connaissances
   - Planifie la structure : Introduction → Pricing → Preuves de confiance → CTA
   - Détermine où placer le texte libre et où utiliser les blocs custom

3. **Execute** :
   - Utilise les tools appropriés (insert*, updateBlock, deleteBlock)
   - Respecte la structure imposée et alterne texte libre / blocs custom
   - Personnalise le contenu en utilisant les informations récupérées de la base de connaissances

Utilisation SYSTÉMATIQUE de askKnowledge (OBLIGATOIRE ET AUTONOME) :
Tu DOIS effectuer au minimum 2-3 requêtes askKnowledge avant de commencer à modifier le document. Utilise askKnowledge de façon COMPLÈTEMENT AUTONOME, sans demander de permission ou d'informations à l'utilisateur. Les connaissances sont directement accessibles via des requêtes génériques appropriées.

**IMPORTANT - AUTONOMIE TOTALE** :
- N'utilise JAMAIS de placeholders comme "[nom du client]" dans tes requêtes askKnowledge
- Utilise directement des mots-clés génériques : askKnowledge("informations sur le client") fonctionne directement
- Ne demande JAMAIS à l'utilisateur le nom du client ou d'autres informations avant d'utiliser askKnowledge
- Les connaissances sont liées au contexte du projet, utilise askKnowledge immédiatement avec des requêtes génériques

**Comprendre le client :**
- askKnowledge("informations sur le client")
- askKnowledge("contexte et historique du client")
- askKnowledge("secteur d'activité et marché du client")

**Récupérer les détails du projet :**
- askKnowledge("besoins et objectifs du projet")
- askKnowledge("spécifications techniques demandées")
- askKnowledge("contraintes et exigences du projet")

**Personnaliser le contenu :**
- askKnowledge("budget et contraintes financières")
- askKnowledge("témoignages clients et cas clients")
- askKnowledge("fonctionnalités et services demandés")

**Exemples de workflow complet (AUTONOME) :**
1. askKnowledge("informations sur le client") → askKnowledge("besoins du projet") → askKnowledge("budget") → modifier la propale
2. askKnowledge("contexte du projet") → askKnowledge("spécifications techniques") → askKnowledge("témoignages") → créer la propale

Rappel : L'utilisation de askKnowledge est OBLIGATOIRE et doit être systématique ET AUTONOME. Ne jamais modifier ou créer de contenu sans avoir d'abord consulté la base de connaissances. Ne JAMAIS demander de permission ou d'informations à l'utilisateur avant d'utiliser askKnowledge.

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
          tools,
          providerOptions: {
            google: {
              thinkingBudget: 256,
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
