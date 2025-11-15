import { z } from "zod";

export const transcribeAudioSchema = z.object({
  audioBase64: z
    .string()
    .describe(
      "Audio encodé en base64 (par exemple depuis MediaRecorder côté client)",
    ),
  mimeType: z
    .string()
    .optional()
    .default("audio/webm")
    .describe("Type MIME de l'audio (ex: audio/webm, audio/ogg)"),
});

export type TranscribeAudioInput = z.infer<typeof transcribeAudioSchema>;
