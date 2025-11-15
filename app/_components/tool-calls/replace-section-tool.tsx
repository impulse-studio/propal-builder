"use client";

import { memo } from "react";
import type { ChatUIMessage } from "@/server/routers/chat/types";

interface ReplaceSectionToolProps {
  part: Extract<
    ChatUIMessage["parts"][number],
    { type: "tool-replaceSection" }
  >;
}

function ReplaceSectionToolComponent({ part }: ReplaceSectionToolProps) {
  if (!("state" in part)) {
    return null;
  }

  const state = part.state;
  const input = part.input;

  if (state === "input-streaming") {
    return (
      <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />
          <span className="text-paragraph-sm font-medium text-text-strong-950">
            Remplacement de section
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
            Remplacement de section
          </span>
        </div>
        <div className="space-y-3">
          <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
            <p className="mb-1 text-paragraph-xs text-text-sub-600">
              Texte de début
            </p>
            <p className="text-paragraph-sm text-text-strong-950">
              {input.startText}
            </p>
          </div>
          {input.endText && (
            <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
              <p className="mb-1 text-paragraph-xs text-text-sub-600">
                Texte de fin
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {input.endText}
              </p>
            </div>
          )}
          <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
            <p className="mb-1 text-paragraph-xs text-text-sub-600">
              Nouveau contenu
            </p>
            <div
              className="text-paragraph-sm text-text-strong-950"
              dangerouslySetInnerHTML={{ __html: input.newContent as string }}
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
            Remplacement de section
          </span>
        </div>
        <p className="text-paragraph-sm text-success-600">
          Section remplacée avec succès
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
            Remplacement de section
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

export const ReplaceSectionTool = memo(ReplaceSectionToolComponent);
