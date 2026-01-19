import { ORPCError } from "@orpc/server";
import { isHttpRequestBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { HttpRequestBlock } from "@typebot.io/blocks-integrations/httpRequest/schema";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canWriteTypebots } from "@/helpers/databaseRules";

export const unsubscribeHttpRequestInputSchema = z.object({
  typebotId: z.string(),
  blockId: z.string(),
});

export const handleUnsubscribeHttpRequest = async ({
  input: { typebotId, blockId },
  context: { user },
}: {
  input: z.infer<typeof unsubscribeHttpRequestInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
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
      message: "HTTP request block not found",
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
      throw new ORPCError("NOT_FOUND", {
        message: "HTTP request block not found",
      });
  }

  return {
    id: blockId,
    url: null,
  };
};
