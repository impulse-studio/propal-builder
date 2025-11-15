"use client";

import { RiH1, RiH2, RiH3 } from "@remixicon/react";
import type { Editor } from "@tiptap/react";
import { forwardRef } from "react";

import { ToolbarButton } from "../floating-toolbar/toolbar-button";

const icons = {
  1: RiH1,
  2: RiH2,
  3: RiH3,
};

type HeadingButtonProps = {
  editor: Editor | null;
  level: 1 | 2 | 3;
};

const HeadingButton = forwardRef<HTMLButtonElement, HeadingButtonProps>(
  ({ editor, level }, ref) => {
    const Icon = icons[level];
    const isActive = editor?.isActive("heading", { level }) ?? false;

    return (
      <ToolbarButton
        icon={Icon}
        isActive={isActive}
        onClick={() => {
          editor?.chain().focus().toggleHeading({ level }).run();
        }}
        ref={ref}
        tooltip={`Heading ${level}`}
      />
    );
  },
);

HeadingButton.displayName = "HeadingButton";

export { HeadingButton };
