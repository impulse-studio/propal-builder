"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { RiArrowDownSLine, RiBrainLine } from "@remixicon/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { createContext, memo, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Shimmer } from "./shimmer";

type ReasoningContextValue = {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number | undefined;
  collapsible: boolean;
  title?: string;
};

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

const useReasoning = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error("Reasoning components must be used within Reasoning");
  }
  return context;
};

export interface ReasoningProps
  extends ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
  collapsible?: boolean;
  title?: string;
}

const AUTO_CLOSE_DELAY = 1000;
const MS_IN_S = 1000;

export const Reasoning = memo(
  ({
    className,
    isStreaming = false,
    open,
    defaultOpen = true,
    onOpenChange,
    duration: durationProp,
    collapsible = true,
    title,
    children,
    ...props
  }: ReasoningProps) => {
    const [isOpen, setIsOpen] = useState(() => {
      if (open !== undefined) {
        return open;
      }
      return defaultOpen;
    });
    const [duration, setDuration] = useState<number | undefined>(durationProp);
    const [hasAutoClosed, setHasAutoClosed] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);

    useEffect(() => {
      if (open !== undefined) {
        setIsOpen(open);
      }
    }, [open]);

    useEffect(() => {
      if (isStreaming) {
        if (startTime === null) {
          setStartTime(Date.now());
        }
      } else if (startTime !== null) {
        setDuration(Math.ceil((Date.now() - startTime) / MS_IN_S));
        setStartTime(null);
      }
    }, [isStreaming, startTime]);

    useEffect(() => {
      if (
        collapsible &&
        defaultOpen &&
        !isStreaming &&
        isOpen &&
        !hasAutoClosed
      ) {
        const timer = setTimeout(() => {
          setIsOpen(false);
          setHasAutoClosed(true);
        }, AUTO_CLOSE_DELAY);

        return () => clearTimeout(timer);
      }
    }, [isStreaming, isOpen, defaultOpen, hasAutoClosed, collapsible]);

    const handleOpenChange = (newOpen: boolean) => {
      if (collapsible) {
        setIsOpen(newOpen);
        onOpenChange?.(newOpen);
      }
    };

    return (
      <ReasoningContext.Provider
        value={{ isStreaming, isOpen, setIsOpen, duration, collapsible, title }}
      >
        <CollapsiblePrimitive.Root
          className={cn("mb-4", className)}
          onOpenChange={handleOpenChange}
          open={collapsible ? isOpen : false}
          disabled={!collapsible}
          {...props}
        >
          {children}
        </CollapsiblePrimitive.Root>
      </ReasoningContext.Provider>
    );
  },
);

Reasoning.displayName = "Reasoning";

export interface ReasoningTriggerProps
  extends ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger> {}

const getThinkingMessage = (
  isStreaming: boolean,
  duration?: number,
  title?: string,
) => {
  if (isStreaming || duration === 0) {
    if (title) {
      return <Shimmer duration={1}>{title}</Shimmer>;
    }
    return <Shimmer duration={1}>Thinking...</Shimmer>;
  }

  if (duration === undefined) {
    return <span>Thought for a few seconds</span>;
  }

  return <span>Thought for {duration} seconds</span>;
};

export const ReasoningTrigger = memo(
  ({ className, children, ...props }: ReasoningTriggerProps) => {
    const { isStreaming, isOpen, duration, collapsible, title } =
      useReasoning();

    return (
      <CollapsiblePrimitive.Trigger
        className={cn(
          "flex w-full items-center gap-2 text-label-sm text-text-sub-600 transition-colors hover:text-text-strong-950",
          className,
        )}
        {...props}
      >
        {children ?? (
          <>
            <RiBrainLine className="size-4" />
            {getThinkingMessage(isStreaming, duration, title)}
            {collapsible && (
              <RiArrowDownSLine
                className={cn(
                  "ml-auto size-4 transition-transform",
                  isOpen ? "rotate-0" : "-rotate-90",
                )}
              />
            )}
          </>
        )}
      </CollapsiblePrimitive.Trigger>
    );
  },
);

ReasoningTrigger.displayName = "ReasoningTrigger";

export interface ReasoningContentProps
  extends ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content> {
  children: ReactNode;
}

export const ReasoningContent = memo(
  ({ className, children, ...props }: ReasoningContentProps) => {
    const isEmpty = typeof children === "string" && children.trim() === "";

    if (isEmpty) {
      return null;
    }

    return (
      <CollapsiblePrimitive.Content
        className={cn(
          "mt-2 overflow-hidden text-paragraph-sm text-text-sub-600",
          "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
          className,
        )}
        {...props}
      >
        {typeof children === "string" ? (
          <div className="whitespace-pre-wrap wrap-break-words">{children}</div>
        ) : (
          children
        )}
      </CollapsiblePrimitive.Content>
    );
  },
);

ReasoningContent.displayName = "ReasoningContent";
