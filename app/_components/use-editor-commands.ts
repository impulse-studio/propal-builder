"use client";

import { useEditorStore } from "./editor-store";

interface EditorCommand {
  type:
    | "insert"
    | "replace"
    | "append"
    | "setHeading"
    | "toggleBold"
    | "toggleItalic"
    | "toggleUnderline"
    | "insertBulletList"
    | "insertOrderedList"
    | "insertBlockquote"
    | "insertCodeBlock"
    | "insertHorizontalRule"
    | "insertLink"
    | "insertImage";
  content?: string;
  level?: 1 | 2 | 3;
  url?: string;
  text?: string;
  alt?: string;
}

export function useEditorCommands() {
  const {
    insertContent,
    replaceContent,
    setHeading,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    insertBulletList,
    insertOrderedList,
    insertBlockquote,
    insertCodeBlock,
    insertHorizontalRule,
    insertLink,
    insertImage,
    editor,
  } = useEditorStore();

  const executeCommand = (command: EditorCommand) => {
    if (!editor) {
      return;
    }

    switch (command.type) {
      case "insert":
        if (command.content) {
          insertContent(command.content);
        }
        break;
      case "replace":
        if (command.content) {
          replaceContent(command.content);
        }
        break;
      case "append":
        if (command.content) {
          editor.commands.insertContent(command.content, {
            parseOptions: {
              preserveWhitespace: "full",
            },
          });
        }
        break;
      case "setHeading":
        if (command.level) {
          setHeading(command.level);
        }
        break;
      case "toggleBold":
        toggleBold();
        break;
      case "toggleItalic":
        toggleItalic();
        break;
      case "toggleUnderline":
        toggleUnderline();
        break;
      case "insertBulletList":
        insertBulletList();
        break;
      case "insertOrderedList":
        insertOrderedList();
        break;
      case "insertBlockquote":
        insertBlockquote();
        break;
      case "insertCodeBlock":
        insertCodeBlock();
        break;
      case "insertHorizontalRule":
        insertHorizontalRule();
        break;
      case "insertLink":
        if (command.url) {
          insertLink(command.url, command.text);
        }
        break;
      case "insertImage":
        if (command.url) {
          insertImage(command.url, command.alt);
        }
        break;
      default:
        break;
    }
  };

  const parseAndExecuteCommand = (text: string) => {
    const commandPattern = /```editor-command\s+([\s\S]*?)```/g;
    const matches = [...text.matchAll(commandPattern)];

    matches.forEach((match) => {
      try {
        const command = JSON.parse(match[1]) as EditorCommand;
        executeCommand(command);
      } catch (error) {
        console.error("Failed to parse editor command:", error);
      }
    });
  };

  return {
    executeCommand,
    parseAndExecuteCommand,
    editor,
  };
}
