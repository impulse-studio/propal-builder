"use client";

import { memo } from "react";
import type { ChatUIMessage } from "@/server/routers/chat/types";

interface InsertAtPositionToolProps {
  part: Extract<
    ChatUIMessage["parts"][number],
    { type: "tool-insertAtPosition" }
  >;
}

function InsertAtPositionToolComponent({ part }: InsertAtPositionToolProps) {
  if (!("state" in part)) {
    return null;
  }

  const state = part.state;
  const input = part.input;

  const positionLabels = {
    start: "Début du document",
    end: "Fin du document",
    after: "Après le texte",
    before: "Avant le texte",
  };

  if (state === "input-streaming") {
    return (
      <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />
          <span className="text-paragraph-sm font-medium text-text-strong-950">
            Insertion de contenu
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
            Insertion de contenu
          </span>
        </div>
        <div className="space-y-3">
          <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
            <p className="mb-1 text-paragraph-xs text-text-sub-600">
              Position
            </p>
            <p className="text-paragraph-sm text-text-strong-950">
              {positionLabels[input.position as keyof typeof positionLabels] ||
                input.position}
            </p>
          </div>
          {input.anchorText && (
            <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
              <p className="mb-1 text-paragraph-xs text-text-sub-600">
                Texte de référence
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {input.anchorText}
              </p>
            </div>
          )}
          <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
            <p className="mb-1 text-paragraph-xs text-text-sub-600">
              Contenu à insérer
            </p>
            <div
              className="text-paragraph-sm text-text-strong-950"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML content from AI needs to be rendered
              dangerouslySetInnerHTML={{ __html: input.content as string }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (state === "output-available") {
    return (
      <div className="rounded-lg border border-success-300 bg-success-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success-500" />
          <span className="text-paragraph-sm font-medium text-success-700">
            Insertion de contenu
          </span>
        </div>
        <p className="text-paragraph-sm text-success-600">
          Contenu inséré avec succès
        </p>
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="rounded-lg border border-error-300 bg-error-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-error-500" />
          <span className="text-paragraph-sm font-medium text-error-700">
            Insertion de contenu
          </span>
        </div>
        <div className="text-paragraph-sm text-error-600">
          {part.errorText || "Une erreur est survenue"}
        </div>
      </div>
    );
  }

  return null;
}

export const InsertAtPositionTool = memo(InsertAtPositionToolComponent);
