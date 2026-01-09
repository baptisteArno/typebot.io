import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { canReadTypebots } from "@/helpers/databaseRules";

export const getTypebotBlocks = authenticatedProcedure
  .input(
    z.object({
      typebotId: z.string(),
    }),
  )
  .handler(async ({ input: { typebotId }, context: { user } }) => {
    const typebot = await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, user),
      select: { groups: true },
    });

    if (!typebot)
      throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

    return { groups: typebot.groups };
  });
