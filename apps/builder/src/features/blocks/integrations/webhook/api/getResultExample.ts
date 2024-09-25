import { fetchLinkedTypebots } from "@/features/blocks/logic/typebotLink/helpers/fetchLinkedTypebots";
import { canReadTypebots } from "@/helpers/databaseRules";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { parseSampleResult } from "@typebot.io/bot-engine/blocks/integrations/webhook/parseSampleResult";
import { getBlockById } from "@typebot.io/groups/helpers";
import prisma from "@typebot.io/prisma";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { z } from "@typebot.io/zod";

export const getResultExample = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/typebots/{typebotId}/webhookBlocks/{blockId}/getResultExample",
      protect: true,
      summary: "Get result example",
      description:
        'Returns "fake" result for webhook block to help you anticipate how the webhook will behave.',
      tags: ["Webhook"],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      blockId: z.string(),
    }),
  )
  .output(
    z.object({
      resultExample: z.record(z.any()).describe("Can contain any fields."),
    }),
  )
  .query(async ({ input: { typebotId, blockId }, ctx: { user } }) => {
    const typebot = (await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, user),
      select: {
        groups: true,
        edges: true,
        variables: true,
        events: true,
      },
    })) as Pick<Typebot, "groups" | "edges" | "variables" | "events"> | null;

    if (!typebot)
      throw new TRPCError({ code: "NOT_FOUND", message: "Typebot not found" });

    const { group } = getBlockById(blockId, typebot.groups);

    if (!group)
      throw new TRPCError({ code: "NOT_FOUND", message: "Block not found" });

    const linkedTypebots = await fetchLinkedTypebots(typebot, user);

    return {
      resultExample: await parseSampleResult(
        typebot,
        linkedTypebots,
        user.email ?? undefined,
      )(group.id, typebot.variables),
    };
  });
