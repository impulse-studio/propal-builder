"use client";

import { memo } from "react";
import type { ChatUIMessage } from "@/server/routers/chat/types";

interface GetDocumentContentToolProps {
  part: Extract<
    ChatUIMessage["parts"][number],
    { type: "tool-getDocumentContent" }
  >;
}

function GetDocumentContentToolComponent({
  part,
}: GetDocumentContentToolProps) {
  if (!("state" in part)) {
    return null;
  }

  const state = part.state;
  const input = part.input;
  const output = part.output;

  if (state === "input-streaming") {
    return (
      <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />
          <span className="text-paragraph-sm font-medium text-text-strong-950">
            Récupération du document
          </span>
        </div>
        <div className="text-paragraph-sm text-text-soft-600">
          Chargement...
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
            Récupération du document
          </span>
        </div>
        {input.documentId && (
          <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
            <p className="mb-1 text-paragraph-xs text-text-sub-600">
              ID du document
            </p>
            <p className="text-paragraph-sm text-text-strong-950">
              {input.documentId}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (state === "output-available" && output) {
    return (
      <div className="rounded-lg border border-success-300 bg-success-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success-500" />
          <span className="text-paragraph-sm font-medium text-success-700">
            Récupération du document
          </span>
        </div>
        <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
          <p className="mb-2 text-paragraph-xs text-text-sub-600">
            Contenu du document (JSON TipTap)
          </p>
          <pre className="max-h-64 overflow-y-auto text-[11px] leading-relaxed text-text-soft-600">
            {JSON.stringify(output, null, 2)}
          </pre>
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
            Récupération du document
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

export const GetDocumentContentTool = memo(GetDocumentContentToolComponent);
