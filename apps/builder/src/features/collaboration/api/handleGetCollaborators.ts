import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

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
    where: {
      id: typebotId,
    },
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
      workspace: {
        select: {
          isSuspended: true,
          isPastDue: true,
          members: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });
  if (
    !existingTypebot?.id ||
    (await isReadTypebotForbidden(existingTypebot, user))
  )
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  return {
    collaborators: existingTypebot.collaborators,
  };
};
