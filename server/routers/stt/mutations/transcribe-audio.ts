import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

import { env } from "@/env";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { transcribeAudioSchema } from "../validators";

export const transcribeAudioBase = publicProcedure
  .route({ method: "POST" })
  .input(transcribeAudioSchema)
  .errors({
    ELEVENLABS_STT_FAILED: {
      status: 502,
    },
  });

export const transcribeAudioHandler = transcribeAudioBase.handler(
  async ({ input, errors }) => {
    const { audioBase64, mimeType } = input;

    try {
      const client = new ElevenLabsClient({
        apiKey: env.ELEVENLABS_API_KEY,
      });

      const audioBuffer = Buffer.from(audioBase64, "base64");
      const blob = new Blob([audioBuffer], {
        type: mimeType ?? "audio/webm",
      });

      const transcription = await client.speechToText.convert({
        file: blob,
        modelId: "scribe_v1",
        tagAudioEvents: true,
        languageCode: "eng",
        diarize: true,
      });

      const text =
        (transcription as { text?: string }).text ??
        (transcription as { transcription?: string }).transcription ??
        "";

      return { text: text.trim() };
    } catch (error) {
      // The ElevenLabs client already throws rich errors; we log and map to a typed oRPC error.
      console.error("ElevenLabs STT error:", error);
      throw errors.ELEVENLABS_STT_FAILED();
    }
  },
);
