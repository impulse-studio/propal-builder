/* eslint-disable @typescript-eslint/no-explicit-any */

import { RiErrorWarningFill } from "@remixicon/react";
import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import * as Alert from "@/components/ui/alert";
import { cn } from "@/lib/utils/cn";
import "./markdown-typing-cursor.css";

interface MarkdownProps {
  children: string;
  className?: string;
  typing?: boolean;
  size?: "sm" | "md" | "lg";
}

const createComponents = (
  size: "sm" | "md" | "lg" = "md",
): Partial<Components> => {
  const textSize =
    size === "sm"
      ? "text-paragraph-sm"
      : size === "lg"
        ? "text-paragraph-lg"
        : "text-paragraph-md";
  const heading1Size =
    size === "sm"
      ? "text-title-h6"
      : size === "lg"
        ? "text-title-h4"
        : "text-title-h5";
  const heading2Size =
    size === "sm"
      ? "text-label-md"
      : size === "lg"
        ? "text-title-h5"
        : "text-title-h6";
  const heading3Size =
    size === "sm"
      ? "text-label-sm"
      : size === "lg"
        ? "text-title-h6"
        : "text-label-md";

  return {
    h1: ({ children, ...props }) => (
      <h1 className={cn("mb-6", heading1Size)} {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className={cn("mb-5", heading2Size)} {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className={cn("mb-4", heading3Size)} {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p className={cn("mb-4 first:mt-1", textSize)} {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul
        className={cn("mb-4 ml-4 list-outside list-disc space-y-2", textSize)}
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol
        className={cn(
          "mb-4 ml-4 list-outside list-decimal space-y-2",
          textSize,
        )}
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className={textSize} {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold" {...props}>
        {children}
      </strong>
    ),
    a: ({ children, href, ...props }) => (
      <a
        className="text-primary-base hover:underline"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        {...props}
      >
        {children}
      </a>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className={cn(
          "my-4 border-stroke-sub-300 border-l-4 pl-4 text-text-sub-600 italic",
          textSize,
        )}
        {...props}
      >
        {children}
      </blockquote>
    ),
    table: ({ children, ...props }) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-stroke-soft-200">
        <table
          className="min-w-full divide-y divide-stroke-soft-200"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => <thead {...props}>{children}</thead>,
    tbody: ({ children, ...props }) => (
      <tbody
        className="divide-y divide-stroke-soft-200 bg-bg-weak-50"
        {...props}
      >
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
    th: ({ children, ...props }) => (
      <th
        className="bg-bg-soft-200 px-3 py-2 text-left text-label-xs text-text-sub-600 uppercase first:rounded-tl-lg last:rounded-tr-lg"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td
        className={cn(
          "whitespace-nowrap px-3 py-2 text-text-strong-950",
          textSize,
        )}
        {...props}
      >
        {children}
      </td>
    ),
    hr: ({ ...props }) => (
      <hr className="my-4 border-stroke-soft-200 border-t" {...props} />
    ),
    span: ({ children, datatype, ...props }) => {
      if (datatype === "error") {
        return (
          <Alert.Root className="mt-3" status="error" variant="lighter">
            <Alert.Icon as={RiErrorWarningFill} />
            <span {...props}>{children}</span>
          </Alert.Root>
        );
      }

      return <span {...props}>{children}</span>;
    },
  };
};

const components = createComponents();

const remarkPlugins = [remarkGfm];

const PureMarkdownRenderer = ({
  children,
  className,
  typing = false,
  size = "md",
}: MarkdownProps) => {
  const sizeComponents = size !== "md" ? createComponents(size) : components;

  return (
    <div className={cn("max-w-none", typing && "md-typing", className)}>
      <ReactMarkdown components={sizeComponents} remarkPlugins={remarkPlugins}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

export const MarkdownRenderer = memo(
  PureMarkdownRenderer,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.typing === nextProps.typing &&
    prevProps.size === nextProps.size,
);
