import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { migratePublicTypebot } from "@typebot.io/typebot/migrations/migrateTypebot";
import { publicTypebotSchema } from "@typebot.io/typebot/schemas/publicTypebot";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const getPublishedTypebotInputSchema = z.object({
  typebotId: z
    .string()
    .describe(
      "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)",
    ),
  migrateToLatestVersion: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "If enabled, the typebot will be converted to the latest schema version",
    ),
});

export const handleGetPublishedTypebot = async ({
  input: { typebotId, migrateToLatestVersion },
  context: { user },
}: {
  input: z.infer<typeof getPublishedTypebotInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const existingTypebot = await prisma.typebot.findFirst({
    where: {
      id: typebotId,
    },
    include: {
      collaborators: true,
      publishedTypebot: true,
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

  if (!existingTypebot.publishedTypebot)
    return {
      publishedTypebot: null,
    };

  try {
    const parsedTypebot = migrateToLatestVersion
      ? await migratePublicTypebot(
          publicTypebotSchema.parse(existingTypebot.publishedTypebot),
        )
      : publicTypebotSchema.parse(existingTypebot.publishedTypebot);

    return {
      publishedTypebot: parsedTypebot,
      version: migrateToLatestVersion
        ? ((existingTypebot.version ?? "3") as Typebot["version"])
        : undefined,
    };
  } catch (err) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to parse published typebot",
      cause: err,
    });
  }
};
