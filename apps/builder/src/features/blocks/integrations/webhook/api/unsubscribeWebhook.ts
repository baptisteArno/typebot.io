import { canWriteTypebots } from "@/helpers/databaseRules";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { isWebhookBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { HttpRequestBlock } from "@typebot.io/blocks-integrations/webhook/schema";
import { parseGroups } from "@typebot.io/groups/schemas";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";

export const unsubscribeWebhook = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/typebots/{typebotId}/webhookBlocks/{blockId}/unsubscribe",
      protect: true,
      summary: "Unsubscribe from webhook block",
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
      id: z.string(),
      url: z.string().nullable(),
    }),
  )
  .query(async ({ input: { typebotId, blockId }, ctx: { user } }) => {
    const typebot = await prisma.typebot.findFirst({
      where: canWriteTypebots(typebotId, user),
      select: {
        version: true,
        groups: true,
      },
    });

    if (!typebot)
      throw new TRPCError({ code: "NOT_FOUND", message: "Typebot not found" });

    const groups = parseGroups(typebot.groups, {
      typebotVersion: typebot.version,
    });

    const webhookBlock = groups
      .flatMap<Block>((g) => g.blocks)
      .find(byId(blockId)) as HttpRequestBlock | null;

    if (!webhookBlock || !isWebhookBlock(webhookBlock))
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Webhook block not found",
      });

    if (webhookBlock.options?.webhook || typebot.version === "6") {
      const updatedGroups = groups.map((group) =>
        group.blocks.some((b) => b.id === webhookBlock.id)
          ? {
              ...group,
              blocks: group.blocks.map((block) =>
                block.id !== webhookBlock.id
                  ? block
                  : {
                      ...block,
                      options: {
                        ...webhookBlock.options,
                        webhook: {
                          ...webhookBlock.options?.webhook,
                          url: undefined,
                        },
                      },
                    },
              ),
            }
          : group,
      );
      await prisma.typebot.updateMany({
        where: { id: typebotId },
        data: {
          groups: updatedGroups,
        },
      });
    } else {
      if ("webhookId" in webhookBlock)
        await prisma.webhook.update({
          where: { id: webhookBlock.webhookId },
          data: { url: null },
        });
      else
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Webhook block not found",
        });
    }

    return {
      id: blockId,
      url: null,
    };
  });
