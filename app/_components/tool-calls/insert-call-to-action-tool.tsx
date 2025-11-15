"use client";

import { memo } from "react";
import type { ChatUIMessage } from "@/server/routers/chat/types";

interface InsertCallToActionToolProps {
  part: Extract<
    ChatUIMessage["parts"][number],
    { type: "tool-insertCallToAction" }
  >;
}

function InsertCallToActionToolComponent({
  part,
}: InsertCallToActionToolProps) {
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
            Insertion d&apos;un Call to Action
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
            Insertion d&apos;un Call to Action
          </span>
        </div>
        <div className="space-y-3">
          {input.title && (
            <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
              <p className="mb-1 text-paragraph-xs text-text-sub-600">Titre</p>
              <p className="text-paragraph-sm text-text-strong-950">
                {input.title}
              </p>
            </div>
          )}
          {input.description && (
            <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
              <p className="mb-1 text-paragraph-xs text-text-sub-600">
                Description
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {input.description}
              </p>
            </div>
          )}
          {(input.buttonText || input.buttonLink) && (
            <div className="grid gap-3 md:grid-cols-2">
              {input.buttonText && (
                <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
                  <p className="mb-1 text-paragraph-xs text-text-sub-600">
                    Texte du bouton
                  </p>
                  <p className="text-paragraph-sm text-text-strong-950">
                    {input.buttonText}
                  </p>
                </div>
              )}
              {input.buttonLink && (
                <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
                  <p className="mb-1 text-paragraph-xs text-text-sub-600">
                    Lien du bouton
                  </p>
                  <p className="text-paragraph-sm text-text-strong-950">
                    {input.buttonLink}
                  </p>
                </div>
              )}
            </div>
          )}
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
            Call to Action inséré
          </span>
        </div>
        <p className="text-paragraph-sm text-success-600">
          Le bloc de Call to Action a été ajouté au document.
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
            Insertion d&apos;un Call to Action
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

export const InsertCallToActionTool = memo(InsertCallToActionToolComponent);
