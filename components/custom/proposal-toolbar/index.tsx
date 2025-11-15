"use client";

import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BlockquoteButton } from "../floating-toolbar/blockquote-button";
import { BoldButton } from "../floating-toolbar/bold-button";
import { BulletListButton } from "../floating-toolbar/bullet-list-button";
import { ItalicButton } from "../floating-toolbar/italic-button";
import { NumberedListButton } from "../floating-toolbar/numbered-list-button";
import { StrikethroughButton } from "../floating-toolbar/strikethrough-button";
import { UnderlineButton } from "../floating-toolbar/underline-button";
import { BlockMenu } from "./block-menu";
import { HeadingButton } from "./heading-button";

type ProposalToolbarProps = {
  editor: Editor | null;
};

export function ProposalToolbar({ editor }: ProposalToolbarProps) {
  const [updateKey, setUpdateKey] = useState(0);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const update = () => {
      setUpdateKey((prev) => prev + 1);
    };

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    editor.on("update", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
      editor.off("update", update);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      key={updateKey}
      className={cn([
        "flex items-center gap-1 rounded-xl bg-bg-weak-50/50 backdrop-blur-sm p-2",
        "transition-all duration-200 ease-out",
        "hover:bg-bg-weak-100/80 hover:shadow-regular-xs",
        "focus-within:bg-bg-weak-100 focus-within:shadow-regular-xs",
      ])}
      role="toolbar"
      aria-label="Text formatting toolbar"
    >
      {/* Headings group */}
      <HeadingButton editor={editor} level={1} />
      <HeadingButton editor={editor} level={2} />
      <HeadingButton editor={editor} level={3} />

      {/* Divider */}
      <div className="mx-1 h-6 w-px bg-stroke-soft-200" />

      {/* Text formatting group */}
      <BoldButton editor={editor} />
      <ItalicButton editor={editor} />
      <UnderlineButton editor={editor} />
      <StrikethroughButton editor={editor} />

      {/* Divider */}
      <div className="mx-1 h-6 w-px bg-stroke-soft-200" />

      {/* Lists group */}
      <BulletListButton editor={editor} />
      <NumberedListButton editor={editor} />

      {/* Divider */}
      <div className="mx-1 h-6 w-px bg-stroke-soft-200" />

      {/* Blockquote group */}
      <BlockquoteButton editor={editor} />

      {/* Divider */}
      <div className="mx-1 h-6 w-px bg-stroke-soft-200" />

      {/* Blocks group */}
      <BlockMenu editor={editor} />
    </div>
  );
}
