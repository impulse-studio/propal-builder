import { streamToEventIterator } from "@orpc/server";
import { convertToModelMessages, createUIMessageStream, streamText } from "ai";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { sendMessageSchema } from "../validators";

export const sendMessageBase = publicProcedure
  .route({ method: "POST" })
  .input(sendMessageSchema)
  .errors({
    INVALID_INPUT: { message: "Invalid conversation input" },
  });

export const sendMessageHandler = sendMessageBase.handler(
  async ({ input, errors }) => {
    const { messages } = input;

    if (!messages || messages.length === 0) {
      throw errors.INVALID_INPUT();
    }

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({
          type: "data-sessionId",
          data: { sessionId: input.sessionId },
          transient: true,
        });

        const result = streamText({
          model: "google/gemini-2.5-pro",
          messages: convertToModelMessages(messages),
          providerOptions: {
            google: {
              thinkingConfig: {
                thinkingBudget: 8192,
                includeThoughts: true,
              },
            },
          },
        });

        writer.merge(result.toUIMessageStream({ originalMessages: messages }));
      },
    });

    return streamToEventIterator(stream);
  },
);
