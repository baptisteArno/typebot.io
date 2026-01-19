import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canReadTypebots } from "@/helpers/databaseRules";

export const getTypebotBlocksInputSchema = z.object({
  typebotId: z.string(),
});

export const handleGetTypebotBlocks = async ({
  input: { typebotId },
  context: { user },
}: {
  input: z.infer<typeof getTypebotBlocksInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const typebot = await prisma.typebot.findFirst({
    where: canReadTypebots(typebotId, user),
    select: { groups: true },
  });

  if (!typebot)
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  return { groups: typebot.groups };
};
