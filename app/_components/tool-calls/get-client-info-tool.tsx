"use client";

import { memo } from "react";
import type { ChatUIMessage } from "@/server/routers/chat/types";

interface GetClientInfoToolProps {
  part: Extract<ChatUIMessage["parts"][number], { type: "tool-getClientInfo" }>;
}

function GetClientInfoToolComponent({ part }: GetClientInfoToolProps) {
  if (!("state" in part)) {
    return null;
  }

  const state = part.state;
  const input = part.input as
    | { clientId?: string; collectionName?: string }
    | undefined;
  const output = part.output as
    | {
        id?: string | number;
        payload?: Record<string, unknown>;
        vector?: number[];
      }
    | null
    | undefined;

  if (state === "input-streaming") {
    return (
      <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />
          <span className="text-paragraph-sm font-medium text-text-strong-950">
            Récupération des informations du client
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
            Récupération des informations du client
          </span>
        </div>
        <div className="space-y-3">
          {input.clientId && (
            <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
              <p className="mb-1 text-paragraph-xs text-text-sub-600">
                ID du client
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {input.clientId}
              </p>
            </div>
          )}
          {input.collectionName && (
            <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
              <p className="mb-1 text-paragraph-xs text-text-sub-600">
                Collection
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {input.collectionName}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === "output-available") {
    if (output === null) {
      return (
        <div className="rounded-lg border border-warning-300 bg-warning-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-warning-500" />
            <span className="text-paragraph-sm font-medium text-warning-700">
              Client non trouvé
            </span>
          </div>
          <div className="text-paragraph-sm text-warning-600">
            Aucun client correspondant à cet identifiant n&apos;a été trouvé
            dans la base de données.
          </div>
        </div>
      );
    }

    if (output) {
      return (
        <div className="rounded-lg border border-success-300 bg-success-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success-500" />
            <span className="text-paragraph-sm font-medium text-success-700">
              Informations du client récupérées
            </span>
          </div>
          <div className="space-y-3">
            {output.id !== undefined && (
              <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
                <p className="mb-1 text-paragraph-xs text-text-sub-600">
                  ID Qdrant
                </p>
                <p className="text-paragraph-sm text-text-strong-950">
                  {String(output.id)}
                </p>
              </div>
            )}
            {output.payload && Object.keys(output.payload).length > 0 && (
              <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
                <p className="mb-2 text-paragraph-xs text-text-sub-600">
                  Informations du client
                </p>
                <pre className="max-h-64 overflow-y-auto text-[11px] leading-relaxed text-text-soft-600">
                  {JSON.stringify(output.payload, null, 2)}
                </pre>
              </div>
            )}
            {output.vector && output.vector.length > 0 && (
              <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
                <p className="mb-1 text-paragraph-xs text-text-sub-600">
                  Vecteur (dimensions: {output.vector.length})
                </p>
                <p className="text-paragraph-xs text-text-soft-600">
                  {output.vector.slice(0, 5).join(", ")}
                  {output.vector.length > 5 ? "..." : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
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
            "Une erreur est survenue lors de la récupération des informations du client"}
        </div>
      </div>
    );
  }

  return null;
}

export const GetClientInfoTool = memo(GetClientInfoToolComponent);
