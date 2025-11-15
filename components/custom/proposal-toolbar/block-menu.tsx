"use client";

import {
  RiAddLine,
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiCodeSLine,
  RiPriceTag3Line,
  RiSeparator,
} from "@remixicon/react";
import type { Editor } from "@tiptap/react";
import { forwardRef } from "react";
import * as Button from "@/components/ui/button";
import * as Dropdown from "@/components/ui/dropdown";
import * as Tooltip from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type BlockMenuProps = {
  editor: Editor | null;
};

const BlockMenu = forwardRef<HTMLButtonElement, BlockMenuProps>(
  ({ editor }, ref) => {
    if (!editor) {
      return null;
    }

    const insertCodeBlock = () => {
      editor.chain().focus().toggleCodeBlock().run();
    };

    const insertHorizontalRule = () => {
      editor.chain().focus().setHorizontalRule().run();
    };

    const insertPricingCard = () => {
      editor.chain().focus().insertPricingCard().run();
    };

    const insertFeatureList = () => {
      editor.chain().focus().insertFeatureList().run();
    };

    const insertCallToAction = () => {
      editor.chain().focus().insertCallToAction().run();
    };

    return (
      <Dropdown.Root>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Dropdown.Trigger asChild>
                <Button.Root
                  className={cn(
                    "size-9 transition-colors",
                    "bg-transparent text-text-sub-600 hover:text-text-strong-950",
                  )}
                  mode="ghost"
                  ref={ref}
                  size="xsmall"
                  type="button"
                  variant="neutral"
                >
                  <Button.Icon as={RiAddLine} className="size-5" />
                </Button.Root>
              </Dropdown.Trigger>
            </Tooltip.Trigger>
            <Tooltip.Content align="center" side="top">
              Insert Block
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>

        <Dropdown.Content align="start" className="w-56">
          <Dropdown.Group>
            <Dropdown.Label>Proposal Blocks</Dropdown.Label>
            <Dropdown.Item onSelect={insertPricingCard}>
              <Dropdown.ItemIcon as={RiPriceTag3Line} />
              <span>Pricing Card</span>
            </Dropdown.Item>
            <Dropdown.Item onSelect={insertFeatureList}>
              <Dropdown.ItemIcon as={RiCheckboxCircleLine} />
              <span>Feature List</span>
            </Dropdown.Item>
            <Dropdown.Item onSelect={insertCallToAction}>
              <Dropdown.ItemIcon as={RiArrowRightLine} />
              <span>Call to Action</span>
            </Dropdown.Item>
          </Dropdown.Group>
          <Dropdown.Separator />
          <Dropdown.Group>
            <Dropdown.Label>Basic Blocks</Dropdown.Label>
            <Dropdown.Item onSelect={insertCodeBlock}>
              <Dropdown.ItemIcon as={RiCodeSLine} />
              <span>Code Block</span>
            </Dropdown.Item>
            <Dropdown.Item onSelect={insertHorizontalRule}>
              <Dropdown.ItemIcon as={RiSeparator} />
              <span>Horizontal Rule</span>
            </Dropdown.Item>
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Root>
    );
  },
);

BlockMenu.displayName = "BlockMenu";

export { BlockMenu };
