import { ORPCError } from "@orpc/server";
import { parseSampleResult } from "@typebot.io/bot-engine/blocks/integrations/httpRequest/parseSampleResult";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import prisma from "@typebot.io/prisma";
import { edgeSchema } from "@typebot.io/typebot/schemas/edge";
import type { User } from "@typebot.io/user/schemas";
import { variableSchema } from "@typebot.io/variables/schemas";
import { z } from "zod";
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
  const typebotResult = await prisma.typebot.findFirst({
    where: canReadTypebots(typebotId, user),
    select: {
      version: true,
      groups: true,
      edges: true,
      variables: true,
    },
  });

  if (!typebotResult)
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  const typebot = {
    groups: parseGroups(typebotResult.groups, {
      typebotVersion: typebotResult.version,
    }),
    edges: z.array(edgeSchema).parse(typebotResult.edges),
    variables: z.array(variableSchema).parse(typebotResult.variables),
  };

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
