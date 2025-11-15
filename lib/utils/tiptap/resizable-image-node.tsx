"use client";

import { RiAlignCenter, RiAlignLeft, RiAlignRight } from "@remixicon/react";
import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import interact from "interactjs";
import { useEffect, useRef, useState } from "react";

import * as Button from "@/components/ui/button";
import * as Tooltip from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { ImageAttributes } from "./resizable-image-extension";

export const ResizableImageNode = ({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const attributes = node.attrs as ImageAttributes;

  useEffect(() => {
    if (!(imageRef.current && containerRef.current)) return;

    const interactable = interact(containerRef.current).resizable({
      edges: { left: true, right: true, bottom: true, top: false },
      listeners: {
        start() {
          setIsResizing(true);
        },
        move(event) {
          const { width, height } = event.rect;

          if (aspectRatio && event.edges?.bottom) {
            const newHeight = width / aspectRatio;
            event.target.style.width = `${width}px`;
            event.target.style.height = `${newHeight}px`;
            updateAttributes({
              width: Math.round(width),
              height: Math.round(newHeight),
            });
          } else {
            event.target.style.width = `${width}px`;
            event.target.style.height = `${height}px`;
            updateAttributes({
              width: Math.round(width),
              height: Math.round(height),
            });
          }
        },
        end() {
          setIsResizing(false);
        },
      },
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: 100, height: 100 },
          max: { width: 1200, height: 1200 },
        }),
      ],
      inertia: true,
    });

    return () => {
      interactable.unset();
    };
  }, [aspectRatio, updateAttributes]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setAspectRatio(naturalWidth / naturalHeight);
    }
  };

  const handleAlignChange = (align: "left" | "center" | "right") => {
    updateAttributes({ align });
  };

  return (
    <NodeViewWrapper
      className={cn(
        "relative",
        attributes.align === "left" && "text-left",
        attributes.align === "center" && "text-center",
        attributes.align === "right" && "text-right",
      )}
    >
      <div
        className={cn(
          "relative inline-block max-w-full",
          selected && "ring-2 ring-primary-base ring-offset-2",
          isResizing && "cursor-nwse-resize",
        )}
        ref={containerRef}
        style={{
          width: attributes.width || "auto",
          height: attributes.height || "auto",
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: Native img element required for interactjs resize functionality */}
        <img
          alt={attributes.alt || ""}
          className="block h-full w-full object-contain"
          draggable={false}
          onLoad={handleImageLoad}
          ref={imageRef}
          src={attributes.src}
          title={attributes.title || ""}
        />

        {selected && (
          <>
            <div className="absolute -right-2 -top-2 -bottom-2 w-1 cursor-ew-resize hover:bg-primary-base/20" />
            <div className="absolute -left-2 -top-2 -bottom-2 w-1 cursor-ew-resize hover:bg-primary-base/20" />
            <div className="absolute -bottom-2 -left-2 -right-2 h-1 cursor-ns-resize hover:bg-primary-base/20" />

            <div className="absolute left-2 top-2 flex gap-1 rounded-md bg-bg-white-0/90 p-1 shadow-regular-xs backdrop-blur-sm">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Button.Root
                    mode={attributes.align === "left" ? "filled" : "ghost"}
                    onClick={() => handleAlignChange("left")}
                    size="xxsmall"
                    variant="neutral"
                  >
                    <Button.Icon as={RiAlignLeft} />
                  </Button.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>Align left</Tooltip.Content>
              </Tooltip.Root>

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Button.Root
                    mode={attributes.align === "center" ? "filled" : "ghost"}
                    onClick={() => handleAlignChange("center")}
                    size="xxsmall"
                    variant="neutral"
                  >
                    <Button.Icon as={RiAlignCenter} />
                  </Button.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>Align center</Tooltip.Content>
              </Tooltip.Root>

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Button.Root
                    mode={attributes.align === "right" ? "filled" : "ghost"}
                    onClick={() => handleAlignChange("right")}
                    size="xxsmall"
                    variant="neutral"
                  >
                    <Button.Icon as={RiAlignRight} />
                  </Button.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>Align right</Tooltip.Content>
              </Tooltip.Root>
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};
