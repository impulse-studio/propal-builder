"use client";

import type { Editor } from "@tiptap/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SlashCommandMenu, useSlashCommands } from "./slash-command-menu";
import { useSlashCommand } from "./slash-command-provider";

interface SlashCmdRootProps {
  editor: Editor;
  children: React.ReactNode;
}

export const Root: React.FC<SlashCmdRootProps> = ({ editor, children }) => {
  const { isOpen, position } = useSlashCommand();
  const [adjustedPosition, setAdjustedPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    isAbove?: boolean;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!(isOpen && position)) {
      setAdjustedPosition(null);
      return;
    }

    const calculatePosition = () => {
      if (!menuRef.current) return;

      const menuRect = menuRef.current.getBoundingClientRect();
      const menuHeight = menuRect.height || 400;
      const menuWidth = menuRect.width || 320;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const scrollY = window.scrollY;

      const spaceBelow = viewportHeight - (position.top - scrollY);
      const spaceAbove = position.top - scrollY;
      const spaceRight = viewportWidth - position.left;

      const finalPosition: {
        top?: number;
        bottom?: number;
        left: number;
        isAbove?: boolean;
      } = {
        left: position.left,
        isAbove: false,
      };

      const padding = 20;
      const offsetBelow = 8;
      const offsetAbove = 20;
      const lineHeight = 28;

      if (spaceBelow >= menuHeight + padding) {
        finalPosition.top = position.top + offsetBelow;
        finalPosition.isAbove = false;
      } else if (spaceAbove >= menuHeight + padding) {
        finalPosition.top =
          position.top - menuHeight - offsetAbove - lineHeight;
        finalPosition.isAbove = true;
      } else if (spaceBelow > spaceAbove) {
        finalPosition.top = position.top + offsetBelow;
        finalPosition.isAbove = false;
      } else {
        finalPosition.top =
          position.top - menuHeight - offsetAbove - lineHeight;
        finalPosition.isAbove = true;
      }

      if (spaceRight < menuWidth + padding) {
        finalPosition.left = Math.max(
          padding,
          viewportWidth - menuWidth - padding,
        );
      }

      setAdjustedPosition(finalPosition);
    };

    const timer = setTimeout(calculatePosition, 0);

    const handleResize = () => {
      calculatePosition();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [isOpen, position]);

  if (!(isOpen && editor && position)) {
    return null;
  }

  return createPortal(
    <div
      aria-label="Slash commands menu"
      ref={menuRef}
      role="menu"
      style={{
        position: "fixed",
        ...(adjustedPosition || {
          top: position.top,
          left: position.left,
        }),
        zIndex: 99_999,
        opacity: adjustedPosition ? 1 : 0,
        transition: "opacity 150ms ease-out",
      }}
    >
      {children}
    </div>,
    document.body,
  );
};

export const Cmd: React.FC<{ children?: React.ReactNode }> = () => {
  const { query, executeCommand, editor, closeMenu } = useSlashCommand();
  const slashCommands = useSlashCommands(editor);

  const filteredCommands = slashCommands.filter((item) => {
    const searchQuery = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery) ||
      item.searchTerms.some((term) => term.toLowerCase().includes(searchQuery))
    );
  });

  if (!editor) return null;

  return (
    <SlashCommandMenu
      command={(item) => {
        executeCommand(item.command);
      }}
      editor={editor}
      items={filteredCommands}
      onClose={closeMenu}
    />
  );
};

export const useSlashCommandExtension = () => {
  const { openMenu, closeMenu } = useSlashCommand();
  const slashCommandRef = useRef({ openMenu, closeMenu });

  useEffect(() => {
    slashCommandRef.current = { openMenu, closeMenu };
  }, [openMenu, closeMenu]);

  return slashCommandRef;
};
