import { ORPCError } from "@orpc/server";
import { isHttpRequestBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { HttpRequestBlock } from "@typebot.io/blocks-integrations/httpRequest/schema";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import { z } from "@typebot.io/zod";
import { canWriteTypebots } from "@/helpers/databaseRules";

export const subscribeHttpRequest = authenticatedProcedure
  .route({
    method: "POST",
    path: "/v1/typebots/{typebotId}/webhookBlocks/{blockId}/subscribe",
    summary: "Subscribe to HTTP request block",
    tags: ["HTTP request"],
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
  .handler(
    async ({ input: { typebotId, blockId, url }, context: { user } }) => {
      const typebot = await prisma.typebot.findFirst({
        where: canWriteTypebots(typebotId, user),
        select: {
          version: true,
          groups: true,
        },
      });

      if (!typebot)
        throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

      const groups = parseGroups(typebot.groups, {
        typebotVersion: typebot.version,
      });

      const httpRequestBlock = groups
        .flatMap<Block>((g) => g.blocks)
        .find(byId(blockId)) as HttpRequestBlock | null;

      if (!httpRequestBlock || !isHttpRequestBlock(httpRequestBlock))
        throw new ORPCError("NOT_FOUND", {
          message: "HttpRequest block not found",
        });

      if (
        httpRequestBlock.options?.webhook ||
        isTypebotVersionAtLeastV6(typebot.version)
      ) {
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
          throw new ORPCError("NOT_FOUND", {
            message: "HttpRequest block not found",
          });
      }

      return {
        id: blockId,
        url,
      };
    },
  );
