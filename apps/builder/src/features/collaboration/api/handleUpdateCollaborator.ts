import prisma from "@typebot.io/prisma";
import { CollaborationType } from "@typebot.io/prisma/enum";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canEditGuests } from "@/helpers/databaseRules";

export const updateCollaboratorInputSchema = z.object({
  typebotId: z.string(),
  userId: z.string(),
  type: z.nativeEnum(CollaborationType),
});

export const handleUpdateCollaborator = async ({
  input: { typebotId, userId, type },
  context: { user },
}: {
  input: z.infer<typeof updateCollaboratorInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  await prisma.collaboratorsOnTypebots.updateMany({
    where: { userId, typebot: canEditGuests(user, typebotId) },
    data: { type },
  });
  return { message: "success" };
};
