"use client";

import { RiArrowUpLine, RiMicLine, RiStopFill } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { Document } from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import { Paragraph } from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import { Text } from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import * as Button from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { orpc } from "@/orpc/client";

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
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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

  const { mutateAsync: transcribeAudioMutation, isPending: isTranscribing } =
    useMutation(orpc.stt.transcribeAudio.mutationOptions());

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

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    setIsRecording(false);
  }, []);

  const transcribeAudio = useCallback(
    async (audioBlob: Blob) => {
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const audioBase64 = btoa(binary);

        const result = await transcribeAudioMutation({
          audioBase64,
          mimeType: audioBlob.type || "audio/webm",
        });

        const text = result.text?.trim();
        if (!text || !editor || editor.isDestroyed) {
          return;
        }

        const existingText = editor.getText();
        const newText = existingText
          ? `${existingText}${existingText.endsWith(" ") ? "" : " "}${text}`
          : text;

        editor.commands.setContent(newText);
      } catch (error) {
        console.error("Failed to transcribe audio with ElevenLabs:", error);
      }
    },
    [editor, transcribeAudioMutation],
  );

  const startRecording = useCallback(async () => {
    if (isDisabled || isLoading || isRecording || isTranscribing) {
      return;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        console.error("getUserMedia is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];

        if (mediaStreamRef.current) {
          const tracks = mediaStreamRef.current.getTracks();
          for (const track of tracks) {
            track.stop();
          }
          mediaStreamRef.current = null;
        }

        if (chunks.length === 0) {
          return;
        }

        const blob = new Blob(chunks, { type: "audio/webm" });
        await transcribeAudio(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting microphone recording:", error);
      setIsRecording(false);
    }
  }, [isDisabled, isLoading, isRecording, isTranscribing, transcribeAudio]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

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

          <div className="flex items-center gap-1">
            <Button.Root
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              className="mt-2 shrink-0 rounded-10"
              disabled={isDisabled}
              mode="ghost"
              size="medium"
              type="button"
              variant="neutral"
              onClick={() => {
                void toggleRecording();
              }}
            >
              <Button.Icon as={isRecording ? RiStopFill : RiMicLine} />
            </Button.Root>
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
