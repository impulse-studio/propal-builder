"use client";

import type { Editor } from "@tiptap/react";
import React, { useCallback, useState } from "react";

interface SlashCommandContextValue {
  isOpen: boolean;
  editor: Editor | null;
  range: { from: number; to: number } | null;
  query: string;
  position: { top: number; left: number } | null;
  openMenu: (params: {
    editor: Editor;
    range: { from: number; to: number };
    query: string;
    clientRect: DOMRect | null;
  }) => void;
  closeMenu: () => void;
  executeCommand: (
    command: (props: {
      editor: Editor;
      range: { from: number; to: number };
    }) => void,
  ) => void;
}

const SlashCommandContext = React.createContext<
  SlashCommandContextValue | undefined
>(undefined);

export const useSlashCommand = () => {
  const context = React.useContext(SlashCommandContext);
  if (!context) {
    throw new Error(
      "useSlashCommand must be used within SlashCommandProvider",
    );
  }
  return context;
};

interface SlashCommandProviderProps {
  children: React.ReactNode;
}

export const SlashCommandProvider: React.FC<SlashCommandProviderProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [range, setRange] = useState<{ from: number; to: number } | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const openMenu = useCallback(
    (params: {
      editor: Editor;
      range: { from: number; to: number };
      query: string;
      clientRect: DOMRect | null;
    }) => {
      setIsOpen(true);
      setEditor(params.editor);
      setRange(params.range);
      setQuery(params.query);

      if (params.clientRect) {
        setPosition({
          top: params.clientRect.bottom + 8,
          left: params.clientRect.left,
        });
      }
    },
    [],
  );

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setEditor(null);
    setRange(null);
    setQuery("");
    setPosition(null);
  }, []);

  const executeCommand = useCallback(
    (
      command: (props: {
        editor: Editor;
        range: { from: number; to: number };
      }) => void,
    ) => {
      if (editor && range) {
        command({ editor, range });
        closeMenu();
      }
    },
    [editor, range, closeMenu],
  );

  return (
    <SlashCommandContext.Provider
      value={{
        isOpen,
        editor,
        range,
        query,
        position,
        openMenu,
        closeMenu,
        executeCommand,
      }}
    >
      {children}
    </SlashCommandContext.Provider>
  );
};

