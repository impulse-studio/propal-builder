/**
 * Slash Command Module
 *
 * Provides slash command functionality for the Tiptap editor.
 * Organized into reusable hooks, utilities, and components.
 */

export { SlashExtension } from "@/lib/utils/tiptap/slash-extension";
export {
  Cmd as SlashCmd,
  Root as SlashCmdRoot,
  useSlashCommandExtension,
} from "../slash-cmd";
export { useSlashCommand } from "../use-slash-command";
