import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { DbNull } from "@typebot.io/prisma/enum";
import { getTypebotAccessRight } from "@typebot.io/typebot/helpers/getTypebotAccessRight";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { migrateTypebot } from "@typebot.io/typebot/migrations/migrateTypebot";
import {
  type Typebot,
  type TypebotV6,
  typebotSchema,
} from "@typebot.io/typebot/schemas/typebot";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const getTypebotInputSchema = z.object({
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

export const handleGetTypebot = async ({
  input: { typebotId, migrateToLatestVersion },
  context: { user },
}: {
  input: z.infer<typeof getTypebotInputSchema>;
  context: { user: Pick<User, "id" | "email"> | null };
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
    throw new ORPCError("NOT_FOUND", {
      message: "Typebot not found",
    });

  try {
    const { typebot, wasMigrated } = (
      migrateToLatestVersion
        ? await migrateTypebot(typebotSchema.parse(existingTypebot))
        : {
            typebot: typebotSchema.parse(existingTypebot),
            wasMigrated: false,
          }
    ) as
      | { typebot: TypebotV6; wasMigrated: true }
      | { typebot: Typebot; wasMigrated: false };

    if (wasMigrated)
      await prisma.typebot.update({
        where: {
          id: existingTypebot.id,
        },
        data: {
          version: typebot.version,
          name: typebot.name,
          icon: typebot.icon,
          selectedThemeTemplateId: typebot.selectedThemeTemplateId,
          events: typebot.events,
          groups: typebot.groups,
          theme: typebot.theme ? typebot.theme : undefined,
          settings: typebot.settings ? typebot.settings : undefined,
          folderId: typebot.folderId,
          variables: typebot.variables,
          edges: typebot.edges,
          resultsTablePreferences:
            typebot.resultsTablePreferences === null
              ? DbNull
              : typebot.resultsTablePreferences,
          publicId: typebot.publicId === null ? null : typebot.publicId,
          customDomain: typebot.customDomain,
          isClosed: typebot.isClosed,
          whatsAppCredentialsId: typebot.whatsAppCredentialsId ?? undefined,
        },
      });

    return {
      typebot,
      currentUserMode: getTypebotAccessRight(user, existingTypebot),
    };
  } catch (err) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to parse typebot",
      cause: err,
    });
  }
};
