import { startChat as startChatFn } from "@typebot.io/bot-engine/apiHandlers/startChat";
import {
  startChatInputSchema,
  startChatResponseSchema,
} from "@typebot.io/chat-api/schemas";
import { publicProcedure } from "@/helpers/server/trpc";

export const startChat = publicProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/typebots/{publicId}/startChat",
      summary: "Start chat",
    },
  })
  .input(startChatInputSchema)
  .output(startChatResponseSchema)
  .mutation(async ({ input, ctx: { origin, iframeReferrerOrigin } }) =>
    startChatFn({
      ...input,
      origin,
      iframeReferrerOrigin,
    }),
  );
