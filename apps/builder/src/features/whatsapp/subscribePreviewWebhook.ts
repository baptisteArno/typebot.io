import { publicProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@typebot.io/env";
import { z } from "@typebot.io/zod";

export const subscribePreviewWebhook = publicProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/whatsapp/preview/webhook",
      summary: "Subscribe webhook",
      tags: ["WhatsApp"],
    },
  })
  .input(
    z.object({
      "hub.challenge": z.string(),
      "hub.verify_token": z.string(),
    }),
  )
  .output(z.number())
  .query(
    async ({
      input: { "hub.challenge": challenge, "hub.verify_token": token },
    }) => {
      if (token !== env.ENCRYPTION_SECRET)
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      return Number(challenge);
    },
  );
