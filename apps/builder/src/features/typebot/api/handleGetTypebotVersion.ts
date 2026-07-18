import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { typebotVersionSchema } from "@typebot.io/typebot/schemas/typebotVersion";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const getTypebotVersionInputSchema = z.object({
  typebotId: z.string(),
  versionNumber: z.coerce.number().int().positive(),
});

export const handleGetTypebotVersion = async ({
  input: { typebotId, versionNumber },
  context: { user },
}: {
  input: z.infer<typeof getTypebotVersionInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const existingTypebot = await prisma.typebot.findFirst({
    where: {
      id: typebotId,
    },
    include: {
      collaborators: true,
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

  const version = await prisma.typebotVersion.findFirst({
    where: {
      typebotId,
      versionNumber,
    },
  });
  if (!version)
    throw new ORPCError("NOT_FOUND", { message: "Typebot version not found" });

  return {
    version: typebotVersionSchema.parse(version),
  };
};
