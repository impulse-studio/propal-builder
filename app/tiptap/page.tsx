"use client";

import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import { EditorContext } from "@tiptap/react";
import { useState } from "react";

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
import { RichTextEditor } from "@/components/custom/rich-text-editor";
import { cn } from "@/lib/utils";

import { PasteDropExtension } from "@/lib/utils/tiptap/paste-drop-extension";
import { ResizableImageExtension } from "@/lib/utils/tiptap/resizable-image-extension";
import { SlashExtension } from "@/lib/utils/tiptap/slash-extension";
import { uploadEditorImage } from "@/lib/utils/tiptap/upload-image";

function TiptapEditorWithSlashCommands() {
  const [content, setContent] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const slashCommandRef = useSlashCommandExtension();

  const additionalExtensions = [
    TextStyle,
    Color,
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
  ];

  const editorClassName = cn(
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
  );

  const starterKitConfig = {
    heading: {
      levels: [1, 2, 3] as [1, 2, 3],
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
  };

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

        <EditorContext.Provider value={{ editor }}>
          <div className="flex w-full flex-col">
            {/* Toolbar */}
            <div className="p-3">
              <ProposalToolbar editor={editor} />
            </div>

            {/* Editor Content */}
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your proposal..."
              additionalExtensions={additionalExtensions}
              starterKitConfig={starterKitConfig}
              editorClassName={editorClassName}
              showFloatingToolbar={false}
              className={cn(
                "flex w-full flex-col rounded-xl bg-bg-white-0 pb-4 shadow-regular-xs",
                "ring-1 ring-stroke-soft-200 ring-inset transition duration-200 ease-out",
              )}
              editorContentClassName={cn("min-h-[400px] pt-6")}
              editorOverlays={
                editor ? (
                  <SlashCmdRoot editor={editor}>
                    <SlashCmd />
                  </SlashCmdRoot>
                ) : null
              }
              onEditorReady={setEditor}
            />
          </div>
        </EditorContext.Provider>
      </div>
    </div>
  );
}

export default function TiptapPage() {
  return (
    <SlashCommandProvider>
      <TiptapEditorWithSlashCommands />
    </SlashCommandProvider>
  );
}
