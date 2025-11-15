"use client";

import { RiCheckLine, RiStarFill, RiStarLine } from "@remixicon/react";
import { mergeAttributes, Node } from "@tiptap/core";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type React from "react";
import { cn } from "@/lib/utils";

export interface PricingCardOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pricingCard: {
      /**
       * Insert a pricing card block
       */
      insertPricingCard: (attrs?: {
        title?: string;
        price?: string;
        period?: string;
        features?: string[];
        highlighted?: boolean;
      }) => ReturnType;
    };
  }
}

const PricingCardComponent = ({
  node,
  updateAttributes,
  selected,
  editor,
}: NodeViewProps) => {
  const { title, price, period, features, highlighted } = node.attrs;
  const isEditable = editor.isEditable;

  const handleTitleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newTitle = e.currentTarget.textContent || "";
    if (newTitle !== title) {
      updateAttributes({ title: newTitle });
    }
  };

  const handlePriceBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newPrice = e.currentTarget.textContent || "";
    if (newPrice !== price) {
      updateAttributes({ price: newPrice });
    }
  };

  const handlePeriodBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newPeriod = e.currentTarget.textContent || "";
    if (newPeriod !== period) {
      updateAttributes({ period: newPeriod });
    }
  };

  const handleFeatureBlur = (
    index: number,
    e: React.FocusEvent<HTMLDivElement>,
  ) => {
    const newFeature = e.currentTarget.textContent || "";
    const newFeatures = [...(features || [])];
    if (newFeatures[index] !== newFeature) {
      newFeatures[index] = newFeature;
      updateAttributes({ features: newFeatures });
    }
  };

  const handleFeatureKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const newFeatures = [...(features || []), ""];
      updateAttributes({ features: newFeatures });
      // Focus the new feature
      setTimeout(() => {
        const nextInput = document.querySelector(
          `[data-feature-index="${newFeatures.length - 1}"]`,
        ) as HTMLElement;
        nextInput?.focus();
      }, 0);
    }
    if (e.key === "Backspace" && e.currentTarget.textContent === "") {
      e.preventDefault();
      const newFeatures = [...(features || [])];
      newFeatures.splice(index, 1);
      if (newFeatures.length === 0) {
        newFeatures.push("");
      }
      updateAttributes({ features: newFeatures });
    }
  };

  const addFeature = () => {
    const newFeatures = [...(features || []), ""];
    updateAttributes({ features: newFeatures });
    setTimeout(() => {
      const lastInput = document.querySelector(
        `[data-feature-index="${newFeatures.length - 1}"]`,
      ) as HTMLElement;
      lastInput?.focus();
    }, 0);
  };

  return (
    <NodeViewWrapper
      className="my-8 w-full transition-all"
      data-pricing-card
      contentEditable={false}
    >
      <div
        className={cn(
          "relative rounded-2xl border-2 p-8 shadow-regular-sm transition-all",
          highlighted
            ? "border-primary-base bg-linear-to-br from-primary-alpha-10 to-primary-alpha-5 shadow-button-important-focus"
            : selected
              ? "border-primary-base bg-bg-white-0 hover:shadow-regular-md"
              : "border-stroke-soft-200 bg-bg-white-0 hover:shadow-regular-md",
        )}
      >
        {/* Featured Badge */}
        {highlighted && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="rounded-full bg-primary-base px-4 py-1 text-label-xs font-medium text-white shadow-regular-xs">
              Featured
            </div>
          </div>
        )}

        {/* Toggle Featured Button */}
        {isEditable && (
          <button
            type="button"
            onClick={() => updateAttributes({ highlighted: !highlighted })}
            className={cn(
              "absolute right-4 top-4 rounded-lg p-2 transition-colors",
              highlighted
                ? "bg-primary-alpha-10 text-primary-base hover:bg-primary-alpha-16"
                : "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950",
            )}
            aria-label={highlighted ? "Remove featured" : "Mark as featured"}
          >
            {highlighted ? (
              <RiStarFill className="size-5" />
            ) : (
              <RiStarLine className="size-5" />
            )}
          </button>
        )}

        {/* Plan Title */}
        <div className="mb-6">
          {isEditable ? (
            <div
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              tabIndex={0}
              aria-label="Plan title"
              onBlur={handleTitleBlur}
              className={cn(
                "text-heading-md font-semibold text-text-strong-950 outline-none",
                !title && "text-text-sub-600",
              )}
              style={{ minHeight: "1.5rem" }}
              data-placeholder="Plan Name"
            >
              {title || ""}
            </div>
          ) : (
            <h3 className="text-heading-md font-semibold text-text-strong-950">
              {title || "Plan Name"}
            </h3>
          )}
        </div>

        {/* Price */}
        <div className="mb-6 flex items-baseline gap-2">
          {isEditable ? (
            <>
              <div
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                tabIndex={0}
                aria-label="Price"
                onBlur={handlePriceBlur}
                className={cn(
                  "text-heading-xl font-bold outline-none",
                  !price ? "text-text-sub-600" : "text-text-strong-950",
                )}
                style={{ minHeight: "2rem" }}
                data-placeholder="$0"
              >
                {price || ""}
              </div>
              <span className="text-paragraph-md text-text-sub-600">/</span>
              <div
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                tabIndex={0}
                aria-label="Period"
                onBlur={handlePeriodBlur}
                className={cn(
                  "text-paragraph-md outline-none",
                  !period ? "text-text-soft-400" : "text-text-sub-600",
                )}
                style={{ minHeight: "1.25rem" }}
                data-placeholder="month"
              >
                {period || ""}
              </div>
            </>
          ) : (
            <>
              <span className="text-heading-xl font-bold text-text-strong-950">
                {price || "$0"}
              </span>
              {period && (
                <>
                  <span className="text-paragraph-md text-text-sub-600">/</span>
                  <span className="text-paragraph-md text-text-sub-600">
                    {period}
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {/* Features List */}
        <div className="space-y-3">
          {(features && features.length > 0
            ? features
            : isEditable
              ? [""]
              : []
          ).map((feature: string, index: number) => (
            <div
              key={`feature-${index}-${feature.slice(0, 10)}`}
              className="flex items-start gap-3 text-paragraph-sm text-text-strong-950"
            >
              <RiCheckLine className="mt-0.5 size-5 shrink-0 text-primary-base" />
              {isEditable ? (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  role="textbox"
                  tabIndex={0}
                  aria-label={`Feature ${index + 1}`}
                  data-feature-index={index}
                  onBlur={(e) => handleFeatureBlur(index, e)}
                  onKeyDown={(e) => handleFeatureKeyDown(index, e)}
                  className={cn(
                    "flex-1 outline-none",
                    !feature && "text-text-sub-600",
                  )}
                  style={{ minHeight: "1.25rem" }}
                  data-placeholder={`Feature ${index + 1}`}
                >
                  {feature || ""}
                </div>
              ) : (
                <span>{feature}</span>
              )}
            </div>
          ))}
          {isEditable && (
            <button
              type="button"
              onClick={addFeature}
              className="mt-2 flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-stroke-soft-200 bg-transparent px-4 py-2 text-sm font-medium text-text-sub-600 transition-colors hover:border-primary-base hover:bg-primary-alpha-5 hover:text-primary-base"
            >
              <span>+</span>
              <span>Add Feature</span>
            </button>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const PricingCard = Node.create<PricingCardOptions>({
  name: "pricingCard",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      title: {
        default: "Standard Plan",
        parseHTML: (element) => element.getAttribute("data-title"),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }
          return {
            "data-title": attributes.title,
          };
        },
      },
      price: {
        default: "$49",
        parseHTML: (element) => element.getAttribute("data-price"),
        renderHTML: (attributes) => {
          if (!attributes.price) {
            return {};
          }
          return {
            "data-price": attributes.price,
          };
        },
      },
      period: {
        default: "month",
        parseHTML: (element) => element.getAttribute("data-period"),
        renderHTML: (attributes) => {
          if (!attributes.period) {
            return {};
          }
          return {
            "data-period": attributes.period,
          };
        },
      },
      features: {
        default: [],
        parseHTML: (element) => {
          const featuresAttr = element.getAttribute("data-features");
          return featuresAttr ? JSON.parse(featuresAttr) : [];
        },
        renderHTML: (attributes) => {
          if (!attributes.features || attributes.features.length === 0) {
            return {};
          }
          return {
            "data-features": JSON.stringify(attributes.features),
          };
        },
      },
      highlighted: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute("data-highlighted") === "true",
        renderHTML: (attributes) => {
          if (!attributes.highlighted) {
            return {};
          }
          return {
            "data-highlighted": "true",
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-pricing-card]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-pricing-card": "",
        class: "draggable-block",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PricingCardComponent);
  },

  addCommands() {
    return {
      insertPricingCard:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              title: attrs?.title || "Standard Plan",
              price: attrs?.price || "$49",
              period: attrs?.period || "month",
              features: attrs?.features || [
                "Feature 1",
                "Feature 2",
                "Feature 3",
              ],
              highlighted: attrs?.highlighted || false,
            },
          });
        },
    };
  },
});
