import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { ResizableImageNode } from "./resizable-image-node";

export interface ImageOptions {
  inline: boolean;
  allowBase64: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: HTMLAttributes can contain various types
  HTMLAttributes: Record<string, any>;
}

export interface ImageAttributes {
  src: string;
  alt?: string;
  title?: string;
  align?: "left" | "center" | "right";
  width?: number;
  height?: number;
}

export const ResizableImageExtension = Node.create<ImageOptions>({
  name: "image",

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? "inline" : "block";
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      align: {
        default: "center",
        renderHTML: (attributes) => {
          if (!attributes.align) {
            return {};
          }
          return {
            "data-align": attributes.align,
          };
        },
        parseHTML: (element) => element.getAttribute("data-align") || "center",
      },
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
        parseHTML: (element) => {
          const width = element.getAttribute("width");
          if (!width) return null;
          const parsed = Number.parseInt(width, 10);
          return Number.isNaN(parsed) ? null : parsed;
        },
      },
      height: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
        parseHTML: (element) => {
          const height = element.getAttribute("height");
          if (!height) return null;
          const parsed = Number.parseInt(height, 10);
          return Number.isNaN(parsed) ? null : parsed;
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64
          ? "img[src]"
          : 'img[src]:not([src^="data:"])',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNode);
  },

  addCommands() {
    return {
      setImage:
        (options: ImageAttributes) =>
        ({
          commands,
        }: {
          commands: {
            insertContent: (content: {
              type: string;
              attrs: ImageAttributes;
            }) => boolean;
          };
        }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    } as never;
  },
});
