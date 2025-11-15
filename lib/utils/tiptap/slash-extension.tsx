import { type Editor, Extension } from "@tiptap/core";
import { Suggestion, type SuggestionOptions } from "@tiptap/suggestion";
import type { RefObject } from "react";

export interface SlashExtensionOptions {
  slashCommandRef: RefObject<{
    openMenu: (params: {
      editor: Editor;
      range: { from: number; to: number };
      query: string;
      clientRect: DOMRect | null;
    }) => void;
    closeMenu: () => void;
  }>;
}

export const SlashExtension = Extension.create<SlashExtensionOptions>({
  name: "slash",

  addOptions() {
    return {
      slashCommandRef: {
        current: {
          openMenu: () => {
            // no op
          },
          closeMenu: () => {
            // no op
          },
        },
      },
    };
  },

  addProseMirrorPlugins() {
    const { slashCommandRef } = this.options;

    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        startOfLine: true,
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          return $from.parentOffset <= 1;
        },
        render: () => {
          let isActive = false;

          return {
            onStart: (props) => {
              isActive = true;
              const rect = props.clientRect?.();
              slashCommandRef.current.openMenu({
                editor: props.editor,
                range: props.range,
                query: props.query || "",
                clientRect: rect || null,
              });
            },

            onUpdate: (props) => {
              if (!isActive) return;
              const rect = props.clientRect?.();
              slashCommandRef.current.openMenu({
                editor: props.editor,
                range: props.range,
                query: props.query || "",
                clientRect: rect || null,
              });
            },

            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                isActive = false;
                slashCommandRef.current.closeMenu();
                return true;
              }

              return false;
            },
            onExit: () => {
              isActive = false;
              slashCommandRef.current.closeMenu();
            },
          };
        },
      } as SuggestionOptions),
    ];
  },
});
