import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { CollaborationType } from "@typebot.io/prisma/enum";
import { z } from "@typebot.io/zod";
import { canEditGuests } from "@/helpers/databaseRules";

export const updateInvitation = authenticatedProcedure
  .input(
    z.object({
      typebotId: z.string(),
      email: z.string(),
      type: z.nativeEnum(CollaborationType),
    }),
  )
  .handler(async ({ input: { typebotId, email, type }, context: { user } }) => {
    await prisma.invitation.updateMany({
      where: { email, typebot: canEditGuests(user, typebotId) },
      data: { type },
    });
    return { message: "success" };
  });
