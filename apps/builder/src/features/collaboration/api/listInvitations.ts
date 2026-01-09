import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { canReadTypebots } from "@/helpers/databaseRules";

export const listInvitations = authenticatedProcedure
  .input(
    z.object({
      typebotId: z.string(),
    }),
  )
  .handler(async ({ input: { typebotId }, context: { user } }) => {
    const invitations = await prisma.invitation.findMany({
      where: { typebotId, typebot: canReadTypebots(typebotId, user) },
    });
    return { invitations };
  });
