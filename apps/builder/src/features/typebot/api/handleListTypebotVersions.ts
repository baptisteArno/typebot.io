import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { typebotVersionMetadataSchema } from "@typebot.io/typebot/schemas/typebotVersion";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const listTypebotVersionsInputSchema = z.object({
  typebotId: z.string(),
});

export const listedTypebotVersionSchema = typebotVersionMetadataSchema.extend({
  isActive: z.boolean(),
});

export const handleListTypebotVersions = async ({
  input: { typebotId },
  context: { user },
}: {
  input: z.infer<typeof listTypebotVersionsInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const existingTypebot = await prisma.typebot.findFirst({
    where: {
      id: typebotId,
    },
    include: {
      collaborators: true,
      publishedTypebot: {
        select: {
          activeVersionId: true,
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

  const versions = await prisma.typebotVersion.findMany({
    where: {
      typebotId,
    },
    orderBy: {
      versionNumber: "desc",
    },
    select: {
      id: true,
      typebotId: true,
      versionNumber: true,
      version: true,
      createdAt: true,
      createdById: true,
    },
  });

  return {
    versions: versions.map((version) =>
      listedTypebotVersionSchema.parse({
        ...version,
        isActive:
          version.id === existingTypebot.publishedTypebot?.activeVersionId,
      }),
    ),
  };
};
