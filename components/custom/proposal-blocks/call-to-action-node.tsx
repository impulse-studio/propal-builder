"use client";

import { RiArrowRightLine } from "@remixicon/react";
import { mergeAttributes, Node } from "@tiptap/core";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type React from "react";
import { cn } from "@/lib/utils";

export interface CallToActionOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callToAction: {
      /**
       * Insert a call-to-action block
       */
      insertCallToAction: (attrs?: {
        title?: string;
        description?: string;
        buttonText?: string;
        buttonLink?: string;
      }) => ReturnType;
    };
  }
}

const CallToActionComponent = ({
  node,
  updateAttributes,
  selected,
  editor,
}: NodeViewProps) => {
  const { title, description, buttonText, buttonLink } = node.attrs;
  const isEditable = editor.isEditable;

  const handleTitleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newTitle = e.currentTarget.textContent || "";
    if (newTitle !== title) {
      updateAttributes({ title: newTitle });
    }
  };

  const handleDescriptionBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newDescription = e.currentTarget.textContent || "";
    if (newDescription !== description) {
      updateAttributes({ description: newDescription });
    }
  };

  const handleButtonTextBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newButtonText = e.currentTarget.textContent || "";
    if (newButtonText !== buttonText) {
      updateAttributes({ buttonText: newButtonText });
    }
  };

  const handleButtonLinkBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newButtonLink = e.currentTarget.textContent || "";
    if (newButtonLink !== buttonLink) {
      updateAttributes({ buttonLink: newButtonLink });
    }
  };

  return (
    <NodeViewWrapper
      className="my-8 w-full transition-all"
      data-call-to-action
      contentEditable={false}
    >
      <div
        className={cn(
          "rounded-2xl border p-10 text-center shadow-regular-sm transition-all",
          selected
            ? "border-primary-base bg-linear-to-br from-primary-alpha-10 via-primary-alpha-5 to-primary-alpha-10 hover:shadow-regular-md"
            : "border-stroke-soft-200 bg-linear-to-br from-primary-alpha-10 via-primary-alpha-5 to-primary-alpha-10 hover:shadow-regular-md",
        )}
      >
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Title */}
          {isEditable ? (
            <div
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              tabIndex={0}
              aria-label="Call to action title"
              onBlur={handleTitleBlur}
              className={cn(
                "text-heading-lg font-semibold outline-none",
                !title ? "text-text-sub-600" : "text-text-strong-950",
              )}
              style={{ minHeight: "2rem" }}
              data-placeholder="Call to Action Title"
            >
              {title || ""}
            </div>
          ) : (
            title && (
              <h3 className="text-heading-lg font-semibold text-text-strong-950">
                {title}
              </h3>
            )
          )}

          {/* Description */}
          {isEditable ? (
            <div
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              tabIndex={0}
              aria-label="Description"
              onBlur={handleDescriptionBlur}
              className={cn(
                "mx-auto max-w-lg text-paragraph-md outline-none",
                !description ? "text-text-soft-400" : "text-text-sub-600",
              )}
              style={{ minHeight: "1.5rem" }}
              data-placeholder="Description text"
            >
              {description || ""}
            </div>
          ) : (
            description && (
              <p className="mx-auto max-w-lg text-paragraph-md text-text-sub-600">
                {description}
              </p>
            )
          )}

          {/* Button */}
          <div className="flex items-center justify-center">
            {isEditable ? (
              <div className="inline-flex items-center gap-2 rounded-lg bg-primary-base px-8 py-4 text-label-sm font-medium text-white shadow-regular-xs transition-all hover:bg-primary-dark hover:shadow-regular-sm">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  role="textbox"
                  tabIndex={0}
                  aria-label="Button text"
                  onBlur={handleButtonTextBlur}
                  className={cn("outline-none", !buttonText && "text-white/70")}
                  style={{ minHeight: "1.25rem" }}
                  data-placeholder="Button Text"
                >
                  {buttonText || ""}
                </div>
                <RiArrowRightLine className="size-4 shrink-0" />
              </div>
            ) : (
              buttonText && (
                <a
                  href={buttonLink || "#"}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-base px-8 py-4 text-label-sm font-medium text-white shadow-regular-xs transition-all hover:bg-primary-dark hover:shadow-regular-sm"
                >
                  {buttonText}
                  <RiArrowRightLine className="size-4" />
                </a>
              )
            )}
          </div>

          {/* Link URL (shown only in edit mode) */}
          {isEditable && (
            <div className="mt-2 text-center">
              <div className="inline-flex items-center gap-2 text-paragraph-xs text-text-sub-600">
                <span>Link:</span>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  role="textbox"
                  tabIndex={0}
                  aria-label="Button link"
                  onBlur={handleButtonLinkBlur}
                  className={cn(
                    "outline-none underline",
                    !buttonLink ? "text-text-soft-400" : "text-primary-base",
                  )}
                  style={{ minHeight: "1rem" }}
                  data-placeholder="#"
                >
                  {buttonLink || ""}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const CallToAction = Node.create<CallToActionOptions>({
  name: "callToAction",

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
      description: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-description"),
        renderHTML: (attributes) => {
          if (!attributes.description) {
            return {};
          }
          return {
            "data-description": attributes.description,
          };
        },
      },
      buttonText: {
        default: "Get Started",
        parseHTML: (element) => element.getAttribute("data-button-text"),
        renderHTML: (attributes) => {
          if (!attributes.buttonText) {
            return {};
          }
          return {
            "data-button-text": attributes.buttonText,
          };
        },
      },
      buttonLink: {
        default: "#",
        parseHTML: (element) => element.getAttribute("data-button-link"),
        renderHTML: (attributes) => {
          if (!attributes.buttonLink) {
            return {};
          }
          return {
            "data-button-link": attributes.buttonLink,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-call-to-action]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-call-to-action": "",
        class: "draggable-block",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CallToActionComponent);
  },

  addCommands() {
    return {
      insertCallToAction:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              title: attrs?.title || "Ready to get started?",
              description:
                attrs?.description ||
                "Join thousands of satisfied customers today.",
              buttonText: attrs?.buttonText || "Get Started",
              buttonLink: attrs?.buttonLink || "#",
            },
          });
        },
    };
  },
});
