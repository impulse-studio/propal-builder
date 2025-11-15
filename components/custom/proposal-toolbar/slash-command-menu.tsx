"use client";

import {
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiCodeSLine,
  RiDoubleQuotesL,
  RiH1,
  RiH2,
  RiH3,
  RiListOrdered,
  RiListUnordered,
  RiPriceTag3Line,
  RiSeparator,
  RiTextBlock,
} from "@remixicon/react";
import type { Editor } from "@tiptap/react";
import React, { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

export interface SlashCommandItem {
  title: string;
  description: string;
  searchTerms: string[];
  icon: React.ReactNode;
  command: (props: {
    editor: Editor;
    range: { from: number; to: number };
  }) => void;
}

interface SlashCommandMenuProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  editor: Editor;
  onClose: () => void;
}

export const SlashCommandMenu = React.memo(
  ({ items, command, onClose }: SlashCommandMenuProps) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      setSelectedIndex((prev) =>
        items.length > 0 ? Math.min(prev, items.length - 1) : 0,
      );
    }, [items.length]);

    const scrollToItem = useCallback((index: number) => {
      const item = itemRefs.current[index];
      const container = containerRef.current;

      if (item && container) {
        const itemRect = item.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        if (itemRect.top < containerRect.top) {
          item.scrollIntoView({ block: "start", behavior: "smooth" });
        } else if (itemRect.bottom > containerRect.bottom) {
          item.scrollIntoView({ block: "end", behavior: "smooth" });
        }
      }
    }, []);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [command, items],
    );

    React.useEffect(() => {
      const navigationHandler = (e: KeyboardEvent) => {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          e.stopPropagation();
          const newIndex = (selectedIndex - 1 + items.length) % items.length;
          setSelectedIndex(newIndex);
          scrollToItem(newIndex);
          return true;
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          e.stopPropagation();
          const newIndex = (selectedIndex + 1) % items.length;
          setSelectedIndex(newIndex);
          scrollToItem(newIndex);
          return true;
        }

        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          if (items.length > 0) {
            selectItem(selectedIndex);
          }
          return true;
        }

        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          onClose?.();
          return true;
        }

        return false;
      };

      document.addEventListener("keydown", navigationHandler, true);
      return () => {
        document.removeEventListener("keydown", navigationHandler, true);
      };
    }, [items.length, selectedIndex, selectItem, onClose, scrollToItem]);

    return (
      <div
        className={cn(
          "z-50 min-w-[320px] overflow-hidden",
          "rounded-20 bg-bg-white-0",
          "border border-stroke-soft-200",
          "shadow-regular-sm",
          "flex max-h-[400px] flex-col",
        )}
      >
        <div className="flex-1 overflow-y-auto p-2" ref={containerRef}>
          {items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-paragraph-sm text-text-soft-400">
                No commands found
              </p>
            </div>
          ) : (
            items.map((item, index) => (
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-10 px-3 py-2.5",
                  "text-left transition-all duration-150",
                  "hover:bg-bg-weak-50",
                  index === selectedIndex && "bg-bg-weak-50",
                )}
                key={item.title}
                onClick={() => selectItem(index)}
                onMouseEnter={() => setSelectedIndex(index)}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-10",
                    "bg-bg-white-0",
                    "border border-stroke-soft-200",
                    index === selectedIndex && "border-primary-base",
                  )}
                >
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-paragraph-sm text-text-strong-950">
                    {item.title}
                  </div>
                  <div className="truncate text-paragraph-xs text-text-soft-400">
                    {item.description}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="border-stroke-soft-200 border-t px-4 py-2">
          <p className="text-label-xs text-text-soft-400">
            <span className="text-text-sub-600">↑↓</span> Navigate
            <span className="mx-2">·</span>
            <span className="text-text-sub-600">↵</span> Select
            <span className="mx-2">·</span>
            <span className="text-text-sub-600">esc</span> Cancel
          </p>
        </div>
      </div>
    );
  },
);

SlashCommandMenu.displayName = "SlashCommandMenu";

export const createSlashCommands = (
  editor: Editor | null,
): SlashCommandItem[] => {
  if (!editor) return [];

  return [
    {
      title: "Paragraph",
      description: "Insert plain text paragraph",
      searchTerms: ["paragraph", "text", "p"],
      icon: <RiTextBlock className="size-4 text-text-sub-600" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: "Heading 1",
      description: "Insert H1 heading",
      searchTerms: ["heading", "h1", "title"],
      icon: <RiH1 className="size-4 text-text-sub-600" />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 1 })
          .run();
      },
    },
    {
      title: "Heading 2",
      description: "Insert H2 heading",
      searchTerms: ["heading", "h2", "subtitle"],
      icon: <RiH2 className="size-4 text-text-sub-600" />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 2 })
          .run();
      },
    },
    {
      title: "Heading 3",
      description: "Insert H3 heading",
      searchTerms: ["heading", "h3", "subheading"],
      icon: <RiH3 className="size-4 text-text-sub-600" />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 3 })
          .run();
      },
    },
    {
      title: "Bullet List",
      description: "Insert unordered list",
      searchTerms: ["bullet", "list", "ul", "unordered"],
      icon: <RiListUnordered className="size-4 text-text-sub-600" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Numbered List",
      description: "Insert ordered list",
      searchTerms: ["number", "ordered", "list", "ol"],
      icon: <RiListOrdered className="size-4 text-text-sub-600" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "Quote",
      description: "Insert blockquote",
      searchTerms: ["quote", "blockquote"],
      icon: <RiDoubleQuotesL className="size-4 text-text-sub-600" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: "Code Block",
      description: "Insert code block",
      searchTerms: ["code", "block", "snippet"],
      icon: <RiCodeSLine className="size-4 text-text-sub-600" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: "Divider",
      description: "Insert horizontal rule",
      searchTerms: ["divider", "separator", "hr", "line"],
      icon: <RiSeparator className="size-4 text-text-sub-600" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      title: "Pricing Card",
      description: "Insert a pricing card block",
      searchTerms: ["pricing", "card", "price"],
      icon: <RiPriceTag3Line className="size-4 text-text-sub-600" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertPricingCard().run();
      },
    },
    {
      title: "Feature List",
      description: "Insert a feature list block",
      searchTerms: ["feature", "list", "features"],
      icon: <RiCheckboxCircleLine className="size-4 text-text-sub-600" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertFeatureList().run();
      },
    },
    {
      title: "Call to Action",
      description: "Insert a call to action block",
      searchTerms: ["cta", "call", "action", "button"],
      icon: <RiArrowRightLine className="size-4 text-text-sub-600" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertCallToAction().run();
      },
    },
  ];
};

export const useSlashCommands = (
  editor: Editor | null | undefined = null,
): SlashCommandItem[] => {
  return React.useMemo(() => createSlashCommands(editor ?? null), [editor]);
};
