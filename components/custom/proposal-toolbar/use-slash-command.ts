import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import {
  extractSlashQuery,
  getCursorPosition,
  isValidQuery,
  isValidSlashPosition,
  type SlashCommandState,
} from "./slash-command-utils";

const TEXT_BEFORE_CURSOR_LENGTH = 50;

/**
 * Hook to detect and manage slash command state
 */
export function useSlashCommand(editor: Editor | null): SlashCommandState {
  const [state, setState] = useState<SlashCommandState>({
    showMenu: false,
    query: "",
    position: null,
  });

  useEffect(() => {
    if (!editor) {
      setState({ showMenu: false, query: "", position: null });
      return;
    }

    const handleUpdate = () => {
      const { selection } = editor.state;
      const { $from } = selection;

      // Get text before cursor
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, $from.pos - TEXT_BEFORE_CURSOR_LENGTH),
        $from.pos,
      );

      const { slashIndex, query: queryText } = extractSlashQuery(textBefore);

      // No slash found, hide menu
      if (slashIndex === -1) {
        setState({ showMenu: false, query: "", position: null });
        return;
      }

      // Check if slash is at valid position
      if (!isValidSlashPosition(textBefore, slashIndex)) {
        setState({ showMenu: false, query: "", position: null });
        return;
      }

      // Check if query is valid
      if (!isValidQuery(queryText)) {
        setState({ showMenu: false, query: "", position: null });
        return;
      }

      // Get cursor position and show menu
      const position = getCursorPosition(editor);
      if (position) {
        setState({
          showMenu: true,
          query: queryText,
          position,
        });
      } else {
        setState({ showMenu: false, query: "", position: null });
      }
    };

    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor]);

  return state;
}
