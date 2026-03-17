import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { DbNull } from "@typebot.io/prisma/enum";
import { migrateTypebot } from "@typebot.io/typebot/migrations/migrateTypebot";
import {
  typebotSchema,
  typebotV5Schema,
  typebotV6Schema,
} from "@typebot.io/typebot/schemas/typebot";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import { isWriteTypebotForbidden } from "../helpers/isWriteTypebotForbidden";
import {
  isCustomDomainNotAvailable,
  isPublicIdNotAvailable,
  sanitizeCustomDomain,
  sanitizeGroups,
  sanitizeSettings,
  sanitizeVariables,
} from "../helpers/sanitizers";

const typebotUpdateSchemaPick = {
  version: true,
  name: true,
  icon: true,
  selectedThemeTemplateId: true,
  groups: true,
  theme: true,
  settings: true,
  folderId: true,
  variables: true,
  edges: true,
  resultsTablePreferences: true,
  publicId: true,
  customDomain: true,
  isClosed: true,
  whatsAppCredentialsId: true,
  riskLevel: true,
  events: true,
  updatedAt: true,
} as const;

export const updateTypebotInputSchema = z.object({
  typebotId: z
    .string()
    .describe(
      "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)",
    ),
  typebot: z.union([
    typebotV6Schema.pick(typebotUpdateSchemaPick).partial(),
    typebotV5Schema.pick(typebotUpdateSchemaPick).partial(),
  ]),
  overwrite: z
    .boolean()
    .optional()
    .describe(
      "If true, even if we detect a conflict, we will overwrite push the updates to the typebot",
    ),
});

export const handleUpdateTypebot = async ({
  input: { typebotId, typebot, overwrite },
  context: { user },
}: {
  input: z.infer<typeof updateTypebotInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const existingTypebot = await prisma.typebot.findFirst({
    where: {
      id: typebotId,
    },
    select: {
      version: true,
      id: true,
      customDomain: true,
      publicId: true,
      collaborators: {
        select: {
          userId: true,
          type: true,
        },
      },
      workspace: {
        select: {
          id: true,
          plan: true,
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
      updatedAt: true,
    },
  });

  if (
    !existingTypebot?.id ||
    (await isWriteTypebotForbidden(existingTypebot, user))
  )
    throw new ORPCError("NOT_FOUND", {
      message: "Typebot not found",
    });

  const conflictMarginMs = 5 * 1000;
  if (
    typebot.updatedAt &&
    existingTypebot.updatedAt.getTime() >
      typebot.updatedAt.getTime() + conflictMarginMs &&
    !overwrite
  )
    throw new ORPCError("CONFLICT", {
      message: "Found newer version of the typebot in database",
    });

  if (
    typebot.customDomain &&
    existingTypebot.customDomain !== typebot.customDomain &&
    (await isCustomDomainNotAvailable({
      customDomain: typebot.customDomain,
      workspaceId: existingTypebot.workspace.id,
    }))
  )
    throw new ORPCError("BAD_REQUEST", {
      message: "Domain + pathname already in use",
    });

  if (typebot.publicId) {
    if (isCloudProdInstance() && typebot.publicId.length < 4)
      throw new ORPCError("BAD_REQUEST", {
        message: "Public id should be at least 4 characters long",
      });
    if (
      existingTypebot.publicId !== typebot.publicId &&
      (await isPublicIdNotAvailable(typebot.publicId))
    )
      throw new ORPCError("BAD_REQUEST", {
        message: "Public id not available",
      });
  }

  const groups = typebot.groups
    ? await sanitizeGroups(typebot.groups, {
        workspace: existingTypebot.workspace,
      })
    : undefined;

  const newTypebot = await prisma.typebot.update({
    where: {
      id: existingTypebot.id,
    },
    data: {
      version: typebot.version ?? undefined,
      name: typebot.name,
      icon: typebot.icon,
      selectedThemeTemplateId: typebot.selectedThemeTemplateId,
      events: typebot.events ?? undefined,
      groups,
      theme: typebot.theme ? typebot.theme : undefined,
      settings: typebot.settings
        ? sanitizeSettings(
            typebot.settings,
            existingTypebot.workspace.plan,
            "update",
          )
        : undefined,
      folderId: typebot.folderId,
      variables:
        typebot.variables && groups
          ? sanitizeVariables({
              variables: typebot.variables,
              groups,
            })
          : undefined,
      edges: typebot.edges,
      resultsTablePreferences:
        typebot.resultsTablePreferences === null
          ? DbNull
          : typebot.resultsTablePreferences,
      publicId:
        typebot.publicId === null
          ? null
          : typebot.publicId && isPublicIdValid(typebot.publicId)
            ? typebot.publicId
            : undefined,
      customDomain: await sanitizeCustomDomain({
        customDomain: typebot.customDomain,
        workspaceId: existingTypebot.workspace.id,
      }),
      isClosed: typebot.isClosed,
      whatsAppCredentialsId: typebot.whatsAppCredentialsId ?? undefined,
    },
  });

  const { typebot: migratedTypebot } = await migrateTypebot(
    typebotSchema.parse(newTypebot),
  );

  return { typebot: migratedTypebot };
};

const isPublicIdValid = (str: string) =>
  /^([a-z0-9]+-[a-z0-9]*)*$/.test(str) || /^[a-z0-9]*$/.test(str);
