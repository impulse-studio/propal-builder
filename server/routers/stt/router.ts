import { base } from "@/server/context";
import { transcribeAudioHandler } from "./mutations";

export const sttRouter = base.router({
  transcribeAudio: transcribeAudioHandler,
});
