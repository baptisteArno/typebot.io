import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import { typebotVersionSchema } from "@typebot.io/typebot/schemas/typebotVersion";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isWriteTypebotForbidden } from "../helpers/isWriteTypebotForbidden";
import { activateTypebotVersion } from "../helpers/publishTypebotSnapshot";

export const publishTypebotVersionInputSchema = z.object({
  typebotId: z.string(),
  versionNumber: z.coerce.number().int().positive(),
});

export const handlePublishTypebotVersion = async ({
  input: { typebotId, versionNumber },
  context: { user },
}: {
  input: z.infer<typeof publishTypebotVersionInputSchema>;
  context: { user: Pick<User, "id"> };
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
              role: true,
            },
          },
        },
      },
    },
  });
  if (
    !existingTypebot?.id ||
    (await isWriteTypebotForbidden(existingTypebot, user))
  )
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  const typebotVersion = await prisma.typebotVersion.findFirst({
    where: {
      typebotId,
      versionNumber,
    },
  });
  if (!typebotVersion)
    throw new ORPCError("NOT_FOUND", { message: "Typebot version not found" });

  await activateTypebotVersion({
    typebotVersion: typebotVersionSchema.parse(typebotVersion),
  });

  await prisma.typebot.update({
    where: { id: typebotId },
    data: {
      groups: typebotVersion.groups ?? undefined,
      events: typebotVersion.events ?? undefined,
      edges: typebotVersion.edges ?? undefined,
      variables: typebotVersion.variables ?? undefined,
      theme: typebotVersion.theme ?? undefined,
      settings: typebotVersion.settings ?? undefined,
    },
  });

  await trackEvents([
    {
      name: "Typebot version restored",
      workspaceId: existingTypebot.workspaceId,
      typebotId: existingTypebot.id,
      userId: user.id,
      data: {
        versionNumber,
      },
    },
  ]);

  return { message: "success" as const };
};
