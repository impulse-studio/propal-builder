"use client";

import { RiCodeSLine } from "@remixicon/react";
import type { Editor } from "@tiptap/react";
import { forwardRef } from "react";

import { ToolbarButton } from "../floating-toolbar/toolbar-button";

type CodeBlockButtonProps = {
  editor: Editor | null;
};

const CodeBlockButton = forwardRef<HTMLButtonElement, CodeBlockButtonProps>(
  ({ editor }, ref) => {
    return (
      <ToolbarButton
        icon={RiCodeSLine}
        isActive={editor?.isActive("codeBlock") ?? false}
        onClick={() => {
          editor?.chain().focus().toggleCodeBlock().run();
        }}
        ref={ref}
        tooltip="Code Block"
      />
    );
  },
);

CodeBlockButton.displayName = "CodeBlockButton";

export { CodeBlockButton };
