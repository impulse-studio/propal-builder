import {
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiCodeSLine,
  RiPriceTag3Line,
  RiSeparator,
} from "@remixicon/react";
import type { Editor } from "@tiptap/react";

export type BlockItem = {
  id: string;
  label: string;
  icon: typeof RiPriceTag3Line;
  group: string;
  onSelect: () => void;
};

/**
 * Gets all available block definitions for the slash command menu
 */
export function getBlockDefinitions(editor: Editor | null): BlockItem[] {
  if (!editor) {
    return [];
  }

  return [
    {
      id: "pricing-card",
      label: "Pricing Card",
      icon: RiPriceTag3Line,
      group: "Proposal Blocks",
      onSelect: () => editor.chain().focus().insertPricingCard().run(),
    },
    {
      id: "feature-list",
      label: "Feature List",
      icon: RiCheckboxCircleLine,
      group: "Proposal Blocks",
      onSelect: () => editor.chain().focus().insertFeatureList().run(),
    },
    {
      id: "call-to-action",
      label: "Call to Action",
      icon: RiArrowRightLine,
      group: "Proposal Blocks",
      onSelect: () => editor.chain().focus().insertCallToAction().run(),
    },
    {
      id: "code-block",
      label: "Code Block",
      icon: RiCodeSLine,
      group: "Basic Blocks",
      onSelect: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: "horizontal-rule",
      label: "Horizontal Rule",
      icon: RiSeparator,
      group: "Basic Blocks",
      onSelect: () => editor.chain().focus().setHorizontalRule().run(),
    },
  ];
}

/**
 * Filters blocks based on query string
 */
export function filterBlocks(blocks: BlockItem[], query: string): BlockItem[] {
  if (!query) return blocks;

  const lowerQuery = query.toLowerCase();
  return blocks.filter((block) =>
    block.label.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Groups blocks by their group property
 */
export function groupBlocks(blocks: BlockItem[]): Record<string, BlockItem[]> {
  return blocks.reduce(
    (acc, block) => {
      if (!acc[block.group]) {
        acc[block.group] = [];
      }
      acc[block.group].push(block);
      return acc;
    },
    {} as Record<string, BlockItem[]>,
  );
}
