import { ORPCError } from "@orpc/server";
import { parseSampleResult } from "@typebot.io/bot-engine/blocks/integrations/httpRequest/parseSampleResult";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import prisma from "@typebot.io/prisma";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type { User } from "@typebot.io/user/schemas";
import { z } from "@typebot.io/zod";
import { fetchLinkedTypebots } from "@/features/blocks/logic/typebotLink/helpers/fetchLinkedTypebots";
import { canReadTypebots } from "@/helpers/databaseRules";

export const getResultExampleInputSchema = z.object({
  typebotId: z.string(),
  blockId: z.string(),
});

export const handleGetResultExample = async ({
  input: { typebotId, blockId },
  context: { user },
}: {
  input: z.infer<typeof getResultExampleInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
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

  if (!group) throw new ORPCError("NOT_FOUND", { message: "Block not found" });

  const linkedTypebots = await fetchLinkedTypebots(typebot, user);

  return {
    resultExample: await parseSampleResult(
      typebot,
      linkedTypebots,
      user.email ?? undefined,
    )(group.id, typebot.variables),
  };
};
