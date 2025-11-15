"use client";

import { memo } from "react";
import type { ChatUIMessage } from "@/server/routers/chat/types";
import {
  DeleteBlockTool,
  DeleteTextTool,
  FindAndReplaceTool,
  GetAllBlocksTool,
  GetBlockTool,
  GetDocumentContentTool,
  InsertAtPositionTool,
  InsertCallToActionTool,
  InsertFeatureListTool,
  InsertPricingCardTool,
  ReplaceSectionTool,
  SetDocumentContentTool,
  UpdateBlockTool,
} from "./tool-calls";

interface ToolCallDisplayProps {
  part: ChatUIMessage["parts"][number];
  isStreaming?: boolean;
}

function ToolCallDisplayComponent({ part }: ToolCallDisplayProps) {
  if (
    part.type === "text" ||
    part.type === "reasoning" ||
    part.type === "step-start"
  ) {
    return null;
  }

  // Handle typed tool parts
  switch (part.type) {
    case "tool-findAndReplace":
      return <FindAndReplaceTool part={part} />;

    case "tool-insertAtPosition":
      return <InsertAtPositionTool part={part} />;

    case "tool-replaceSection":
      return <ReplaceSectionTool part={part} />;

    case "tool-setDocumentContent":
      return <SetDocumentContentTool part={part} />;

    case "tool-deleteText":
      return <DeleteTextTool part={part} />;

    case "tool-getDocumentContent":
      return <GetDocumentContentTool part={part} />;

    case "tool-insertPricingCard":
      return <InsertPricingCardTool part={part} />;

    case "tool-insertFeatureList":
      return <InsertFeatureListTool part={part} />;

    case "tool-insertCallToAction":
      return <InsertCallToActionTool part={part} />;

    case "tool-updateBlock":
      return <UpdateBlockTool part={part} />;

    case "tool-deleteBlock":
      return <DeleteBlockTool part={part} />;

    case "tool-getBlock":
      return <GetBlockTool part={part} />;

    case "tool-getAllBlocks":
      return <GetAllBlocksTool part={part} />;

    case "dynamic-tool": {
      // Fallback for dynamic tools
      if (!("state" in part)) {
        return null;
      }

      const dynPart = part as {
        state:
          | "input-streaming"
          | "input-available"
          | "output-available"
          | "output-error";
        toolName: string;
        input?: unknown;
        output?: unknown;
        errorText?: string;
      };
      const state = dynPart.state;

      switch (state) {
        case "input-streaming":
          return (
            <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />
                <span className="text-paragraph-sm font-medium text-text-strong-950">
                  {dynPart.toolName}
                </span>
              </div>
              <div className="text-paragraph-sm text-text-soft-600">
                Chargement des paramètres...
              </div>
            </div>
          );

        case "input-available":
          return (
            <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary-500" />
                <span className="text-paragraph-sm font-medium text-text-strong-950">
                  {dynPart.toolName}
                </span>
              </div>
              {"input" in dynPart && (
                <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
                  <pre className="text-paragraph-xs text-text-soft-600">
                    {JSON.stringify(dynPart.input, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );

        case "output-available":
          return (
            <div className="rounded-lg border border-success-300 bg-success-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success-500" />
                <span className="text-paragraph-sm font-medium text-success-700">
                  {dynPart.toolName}
                </span>
              </div>
              {"output" in dynPart && (
                <div className="rounded-md bg-bg-white-0 p-3 ring-1 ring-stroke-soft-200">
                  <pre className="text-paragraph-xs text-text-soft-600">
                    {JSON.stringify(dynPart.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );

        case "output-error":
          return (
            <div className="rounded-lg border border-error-300 bg-error-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-error-500" />
                <span className="text-paragraph-sm font-medium text-error-700">
                  {dynPart.toolName}
                </span>
              </div>
              <div className="text-paragraph-sm text-error-600">
                {"errorText" in dynPart
                  ? (dynPart.errorText ?? "Une erreur est survenue")
                  : "Une erreur est survenue"}
              </div>
            </div>
          );

        default:
          return null;
      }
    }

    default:
      return null;
  }
}

export const ToolCallDisplay = memo(ToolCallDisplayComponent);
