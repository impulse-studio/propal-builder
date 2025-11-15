"use client";

import { memo } from "react";
import type { ChatUIMessage } from "@/server/routers/chat/types";

interface DeleteBlockToolProps {
  part: Extract<ChatUIMessage["parts"][number], { type: "tool-deleteBlock" }>;
}

function DeleteBlockToolComponent({ part }: DeleteBlockToolProps) {
  if (!("state" in part)) {
    return null;
  }

  const state = part.state;
  const input = part.input as { nodeIndex?: number } | undefined;

  if (state === "input-streaming") {
    return (
      <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />
          <span className="text-paragraph-sm font-medium text-text-strong-950">
            Suppression d&apos;un bloc
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
            Suppression d&apos;un bloc
          </span>
        </div>
        {typeof input.nodeIndex === "number" && (
          <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
            <p className="mb-1 text-paragraph-xs text-text-sub-600">
              Index du bloc
            </p>
            <p className="text-paragraph-sm text-text-strong-950">
              {input.nodeIndex}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (state === "output-available") {
    return (
      <div className="rounded-lg border border-success-300 bg-success-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success-500" />
          <span className="text-paragraph-sm font-medium text-success-700">
            Bloc supprimé
          </span>
        </div>
        <p className="text-paragraph-sm text-success-600">
          Le bloc a été supprimé du document.
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
            Suppression d&apos;un bloc
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

export const DeleteBlockTool = memo(DeleteBlockToolComponent);


