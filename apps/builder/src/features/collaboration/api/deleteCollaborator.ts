import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { canEditGuests } from "@/helpers/databaseRules";

export const deleteCollaborator = authenticatedProcedure
  .input(
    z.object({
      typebotId: z.string(),
      userId: z.string(),
    }),
  )
  .handler(async ({ input: { typebotId, userId }, context: { user } }) => {
    await prisma.collaboratorsOnTypebots.deleteMany({
      where: { userId, typebot: canEditGuests(user, typebotId) },
    });
    return { message: "success" };
  });
