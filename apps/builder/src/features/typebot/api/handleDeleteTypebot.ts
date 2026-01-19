import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import { removeObjectsFromTypebot } from "@typebot.io/lib/s3/removeObjectsRecursively";
import prisma from "@typebot.io/prisma";
import { archiveResults } from "@typebot.io/results/archiveResults";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isWriteTypebotForbidden } from "../helpers/isWriteTypebotForbidden";

export const deleteTypebotInputSchema = z.object({
  typebotId: z
    .string()
    .describe(
      "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)",
    ),
});

export const handleDeleteTypebot = async ({
  input: { typebotId },
  context: { user },
}: {
  input: z.infer<typeof deleteTypebotInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const existingTypebot = await prisma.typebot.findFirst({
    where: {
      id: typebotId,
    },
    select: {
      id: true,
      groups: true,
      workspace: {
        select: {
          id: true,
          isSuspended: true,
          isPastDue: true,
          members: {
            select: {
              userId: true,
              role: true,
            },
          },
        },
      },
      collaborators: {
        select: {
          userId: true,
          type: true,
        },
      },
    },
  });
  if (
    !existingTypebot?.id ||
    (await isWriteTypebotForbidden(existingTypebot, user))
  )
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  const { success } = await archiveResults(prisma)({
    typebot: {
      id: typebotId,
      workspaceId: existingTypebot.workspace.id,
      groups: existingTypebot.groups as Typebot["groups"],
    },
    resultsFilter: { typebotId },
  });
  if (!success)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to archive results",
    });
  await prisma.publicTypebot.deleteMany({
    where: { typebotId },
  });
  await prisma.typebot.updateMany({
    where: { id: typebotId },
    data: { isArchived: true, publicId: null, customDomain: null },
  });
  if (env.S3_BUCKET)
    await removeObjectsFromTypebot({
      workspaceId: existingTypebot.workspace.id,
      typebotId,
    });
  return {
    message: "success" as const,
  };
};
