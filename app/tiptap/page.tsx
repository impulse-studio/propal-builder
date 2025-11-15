"use client";

import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { ProposalToolbar } from "@/components/custom/proposal-toolbar";
import { MarkdownShortcuts } from "@/components/custom/proposal-toolbar/markdown-shortcuts";
import { cn } from "@/lib/utils";

export default function TiptapPage() {
  const [content, setContent] = useState("");

  const editor = useEditor({
    content: content || "",
    immediatelyRender: false,
    editable: true,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        emptyEditorClass: "is-editor-empty",
        showOnlyWhenEditable: false,
        placeholder: "Start writing your proposal...",
      }),
      Highlight,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Typography,
      MarkdownShortcuts,
    ],
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm focus:outline-none min-h-[400px] text-text-strong-950 dark:prose-invert",
          "prose-headings:font-semibold prose-headings:text-text-strong-950 prose-headings:mt-6 prose-headings:mb-4",
          "prose-h1:text-heading-lg prose-h1:font-semibold prose-h1:mt-8 prose-h1:mb-4",
          "prose-h2:text-heading-md prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3",
          "prose-h3:text-heading-sm prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-2",
          "prose-p:text-paragraph-sm prose-p:text-text-strong-950 prose-p:leading-relaxed prose-p:my-2",
          "prose-ul:text-text-strong-950 prose-ol:text-text-strong-950",
          "prose-blockquote:text-text-sub-600 prose-blockquote:border-l-stroke-soft-200",
          "prose-a:text-primary-base prose-a:no-underline hover:prose-a:underline",
        ),
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Proposal editor",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setContent(currentEditor.getHTML());
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-bg-weak-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-heading-lg font-semibold text-text-strong-950">
            Proposal Builder
          </h1>
          <p className="mt-2 text-paragraph-sm text-text-sub-600">
            Create and edit your proposal with rich text formatting
          </p>
        </div>

        <div
          className={cn(
            "flex w-full flex-col rounded-xl bg-bg-white-0 pb-4 shadow-regular-xs",
            "ring-1 ring-stroke-soft-200 ring-inset transition duration-200 ease-out",
            "focus-within:shadow-button-important-focus focus-within:ring-stroke-strong-950",
          )}
        >
          {/* Toolbar */}
          <div className="border-b border-stroke-soft-200 p-3">
            <ProposalToolbar editor={editor} />
          </div>

          {/* Editor Content */}
          <div
            className={cn(
              "block w-full resize-none text-paragraph-sm text-text-strong-950 outline-none",
              "pointer-events-auto min-h-[400px] bg-transparent px-6 pt-6",
              "overflow-auto",
            )}
          >
            <EditorContent className="editor-content" editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
