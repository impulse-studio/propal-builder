"use client";

import { RiCheckboxCircleLine } from "@remixicon/react";
import { mergeAttributes, Node } from "@tiptap/core";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type React from "react";
import { cn } from "@/lib/utils";

export interface FeatureListOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    featureList: {
      /**
       * Insert a feature list block
       */
      insertFeatureList: (attrs?: {
        title?: string;
        features?: string[];
      }) => ReturnType;
    };
  }
}

const FeatureListComponent = ({
  node,
  updateAttributes,
  selected,
  editor,
}: NodeViewProps) => {
  const { title, features } = node.attrs;
  const isEditable = editor.isEditable;

  const handleTitleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newTitle = e.currentTarget.textContent || "";
    if (newTitle !== title) {
      updateAttributes({ title: newTitle });
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
      className="group relative my-8 w-full transition-all"
      data-feature-list
      contentEditable={false}
    >
      <div
        className={cn(
          "rounded-2xl border p-8 shadow-regular-sm transition-all hover:shadow-regular-md",
          selected
            ? "border-primary-base bg-bg-white-0"
            : "border-stroke-soft-200 bg-bg-white-0",
        )}
      >
        <div className="space-y-6">
          {/* Title */}
          {isEditable ? (
            <div
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              tabIndex={0}
              aria-label="Section title"
              onBlur={handleTitleBlur}
              className={cn(
                "text-heading-md font-semibold outline-none",
                !title ? "text-text-sub-600" : "text-text-strong-950",
              )}
              style={{ minHeight: "1.75rem" }}
              data-placeholder="Section Title"
            >
              {title || ""}
            </div>
          ) : (
            title && (
              <h3 className="text-heading-md font-semibold text-text-strong-950">
                {title}
              </h3>
            )
          )}

          {/* Features List */}
          <div className="space-y-4">
            {(features && features.length > 0
              ? features
              : isEditable
                ? [""]
                : []
            ).map((feature: string, index: number) => (
              <div
                key={`feature-${index}-${feature.slice(0, 10)}`}
                className="flex items-start gap-4 text-paragraph-md text-text-strong-950"
              >
                <RiCheckboxCircleLine className="mt-0.5 size-6 shrink-0 text-primary-base" />
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
                    style={{ minHeight: "1.5rem" }}
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
                className="mt-2 flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-stroke-soft-200 bg-transparent px-4 py-3 text-sm font-medium text-text-sub-600 transition-colors hover:border-primary-base hover:bg-primary-alpha-5 hover:text-primary-base"
              >
                <span>+</span>
                <span>Add Feature</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const FeatureList = Node.create<FeatureListOptions>({
  name: "featureList",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      title: {
        default: "",
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
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-feature-list]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-feature-list": "",
        class: "draggable-block",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FeatureListComponent);
  },

  addCommands() {
    return {
      insertFeatureList:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              title: attrs?.title || "",
              features: attrs?.features || [
                "Feature 1",
                "Feature 2",
                "Feature 3",
              ],
            },
          });
        },
    };
  },
});
