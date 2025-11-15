import { Extension, textblockTypeInputRule } from "@tiptap/core";

export const MarkdownShortcuts = Extension.create({
  name: "markdownShortcuts",

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /^###\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 3 }),
      }),
      textblockTypeInputRule({
        find: /^##\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 2 }),
      }),
      textblockTypeInputRule({
        find: /^#\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 1 }),
      }),
    ];
  },
});
