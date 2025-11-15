"use client";

import { memo } from "react";
import type { ChatUIMessage } from "@/server/routers/chat/types";

interface AskKnowledgeToolProps {
  part: Extract<ChatUIMessage["parts"][number], { type: "tool-askKnowledge" }>;
}

function AskKnowledgeToolComponent({ part }: AskKnowledgeToolProps) {
  if (!("state" in part)) {
    return null;
  }

  const state = part.state;
  const input = part.input as { query?: string } | undefined;
  const output = part.output as
    | Array<{
        id: string | number;
        score: number;
        payload: Record<string, unknown>;
      }>
    | undefined;

  if (state === "input-streaming") {
    return (
      <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />
          <span className="text-paragraph-sm font-medium text-text-strong-950">
            Récupération d&apos;informations Qdrant
          </span>
        </div>
        <div className="text-paragraph-sm text-text-soft-600">
          Chargement des paramètres...
        </div>
      </div>
    );
  }

  if (state === "input-available" && input) {
    return (
      <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary-500" />
          <span className="text-paragraph-sm font-medium text-text-strong-950">
            Récupération d&apos;informations Qdrant
          </span>
        </div>
        {input.query && (
          <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
            <p className="mb-1 text-paragraph-xs text-text-sub-600">Requête</p>
            <p className="text-paragraph-sm text-text-strong-950">
              {input.query}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (state === "output-available") {
    if (!output || output.length === 0) {
      return (
        <div className="rounded-lg border border-warning-300 bg-warning-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-warning-500" />
            <span className="text-paragraph-sm font-medium text-warning-700">
              Aucun résultat trouvé
            </span>
          </div>
          <div className="text-paragraph-sm text-warning-600">
            Aucun document correspondant à cette requête n&apos;a été trouvé
            dans la base de données.
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-success-300 bg-success-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success-500" />
          <span className="text-paragraph-sm font-medium text-success-700">
            Qdrant information retrieval
          </span>
        </div>
        <div className="space-y-3">
          {input?.query && (
            <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
              <p className="mb-1 text-paragraph-xs text-text-sub-600">
                Requête
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {input.query}
              </p>
            </div>
          )}
          <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
            <p className="mb-2 text-paragraph-xs text-text-sub-600">
              Résultats ({output.length})
            </p>
            <div className="space-y-3">
              {output.map((result, index) => (
                <div
                  key={result.id}
                  className="rounded-md border border-stroke-soft-200 bg-bg-weak-50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-paragraph-xs font-medium text-text-strong-950">
                      Document #{index + 1}
                    </p>
                    <p className="text-paragraph-xs text-text-soft-600">
                      Score: {result.score.toFixed(4)}
                    </p>
                  </div>
                  <div className="mb-2 rounded-sm bg-bg-white-0 px-2 py-1">
                    <p className="text-[10px] text-text-sub-600">
                      ID: {String(result.id)}
                    </p>
                  </div>
                  {result.payload && Object.keys(result.payload).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-paragraph-xs text-text-sub-600">
                        Payload:
                      </p>
                      <div className="space-y-1">
                        {Object.entries(result.payload)
                          .slice(0, 5)
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-start gap-2 text-[11px]"
                            >
                              <span className="font-medium text-text-soft-600">
                                {key}:
                              </span>
                              <span className="flex-1 text-text-soft-600">
                                {typeof value === "string" ||
                                typeof value === "number" ||
                                typeof value === "boolean"
                                  ? String(value).slice(0, 50) + "..."
                                  : JSON.stringify(value).slice(0, 50) + "..."}
                              </span>
                            </div>
                          ))}
                        {Object.keys(result.payload).length > 5 && (
                          <p className="text-[10px] italic text-text-sub-600">
                            ... et {Object.keys(result.payload).length - 5}{" "}
                            autres champs
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="rounded-lg border border-error-300 bg-error-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-error-500" />
          <span className="text-paragraph-sm font-medium text-error-700">
            Erreur lors de la récupération
          </span>
        </div>
        <div className="text-paragraph-sm text-error-600">
          {part.errorText ||
            "Une erreur est survenue lors de la récupération des informations"}
        </div>
      </div>
    );
  }

  return null;
}

export const AskKnowledgeTool = memo(AskKnowledgeToolComponent);
