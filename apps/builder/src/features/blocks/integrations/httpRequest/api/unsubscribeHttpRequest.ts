import { canWriteTypebots } from "@/helpers/databaseRules";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { isHttpRequestBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { HttpRequestBlock } from "@typebot.io/blocks-integrations/httpRequest/schema";
import { parseGroups } from "@typebot.io/groups/schemas";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";

export const unsubscribeHttpRequest = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/typebots/{typebotId}/webhookBlocks/{blockId}/unsubscribe",
      protect: true,
      summary: "Unsubscribe from HTTP request block",
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

    const httpRequestBlock = groups
      .flatMap<Block>((g) => g.blocks)
      .find(byId(blockId)) as HttpRequestBlock | null;

    if (!httpRequestBlock || !isHttpRequestBlock(httpRequestBlock))
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "HTTP request block not found",
      });

    if (httpRequestBlock.options?.webhook || typebot.version === "6") {
      const updatedGroups = groups.map((group) =>
        group.blocks.some((b) => b.id === httpRequestBlock.id)
          ? {
              ...group,
              blocks: group.blocks.map((block) =>
                block.id !== httpRequestBlock.id
                  ? block
                  : {
                      ...block,
                      options: {
                        ...httpRequestBlock.options,
                        webhook: {
                          ...httpRequestBlock.options?.webhook,
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
      if ("webhookId" in httpRequestBlock)
        await prisma.webhook.update({
          where: { id: httpRequestBlock.webhookId },
          data: { url: null },
        });
      else
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "HTTP request block not found",
        });
    }

    return {
      id: blockId,
      url: null,
    };
  });
