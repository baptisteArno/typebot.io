import { ORPCError } from "@orpc/server";
import { parseSampleResult } from "@typebot.io/bot-engine/blocks/integrations/httpRequest/parseSampleResult";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import prisma from "@typebot.io/prisma";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { z } from "@typebot.io/zod";
import { fetchLinkedTypebots } from "@/features/blocks/logic/typebotLink/helpers/fetchLinkedTypebots";
import { canReadTypebots } from "@/helpers/databaseRules";

export const getResultExample = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/typebots/{typebotId}/webhookBlocks/{blockId}/getResultExample",
      protect: true,
      summary: "Get result example",
      description:
        'Returns "fake" result for http request block to help you anticipate how the webhook will behave.',
      tags: ["HTTP request"],
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
  .handler(async ({ input: { typebotId, blockId }, context: { user } }) => {
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
      throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

    const { group } = getBlockById(blockId, typebot.groups);

    if (!group)
      throw new ORPCError("NOT_FOUND", { message: "Block not found" });

    const linkedTypebots = await fetchLinkedTypebots(typebot, user);

    return {
      resultExample: await parseSampleResult(
        typebot,
        linkedTypebots,
        user.email ?? undefined,
      )(group.id, typebot.variables),
    };
  });
