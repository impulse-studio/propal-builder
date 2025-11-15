"use client";

import { RiSeparator } from "@remixicon/react";
import type { Editor } from "@tiptap/react";
import { forwardRef } from "react";

import { ToolbarButton } from "../floating-toolbar/toolbar-button";

type HorizontalRuleButtonProps = {
  editor: Editor | null;
};

const HorizontalRuleButton = forwardRef<
  HTMLButtonElement,
  HorizontalRuleButtonProps
>(({ editor }, ref) => {
  return (
    <ToolbarButton
      icon={RiSeparator}
      isActive={false}
      onClick={() => {
        editor?.chain().focus().setHorizontalRule().run();
      }}
      ref={ref}
      tooltip="Horizontal Rule"
    />
  );
});

HorizontalRuleButton.displayName = "HorizontalRuleButton";

export { HorizontalRuleButton };
