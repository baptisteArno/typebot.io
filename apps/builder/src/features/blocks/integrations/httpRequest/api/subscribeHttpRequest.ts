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

export const subscribeHttpRequest = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/typebots/{typebotId}/webhookBlocks/{blockId}/subscribe",
      protect: true,
      summary: "Subscribe to HTTP request block",
      tags: ["HTTP request"],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      blockId: z.string(),
      url: z.string(),
    }),
  )
  .output(
    z.object({
      id: z.string(),
      url: z.string().nullable(),
    }),
  )
  .query(async ({ input: { typebotId, blockId, url }, ctx: { user } }) => {
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
        message: "HttpRequest block not found",
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
                          url,
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
          data: { url },
        });
      else
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "HttpRequest block not found",
        });
    }

    return {
      id: blockId,
      url,
    };
  });
