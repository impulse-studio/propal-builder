"use client";

import type { AnyExtension } from "@tiptap/core";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { AnimatePresence } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useEffect,
} from "react";
import FloatingToolbar from "@/components/custom/floating-toolbar";
import { cn } from "@/lib/utils";

interface RichTextEditorProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  additionalExtensions?: AnyExtension[];
  customToolbar?: ReactNode;
  showFloatingToolbar?: boolean;
  editorClassName?: string;
  starterKitConfig?: Parameters<typeof StarterKit.configure>[0];
  onEditorReady?: (editor: Editor | null) => void;
  editorOverlays?: ReactNode;
  editorContentClassName?: string;
}

const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  (
    {
      content,
      onChange,
      id,
      placeholder,
      className,
      additionalExtensions = [],
      customToolbar,
      showFloatingToolbar = true,
      editorClassName,
      starterKitConfig,
      onEditorReady,
      editorOverlays,
      editorContentClassName,
      ...props
    },
    ref,
  ) => {
    const editor = useEditor({
      content: content || "",
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: false,
          ...starterKitConfig,
        }),
        Placeholder.configure({
          emptyEditorClass: "is-editor-empty",
          showOnlyWhenEditable: false,
          placeholder: placeholder || "Write something...",
        }),
        Highlight,
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
        }),
        Typography,
        ...additionalExtensions,
      ],
      editorProps: {
        attributes: {
          class: cn(
            "text-paragraph-sm prose-sm prose focus:outline-none min-h-[100px] text-text-strong-950 dark:prose-invert",
            editorClassName,
          ),
          role: "textbox",
          "aria-multiline": "true",
          "aria-label": placeholder || "Rich text editor",
        },
      },
      onUpdate: ({ editor: currentEditor }) => {
        onChange(currentEditor.getHTML());
      },
    });

    useEffect(() => {
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content || "", {
          emitUpdate: false,
        });
      }
    }, [editor, content]);

    useEffect(() => {
      if (onEditorReady) {
        onEditorReady(editor);
      }
    }, [editor, onEditorReady]);

    return (
      <div
        className={cn(
          "group/textarea relative flex w-full flex-col rounded-xl bg-bg-white-0 pb-2.5 shadow-regular-xs",
          "ring-1 ring-stroke-soft-200 ring-inset transition duration-200 ease-out",
          "focus-within:shadow-button-important-focus focus-within:ring-stroke-strong-950",
          "has-data-disabled:pointer-events-none has-data-disabled:bg-bg-weak-50 has-data-disabled:ring-transparent",
          className,
        )}
        data-slot="control"
        ref={ref}
        {...props}
      >
        {customToolbar}
        <AnimatePresence>
          {showFloatingToolbar && editor?.isFocused && (
            <FloatingToolbar editor={editor} />
          )}
        </AnimatePresence>
        <div
          className={cn(
            "block w-full resize-none text-paragraph-sm text-text-strong-950 outline-none",
            "pointer-events-auto h-full min-h-[82px] bg-transparent pt-2.5 px-6",
            "min-h-[100px] overflow-auto",
            editorContentClassName,
          )}
        >
          <EditorContent className="editor-content" editor={editor} id={id} />
          {editorOverlays}
        </div>
      </div>
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };
