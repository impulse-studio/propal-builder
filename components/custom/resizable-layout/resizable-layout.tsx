"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils/cn";

interface ResizableLayoutProps extends ComponentPropsWithoutRef<"div"> {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
}

const ResizableLayout = forwardRef<HTMLDivElement, ResizableLayoutProps>(
  (
    {
      leftPanel,
      rightPanel,
      defaultLeftWidth = 75,
      minLeftWidth = 25,
      minRightWidth = 20,
      className,
      ...props
    },
    ref,
  ) => {
    const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeRef = useRef<HTMLButtonElement>(null);

    const handleMouseDown = useCallback(() => {
      setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isResizing || !containerRef.current) return;

        const containerWidth = containerRef.current.offsetWidth;
        const newLeftWidth = (e.clientX / containerWidth) * 100;

        const constrainedWidth = Math.max(
          minLeftWidth,
          Math.min(100 - minRightWidth, newLeftWidth),
        );

        setLeftWidth(constrainedWidth);
      },
      [isResizing, minLeftWidth, minRightWidth],
    );

    const handleMouseUp = useCallback(() => {
      setIsResizing(false);
    }, []);

    useEffect(() => {
      if (isResizing) {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        return () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
        };
      }
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return (
      <div ref={ref} className={cn("flex h-full w-full", className)} {...props}>
        <div ref={containerRef} className="relative flex h-full w-full">
          <div
            className="h-full overflow-hidden"
            style={{ width: `${leftWidth}%` }}
          >
            {leftPanel}
          </div>

          <button
            ref={resizeRef}
            type="button"
            className={cn(
              "group relative z-10 flex w-px cursor-col-resize items-center justify-center border-0 bg-stroke-soft-200 p-0 transition-colors duration-200 ease-out",
              "hover:bg-stroke-strong-400",
              isResizing && "bg-stroke-strong-600",
            )}
            onMouseDown={handleMouseDown}
            aria-label="Resize panels"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleMouseDown();
              }
            }}
          >
            <div className="h-8 w-0.5 rounded-full bg-stroke-soft-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </button>

          <div
            className="h-full overflow-hidden"
            style={{ width: `${100 - leftWidth}%` }}
          >
            {rightPanel}
          </div>
        </div>
      </div>
    );
  },
);

ResizableLayout.displayName = "ResizableLayout";

export { ResizableLayout };
