import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canReadTypebots } from "@/helpers/databaseRules";

export const getCollaboratorsInputSchema = z.object({
  typebotId: z.string(),
});

export const handleGetCollaborators = async ({
  input: { typebotId },
  context: { user },
}: {
  input: z.infer<typeof getCollaboratorsInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const existingTypebot = await prisma.typebot.findFirst({
    where: canReadTypebots(typebotId, user),
    include: {
      collaborators: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
              email: true,
            },
          },
        },
      },
    },
  });
  if (!existingTypebot)
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  return {
    collaborators: existingTypebot.collaborators,
  };
};
