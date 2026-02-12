import { ORPCError } from "@orpc/server";
import { isHttpRequestBlock } from "@typebot.io/blocks-core/helpers";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const getMakeComBlocksInputSchema = z.object({
  typebotId: z.string(),
});

export const handleGetMakeComBlocks = async ({
  context: { user },
  input: { typebotId },
}: {
  context: { user: Pick<User, "id"> };
  input: z.infer<typeof getMakeComBlocksInputSchema>;
}) => {
  const typebot = await prisma.typebot.findFirst({
    where: {
      id: typebotId,
      workspace: { members: { some: { userId: user.id } } },
    },
    select: { groups: true, version: true },
  });
  if (!typebot)
    throw new ORPCError("NOT_FOUND", {
      message: "Typebot not found",
    });
  const groups = parseGroups(typebot?.groups, {
    typebotVersion: typebot?.version,
  });
  const emptyHttpRequestBlocks = groups.reduce<
    { id: string; blockId: string; name: string }[]
  >((emptyWebhookBlocks, group) => {
    const blocks = group.blocks.filter((block) => isHttpRequestBlock(block));
    emptyWebhookBlocks.push(
      ...blocks.map((b) => ({
        // Duplicate id to keep compatibility with old API
        id: b.id,
        blockId: b.id,
        name: `${group.title} > ${b.id}`,
      })),
    );
    return emptyWebhookBlocks;
  }, []);

  return { blocks: emptyHttpRequestBlocks };
};
