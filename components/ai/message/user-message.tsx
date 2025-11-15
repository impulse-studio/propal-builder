"use client";

import { type ComponentPropsWithoutRef, forwardRef, memo } from "react";
import * as Divider from "@/components/ui/divider";
import { cn } from "@/lib/utils/cn";
import type { ChatUIMessage } from "@/server/routers/chat/validators";

interface UserMessageProps extends ComponentPropsWithoutRef<"div"> {
  message: ChatUIMessage;
}

const PureUserMessage = forwardRef<HTMLDivElement, UserMessageProps>(
  ({ className, message, ...rest }, ref) => {
    return (
      <>
        <div
          className={cn(
            "text-text-strong-950 text-title-h6 md:text-title-h5",
            className,
          )}
          ref={ref}
          {...rest}
        >
          {message.parts.map((part, index) => {
            switch (part.type) {
              case "text": {
                const text = part.text ?? "";
                return (
                  <p className="mb-2 last:mb-0" key={index}>
                    {text}
                  </p>
                );
              }
              default:
                return null;
            }
          })}
        </div>
        <Divider.Root className="before:bg-stroke-sub-300" variant="line" />
      </>
    );
  },
);

export const UserMessage = memo(PureUserMessage);
