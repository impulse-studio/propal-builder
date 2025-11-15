"use client";

import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import {
  CallToAction,
  FeatureList,
  PricingCard,
} from "@/components/custom/proposal-blocks";
import { ProposalToolbar } from "@/components/custom/proposal-toolbar";
import { MarkdownShortcuts } from "@/components/custom/proposal-toolbar/markdown-shortcuts";
import {
  Cmd as SlashCmd,
  Root as SlashCmdRoot,
  useSlashCommandExtension,
} from "@/components/custom/proposal-toolbar/slash-cmd";
import { SlashCommandProvider } from "@/components/custom/proposal-toolbar/slash-command-provider";
import { cn } from "@/lib/utils";
import { PasteDropExtension } from "@/lib/utils/tiptap/paste-drop-extension";
import { ResizableImageExtension } from "@/lib/utils/tiptap/resizable-image-extension";
import { SlashExtension } from "@/lib/utils/tiptap/slash-extension";
import { uploadEditorImage } from "@/lib/utils/tiptap/upload-image";
import { useEditorStore } from "./editor-store";

function ProposalEditorContent({ content }: { content?: unknown }) {
  const slashCommandRef = useSlashCommandExtension();
  const { setEditor } = useEditorStore();

  const editor = useEditor({
    content: content || "",
    immediatelyRender: false,
    editable: true,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        paragraph: {
          HTMLAttributes: {
            class: "draggable-block",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "draggable-block",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "draggable-block",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "draggable-block",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "draggable-block",
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: "draggable-block",
          },
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
      ResizableImageExtension.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      PasteDropExtension.configure({
        handleUpload: uploadEditorImage,
        errorMessages: {
          invalidFileType:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.",
          fileTooLarge: "File size exceeds limit.",
          genericError: "Failed to upload image",
        },
      }),
      MarkdownShortcuts,
      PricingCard,
      FeatureList,
      CallToAction,
      SlashExtension.configure({
        slashCommandRef,
      }),
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
          "prose-li:text-paragraph-sm prose-li:text-text-strong-950 prose-li:my-1 prose-li:leading-relaxed",
          "prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4",
          "prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4",
          "prose-blockquote:text-text-sub-600 prose-blockquote:border-l-stroke-soft-200",
          "prose-a:text-primary-base prose-a:no-underline hover:prose-a:underline",
          "prose-code:text-text-strong-950 prose-code:bg-bg-weak-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
          "prose-pre:bg-bg-weak-100 prose-pre:text-text-strong-950 prose-pre:border prose-pre:border-stroke-soft-200 prose-pre:rounded-lg",
          "prose-hr:border-stroke-soft-200",
        ),
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Proposal editor",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      setEditor(editor);
    }
    return () => {
      setEditor(null);
    };
  }, [editor, setEditor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex h-full flex-col bg-bg-white-0">
      <div className="flex w-full flex-col h-full">
        <div className="p-3">
          <ProposalToolbar editor={editor} />
        </div>

        <div
          className={cn(
            "relative block w-full resize-none text-paragraph-sm text-text-strong-950 outline-none",
            "pointer-events-auto min-h-[400px] bg-transparent px-6 pt-6",
            "overflow-auto flex-1",
          )}
        >
          <EditorContent className="editor-content" editor={editor} />
          <SlashCmdRoot editor={editor}>
            <SlashCmd />
          </SlashCmdRoot>
        </div>
      </div>
    </div>
  );
}

export function ProposalEditor({ content }: { content?: unknown }) {
  return (
    <SlashCommandProvider>
      <ProposalEditorContent content={content} />
    </SlashCommandProvider>
  );
}
