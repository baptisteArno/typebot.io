import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { CollaborationType } from "@typebot.io/prisma/enum";
import { z } from "@typebot.io/zod";
import { canEditGuests } from "@/helpers/databaseRules";

export const updateCollaborator = authenticatedProcedure
  .input(
    z.object({
      typebotId: z.string(),
      userId: z.string(),
      type: z.nativeEnum(CollaborationType),
    }),
  )
  .handler(
    async ({ input: { typebotId, userId, type }, context: { user } }) => {
      await prisma.collaboratorsOnTypebots.updateMany({
        where: { userId, typebot: canEditGuests(user, typebotId) },
        data: { type },
      });
      return { message: "success" };
    },
  );
