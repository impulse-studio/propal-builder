"use client";

import { memo } from "react";
import type { ChatUIMessage } from "@/server/routers/chat/types";

interface GetAllBlocksToolProps {
  part: Extract<ChatUIMessage["parts"][number], { type: "tool-getAllBlocks" }>;
}

function GetAllBlocksToolComponent({ part }: GetAllBlocksToolProps) {
  if (!("state" in part)) {
    return null;
  }

  const state = part.state;
  const input = part.input as { blockType?: string } | undefined;
  const output = part.output as
    | Array<{
        index: number;
        type: string;
        attrs: Record<string, unknown>;
      }>
    | undefined;

  if (state === "input-streaming") {
    return (
      <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />
          <span className="text-paragraph-sm font-medium text-text-strong-950">
            Récupération des blocs
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
            Récupération des blocs
          </span>
        </div>
        {input.blockType && (
          <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
            <p className="mb-1 text-paragraph-xs text-text-sub-600">
              Type filtré
            </p>
            <p className="text-paragraph-sm text-text-strong-950">
              {input.blockType}
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
            Blocs récupérés
          </span>
        </div>
        <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
          <p className="mb-2 text-paragraph-xs text-text-sub-600">
            Aperçu des blocs
          </p>
          {output.length === 0 ? (
            <p className="text-paragraph-sm text-text-soft-600">
              Aucun bloc trouvé pour ce filtre.
            </p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto text-[11px] leading-relaxed text-text-soft-600">
              {output.map((block) => (
                <div
                  key={`${block.type}-${block.index}`}
                  className="rounded-md bg-bg-weak-50 p-2"
                >
                  <div className="mb-1 flex items-center justify-between text-paragraph-xs text-text-sub-600">
                    <span>Index: {block.index}</span>
                    <span>Type: {block.type}</span>
                  </div>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(block.attrs, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
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
            Récupération des blocs
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

export const GetAllBlocksTool = memo(GetAllBlocksToolComponent);
