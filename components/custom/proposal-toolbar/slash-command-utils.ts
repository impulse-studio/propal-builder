import type { Editor } from "@tiptap/react";

export type SlashCommandState = {
  showMenu: boolean;
  query: string;
  position: { top: number; left: number } | null;
};

const TEXT_BEFORE_CURSOR_LENGTH = 50;

/**
 * Checks if a "/" character is at a valid position (start of line or after space)
 */
export function isValidSlashPosition(
  textBefore: string,
  slashIndex: number,
): boolean {
  if (slashIndex === -1) return false;

  const textBeforeSlash = textBefore.slice(0, slashIndex);
  const isStartOfLine =
    slashIndex === 0 || textBeforeSlash.match(/\n\s*$/) !== null;
  const isAfterSpace = textBeforeSlash.slice(-1) === " ";

  return isStartOfLine || isAfterSpace;
}

/**
 * Checks if the query text is valid (no newlines or leading spaces)
 */
export function isValidQuery(queryText: string): boolean {
  return (
    !queryText.includes("\n") && !(queryText.length > 0 && queryText[0] === " ")
  );
}

/**
 * Extracts the slash command query from text before cursor
 */
export function extractSlashQuery(textBefore: string): {
  slashIndex: number;
  query: string;
} {
  const slashIndex = textBefore.lastIndexOf("/");
  const query = slashIndex !== -1 ? textBefore.slice(slashIndex + 1) : "";

  return { slashIndex, query };
}

/**
 * Gets the cursor position relative to the editor element
 */
export function getCursorPosition(editor: Editor): {
  top: number;
  left: number;
} | null {
  try {
    const { selection } = editor.state;
    const { $from } = selection;
    const coords = editor.view.coordsAtPos($from.pos);
    const editorElement =
      editor.view.dom.closest(".editor-content") || editor.view.dom;
    const editorRect = editorElement.getBoundingClientRect();

    return {
      top: coords.top - editorRect.top + 20,
      left: coords.left - editorRect.left,
    };
  } catch {
    return null;
  }
}

/**
 * Removes the slash command text from the editor
 */
export function removeSlashCommand(editor: Editor): void {
  const { selection } = editor.state;
  const { $from } = selection;
  const textBefore = editor.state.doc.textBetween(
    Math.max(0, $from.pos - TEXT_BEFORE_CURSOR_LENGTH),
    $from.pos,
  );
  const { slashIndex } = extractSlashQuery(textBefore);

  if (slashIndex !== -1) {
    const startPos = $from.pos - (textBefore.length - slashIndex);
    editor.chain().focus().deleteRange({ from: startPos, to: $from.pos }).run();
  }
}
