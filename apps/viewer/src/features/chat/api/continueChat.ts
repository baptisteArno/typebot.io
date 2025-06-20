import { publicProcedure } from "@/helpers/server/trpc";
import { continueChat as continueChatFn } from "@typebot.io/bot-engine/apiHandlers/continueChat";
import {
  continueChatResponseSchema,
  messageSchema,
} from "@typebot.io/chat-api/schemas";
import { z } from "@typebot.io/zod";

export const continueChat = publicProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/sessions/{sessionId}/continueChat",
      summary: "Continue chat",
    },
  })
  .input(
    z.object({
      message: messageSchema.nullish(),
      sessionId: z
        .string()
        .describe(
          "The session ID you got from the [startChat](./start-chat) response.",
        ),
      textBubbleContentFormat: z
        .enum(["richText", "markdown"])
        .default("richText"),
    }),
  )
  .output(continueChatResponseSchema)
  .mutation(
    async ({
      input: { sessionId, message, textBubbleContentFormat },
      ctx: { origin, iframeReferrerOrigin },
    }) =>
      continueChatFn({
        origin,
        iframeReferrerOrigin,
        sessionId,
        message: message ?? undefined,
        textBubbleContentFormat,
      }),
  );
