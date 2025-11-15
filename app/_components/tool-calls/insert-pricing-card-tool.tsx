"use client";

import { memo } from "react";
import type { ChatUIMessage } from "@/server/routers/chat/types";

interface InsertPricingCardToolProps {
  part: Extract<
    ChatUIMessage["parts"][number],
    { type: "tool-insertPricingCard" }
  >;
}

function InsertPricingCardToolComponent({ part }: InsertPricingCardToolProps) {
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
            Insertion d&apos;un bloc Pricing
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
            Insertion d&apos;un bloc Pricing
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
          {(input.price || input.period) && (
            <div className="grid gap-3 md:grid-cols-2">
              {input.price && (
                <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
                  <p className="mb-1 text-paragraph-xs text-text-sub-600">
                    Prix
                  </p>
                  <p className="text-paragraph-sm text-text-strong-950">
                    {input.price}
                  </p>
                </div>
              )}
              {input.period && (
                <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
                  <p className="mb-1 text-paragraph-xs text-text-sub-600">
                    Période
                  </p>
                  <p className="text-paragraph-sm text-text-strong-950">
                    {input.period}
                  </p>
                </div>
              )}
            </div>
          )}
          {Array.isArray(input.features) && input.features.length > 0 && (
            <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
              <p className="mb-2 text-paragraph-xs text-text-sub-600">
                Fonctionnalités
              </p>
              <ul className="list-disc space-y-1 pl-4 text-paragraph-sm text-text-strong-950">
                {input.features.map((feature, index) => (
                  <li key={`${feature}-${index}`}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          {input.highlighted && (
            <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
              <p className="text-paragraph-xs text-text-sub-600">
                Ce plan sera mis en avant
              </p>
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
            Bloc Pricing inséré
          </span>
        </div>
        <p className="text-paragraph-sm text-success-600">
          Le bloc de pricing a été ajouté au document.
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
            Insertion d&apos;un bloc Pricing
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

export const InsertPricingCardTool = memo(InsertPricingCardToolComponent);


