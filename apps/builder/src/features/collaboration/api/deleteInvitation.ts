import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { canEditGuests } from "@/helpers/databaseRules";

export const deleteInvitation = authenticatedProcedure
  .input(
    z.object({
      typebotId: z.string(),
      email: z.string(),
    }),
  )
  .handler(async ({ input: { typebotId, email }, context: { user } }) => {
    await prisma.invitation.deleteMany({
      where: {
        email,
        typebot: canEditGuests(user, typebotId),
      },
    });
    return { message: "success" };
  });
