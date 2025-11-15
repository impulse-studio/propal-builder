"use client";

import { RiArrowUpLine } from "@remixicon/react";
import { Document } from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import { Paragraph } from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import { Text } from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import * as Button from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface CompactPromptFormProps {
  onChange: (content: string) => void;
  autoFocus?: boolean;
  isLoading?: boolean;
  stop: () => void;
  isError: boolean;
  onSubmit: () => void;
  isDisabled?: boolean;
  placeholder?: string;
  disabledPlaceholder?: string;
}

function PureCompactPromptForm({
  onChange,
  onSubmit,
  isLoading,
  autoFocus = true,
  isDisabled,
  placeholder,
  disabledPlaceholder,
}: CompactPromptFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const onChangeRef = useRef(onChange);
  const onSubmitRef = useRef(onSubmit);
  const isLoadingRef = useRef(isLoading);
  const isDisabledRef = useRef(isDisabled);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    isDisabledRef.current = isDisabled;
  }, [isDisabled]);

  const extensions = useMemo(
    () => [
      Placeholder.configure({
        emptyEditorClass: "is-editor-empty",
        placeholder: isDisabled
          ? (disabledPlaceholder ??
            "The selected model is currently unavailable. Please select a different model to continue.")
          : (placeholder ?? "Ask AI a question or make..."),
        showOnlyWhenEditable: false,
      }),
      Document,
      Paragraph,
      Text,
      HardBreak,
    ],
    [isDisabled, placeholder, disabledPlaceholder],
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      autofocus: autoFocus ?? true,
      extensions,
      editable: !isDisabled,
      content: "",
      onUpdate: ({ editor }) => {
        const text = editor.getText();
        onChangeRef.current(text);
      },
      editorProps: {
        handleKeyDown(_view, event) {
          const isAutocompleteActive = !!document.querySelector(".tippy-box");
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !isAutocompleteActive
          ) {
            if (isLoadingRef.current || isDisabledRef.current) {
              return false;
            }
            if (formRef.current) {
              formRef.current.dispatchEvent(
                new Event("submit", {
                  bubbles: true,
                  cancelable: true,
                }),
              );
            }
            return true;
          }
          return false;
        },
      },
    },
    [extensions, autoFocus],
  );

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!isDisabled);
    }
  }, [editor, isDisabled]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isDisabled) {
        return;
      }
      onSubmitRef.current();
      editor?.commands.setContent("");
    },
    [isDisabled, editor],
  );
  const handleContainerClick = useCallback(() => {
    if (isDisabled) {
      return;
    }
    editor?.commands.focus("end");
  }, [editor, isDisabled]);

  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLFieldSetElement>) => {
      if (isDisabled) {
        return;
      }
      if (e.currentTarget !== e.target) {
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        editor?.commands.focus("end");
      }
    },
    [editor, isDisabled],
  );
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <form className={cn("w-full")} onSubmit={handleSubmit} ref={formRef}>
      <fieldset
        className={cn(
          "flex max-h-60 w-full flex-col overflow-visible rounded-xl border border-bg-soft-200 bg-bg-white-0 px-2 pb-2",
        )}
        onClick={handleContainerClick}
        onKeyDown={handleContainerKeyDown}
      >
        <div className="flex w-full items-end">
          <EditorContent
            className={cn(
              "editor-content max-h-[100px] min-h-[38px] w-full overflow-y-auto bg-transparent px-2 text-paragraph-sm leading-normal focus-within:outline-none",
            )}
            editor={editor}
          />

          <Button.Root
            className="mt-2 shrink-0 rounded-10"
            disabled={isLoading || isDisabled}
            size="medium"
            type="submit"
            variant="neutral"
          >
            <Button.Icon as={RiArrowUpLine} />
          </Button.Root>
        </div>
      </fieldset>
    </form>
  );
}

export const CompactPromptForm = memo(
  PureCompactPromptForm,
  (prevProps, nextProps) => {
    return (
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.autoFocus === nextProps.autoFocus &&
      prevProps.isDisabled === nextProps.isDisabled &&
      prevProps.placeholder === nextProps.placeholder &&
      prevProps.disabledPlaceholder === nextProps.disabledPlaceholder &&
      prevProps.isError === nextProps.isError
    );
  },
);
