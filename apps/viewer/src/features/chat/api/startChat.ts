import { publicProcedure } from "@/helpers/server/trpc";
import { startChat as startChatFn } from "@typebot.io/bot-engine/apiHandlers/startChat";
import {
  startChatInputSchema,
  startChatResponseSchema,
} from "@typebot.io/bot-engine/schemas/api";

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
