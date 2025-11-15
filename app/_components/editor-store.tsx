"use client";

import type { Editor } from "@tiptap/react";
import { createContext, useCallback, useContext, useState } from "react";

interface EditorStoreState {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  getContent: () => string;
  getJSON: () => Record<string, unknown> | null;
  setJSON: (json: Record<string, unknown>) => void;
  applyEdit: (command: (editor: Editor) => void) => void;
  insertContent: (content: string) => void;
  replaceContent: (content: string) => void;
  findAndReplace: (
    searchText: string,
    replaceWith: string,
    replaceAll?: boolean,
  ) => void;
  insertAtPosition: (
    position: "start" | "end" | "after" | "before",
    content: string,
    anchorText?: string,
  ) => void;
  replaceSection: (
    startText: string,
    endText: string | undefined,
    newContent: string,
  ) => void;
  deleteText: (textToDelete: string, deleteAll?: boolean) => void;
  // Custom blocks
  insertPricingCard: (attrs?: {
    title?: string;
    price?: string;
    period?: string;
    features?: string[];
    highlighted?: boolean;
  }) => void;
  insertFeatureList: (attrs?: { title?: string; features?: string[] }) => void;
  insertCallToAction: (attrs?: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
  }) => void;
  updateBlock: (nodeIndex: number, attrs: Record<string, unknown>) => void;
  deleteBlock: (nodeIndex: number) => void;
  getBlock: (nodeIndex: number) => Record<string, unknown> | null;
  getAllBlocks: (
    blockType?: string,
  ) => Array<{ index: number; type: string; attrs: Record<string, unknown> }>;
  setHeading: (level: 1 | 2 | 3) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  insertBulletList: () => void;
  insertOrderedList: () => void;
  insertBlockquote: () => void;
  insertCodeBlock: () => void;
  insertHorizontalRule: () => void;
  insertLink: (url: string, text?: string) => void;
  insertImage: (url: string, alt?: string) => void;
}

const EditorStoreContext = createContext<EditorStoreState | undefined>(
  undefined,
);

export function EditorStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [editor, setEditor] = useState<Editor | null>(null);

  const applyEdit = useCallback(
    (command: (editor: Editor) => void) => {
      if (!editor) return;

      // Schedule the editor command outside of the current React lifecycle
      // to avoid flushSync warnings when commands are triggered from effects.
      setTimeout(() => {
        if (!editor || editor.isDestroyed) return;
        command(editor);
      }, 0);
    },
    [editor],
  );

  const insertContent = useCallback(
    (content: string) => {
      applyEdit((editor) => {
        editor.commands.insertContent(content);
      });
    },
    [applyEdit],
  );

  const replaceContent = useCallback(
    (content: string) => {
      applyEdit((editor) => {
        editor.commands.setContent(content);
      });
    },
    [applyEdit],
  );

  const setHeading = useCallback(
    (level: 1 | 2 | 3) => {
      applyEdit((editor) => {
        editor.commands.toggleHeading({ level });
      });
    },
    [applyEdit],
  );

  const toggleBold = useCallback(() => {
    applyEdit((editor) => {
      editor.commands.toggleBold();
    });
  }, [applyEdit]);

  const toggleItalic = useCallback(() => {
    applyEdit((editor) => {
      editor.commands.toggleItalic();
    });
  }, [applyEdit]);

  const toggleUnderline = useCallback(() => {
    applyEdit((editor) => {
      editor.commands.toggleUnderline();
    });
  }, [applyEdit]);

  const insertBulletList = useCallback(() => {
    applyEdit((editor) => {
      editor.commands.toggleBulletList();
    });
  }, [applyEdit]);

  const insertOrderedList = useCallback(() => {
    applyEdit((editor) => {
      editor.commands.toggleOrderedList();
    });
  }, [applyEdit]);

  const insertBlockquote = useCallback(() => {
    applyEdit((editor) => {
      editor.commands.toggleBlockquote();
    });
  }, [applyEdit]);

  const insertCodeBlock = useCallback(() => {
    applyEdit((editor) => {
      editor.commands.toggleCodeBlock();
    });
  }, [applyEdit]);

  const insertHorizontalRule = useCallback(() => {
    applyEdit((editor) => {
      editor.commands.setHorizontalRule();
    });
  }, [applyEdit]);

  const insertLink = useCallback(
    (url: string, text?: string) => {
      applyEdit((editor) => {
        if (text) {
          editor.commands.insertContent(`<a href="${url}">${text}</a>`);
        } else {
          editor.commands.setLink({ href: url });
        }
      });
    },
    [applyEdit],
  );

  const insertImage = useCallback(
    (url: string, alt?: string) => {
      applyEdit((editor) => {
        (
          editor.commands as unknown as {
            setImage?: (options: { src: string; alt?: string }) => void;
          }
        ).setImage?.({
          src: url,
          alt: alt || "",
        });
      });
    },
    [applyEdit],
  );

  const getContent = useCallback(() => {
    return editor?.getHTML() || "";
  }, [editor]);

  const getJSON = useCallback(() => {
    return editor?.getJSON() || null;
  }, [editor]);

  const setJSON = useCallback(
    (json: Record<string, unknown>) => {
      applyEdit((editor) => {
        editor.commands.setContent(json);
      });
    },
    [applyEdit],
  );

  const findAndReplace = useCallback(
    (searchText: string, replaceWith: string, replaceAll = false) => {
      applyEdit((editor) => {
        const html = editor.getHTML();
        if (!html.includes(searchText)) return;

        let newContent = html;
        if (replaceAll) {
          newContent = html.replaceAll(searchText, replaceWith);
        } else {
          newContent = html.replace(searchText, replaceWith);
        }

        editor.commands.setContent(newContent);
      });
    },
    [applyEdit],
  );

  const insertAtPosition = useCallback(
    (
      position: "start" | "end" | "after" | "before",
      content: string,
      anchorText?: string,
    ) => {
      applyEdit((editor) => {
        const html = editor.getHTML();

        if (position === "start") {
          editor.commands.setContent(content + html);
        } else if (position === "end") {
          editor.commands.setContent(html + content);
        } else if (position === "after" && anchorText) {
          const index = html.indexOf(anchorText);
          if (index !== -1) {
            const before = html.slice(0, index + anchorText.length);
            const after = html.slice(index + anchorText.length);
            editor.commands.setContent(before + content + after);
          }
        } else if (position === "before" && anchorText) {
          const index = html.indexOf(anchorText);
          if (index !== -1) {
            const before = html.slice(0, index);
            const after = html.slice(index);
            editor.commands.setContent(before + content + after);
          }
        }
      });
    },
    [applyEdit],
  );

  const replaceSection = useCallback(
    (startText: string, endText: string | undefined, newContent: string) => {
      applyEdit((editor) => {
        const html = editor.getHTML();
        const startIndex = html.indexOf(startText);
        if (startIndex === -1) return;

        let endIndex: number;
        if (endText) {
          endIndex = html.indexOf(endText, startIndex + startText.length);
          if (endIndex === -1) {
            endIndex = html.length;
          } else {
            endIndex += endText.length;
          }
        } else {
          endIndex = html.length;
        }

        const before = html.slice(0, startIndex);
        const after = html.slice(endIndex);
        editor.commands.setContent(before + newContent + after);
      });
    },
    [applyEdit],
  );

  const deleteText = useCallback(
    (textToDelete: string, deleteAll = false) => {
      applyEdit((editor) => {
        const { state } = editor;
        const { doc } = state;
        const fullText = doc.textContent;

        if (!fullText.includes(textToDelete)) {
          console.warn(`Text "${textToDelete}" not found in document`);
          return;
        }

        // Build a mapping from plain text index to document position
        // by iterating through all text nodes
        const textPositions: number[] = [];
        let plainTextIndex = 0;

        doc.descendants((node, pos) => {
          if (node.isText) {
            for (let i = 0; i < node.textContent.length; i++) {
              textPositions[plainTextIndex + i] = pos + 1 + i; // +1 to skip the node start
            }
            plainTextIndex += node.textContent.length;
          }
          return true;
        });

        // Find all occurrences in plain text and map to document positions
        const ranges: Array<{ from: number; to: number }> = [];
        let searchIndex = 0;

        while (searchIndex < fullText.length) {
          const index = fullText.indexOf(textToDelete, searchIndex);
          if (index === -1) break;

          const from = textPositions[index];
          const to = textPositions[index + textToDelete.length - 1] + 1;

          if (from !== undefined && to !== undefined) {
            ranges.push({ from, to });
          }

          searchIndex = index + 1;
          if (!deleteAll) break;
        }

        if (ranges.length === 0) {
          console.warn(`Could not find text "${textToDelete}" in document`);
          return;
        }

        // Delete ranges in reverse order to maintain correct positions
        let chain = editor.chain().focus();
        for (let i = ranges.length - 1; i >= 0; i--) {
          chain = chain.deleteRange({
            from: ranges[i].from,
            to: ranges[i].to,
          });
        }
        chain.run();
      });
    },
    [applyEdit],
  );

  const insertPricingCard = useCallback(
    (attrs?: {
      title?: string;
      price?: string;
      period?: string;
      features?: string[];
      highlighted?: boolean;
    }) => {
      applyEdit((editor) => {
        editor.chain().focus().insertPricingCard(attrs).run();
      });
    },
    [applyEdit],
  );

  const insertFeatureList = useCallback(
    (attrs?: { title?: string; features?: string[] }) => {
      applyEdit((editor) => {
        editor.chain().focus().insertFeatureList(attrs).run();
      });
    },
    [applyEdit],
  );

  const insertCallToAction = useCallback(
    (attrs?: {
      title?: string;
      description?: string;
      buttonText?: string;
      buttonLink?: string;
    }) => {
      applyEdit((editor) => {
        editor.chain().focus().insertCallToAction(attrs).run();
      });
    },
    [applyEdit],
  );

  const updateBlock = useCallback(
    (nodeIndex: number, attrs: Record<string, unknown>) => {
      applyEdit((editor) => {
        const { state } = editor;
        const { doc } = state;

        // Find the node at the given index
        let currentIndex = 0;
        let targetPos: number | null = null;

        doc.descendants((_node, pos) => {
          if (currentIndex === nodeIndex) {
            targetPos = pos;
            return false; // Stop iteration
          }
          currentIndex++;
          return true;
        });

        if (targetPos !== null) {
          const pos = targetPos;
          editor
            .chain()
            .focus()
            .command(({ tr, state }) => {
              const node = state.doc.nodeAt(pos);
              if (node) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  ...attrs,
                });
              }
              return true;
            })
            .run();
        }
      });
    },
    [applyEdit],
  );

  const deleteBlock = useCallback(
    (nodeIndex: number) => {
      applyEdit((editor) => {
        const { state } = editor;
        const { doc } = state;

        // Find the node at the given index
        let currentIndex = 0;
        let targetPos: number | null = null;

        doc.descendants((_node, pos) => {
          if (currentIndex === nodeIndex) {
            targetPos = pos;
            return false; // Stop iteration
          }
          currentIndex++;
          return true;
        });

        if (targetPos !== null) {
          const node = doc.nodeAt(targetPos);
          if (node) {
            editor
              .chain()
              .focus()
              .deleteRange({ from: targetPos, to: targetPos + node.nodeSize })
              .run();
          }
        }
      });
    },
    [applyEdit],
  );

  const getBlock = useCallback(
    (nodeIndex: number): Record<string, unknown> | null => {
      if (!editor) return null;

      const { state } = editor;
      const { doc } = state;

      // Find the node at the given index
      let currentIndex = 0;
      let targetNode: unknown = null;

      doc.descendants((node) => {
        if (currentIndex === nodeIndex) {
          targetNode = {
            type: node.type.name,
            attrs: node.attrs,
            content: node.content.toJSON(),
          };
          return false; // Stop iteration
        }
        currentIndex++;
        return true;
      });

      return targetNode as Record<string, unknown> | null;
    },
    [editor],
  );

  const getAllBlocks = useCallback(
    (
      blockType?: string,
    ): Array<{
      index: number;
      type: string;
      attrs: Record<string, unknown>;
    }> => {
      if (!editor) return [];

      const { state } = editor;
      const { doc } = state;

      const blocks: Array<{
        index: number;
        type: string;
        attrs: Record<string, unknown>;
      }> = [];
      let currentIndex = 0;

      doc.descendants((node) => {
        if (!blockType || node.type.name === blockType) {
          blocks.push({
            index: currentIndex,
            type: node.type.name,
            attrs: node.attrs,
          });
        }
        currentIndex++;
        return true;
      });

      return blocks;
    },
    [editor],
  );

  return (
    <EditorStoreContext.Provider
      value={{
        editor,
        setEditor,
        getContent,
        getJSON,
        setJSON,
        applyEdit,
        insertContent,
        replaceContent,
        findAndReplace,
        insertAtPosition,
        replaceSection,
        deleteText,
        insertPricingCard,
        insertFeatureList,
        insertCallToAction,
        updateBlock,
        deleteBlock,
        getBlock,
        getAllBlocks,
        setHeading,
        toggleBold,
        toggleItalic,
        toggleUnderline,
        insertBulletList,
        insertOrderedList,
        insertBlockquote,
        insertCodeBlock,
        insertHorizontalRule,
        insertLink,
        insertImage,
      }}
    >
      {children}
    </EditorStoreContext.Provider>
  );
}

export function useEditorStore() {
  const context = useContext(EditorStoreContext);
  if (!context) {
    throw new Error("useEditorStore must be used within EditorStoreProvider");
  }
  return context;
}
