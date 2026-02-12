import { ORPCError } from "@orpc/server";
import { isHttpRequestBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canReadTypebots } from "@/helpers/databaseRules";

export const listHttpRequestBlocksInputSchema = z.object({
  typebotId: z.string(),
});

export const handleListHttpRequestBlocks = async ({
  input: { typebotId },
  context: { user },
}: {
  input: z.infer<typeof listHttpRequestBlocksInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const typebot = await prisma.typebot.findFirst({
    where: canReadTypebots(typebotId, user),
    select: {
      version: true,
      groups: true,
      webhooks: true,
    },
  });
  if (!typebot)
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  const groups = parseGroups(typebot.groups, {
    typebotVersion: typebot.version,
  });

  const httpRequestBlocks = groups.reduce<
    {
      id: string;
      label: string;
      url: string | undefined;
      type:
        | IntegrationBlockType.HTTP_REQUEST
        | IntegrationBlockType.ZAPIER
        | IntegrationBlockType.MAKE_COM
        | IntegrationBlockType.PABBLY_CONNECT;
    }[]
  >((httpRequestBlock, group) => {
    const blocks = (group.blocks as Block[]).filter(isHttpRequestBlock);
    httpRequestBlock.push(
      ...blocks.map((block) => ({
        id: block.id,
        type: block.type,
        label: `${group.title} > ${block.id}`,
        url:
          "webhookId" in block && !block.options?.webhook
            ? (typebot?.webhooks.find(byId(block.webhookId))?.url ?? undefined)
            : block.options?.webhook?.url,
      })),
    );
    return httpRequestBlock;
  }, []);

  return { webhookBlocks: httpRequestBlocks };
};
