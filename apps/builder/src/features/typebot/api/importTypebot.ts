import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { copyObjects } from "@typebot.io/lib/s3/copyObjects";
import { replaceTypebotUploadUrlsWithNewIds } from "@typebot.io/lib/s3/replaceTypebotUploadUrlsWithNewIds";
import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import { migrateTypebot } from "@typebot.io/typebot/migrations/migrateTypebot";
import { preprocessTypebot } from "@typebot.io/typebot/preprocessTypebot";
import {
  resultsTablePreferencesSchema,
  type Typebot,
  type TypebotV6,
  typebotV5Schema,
  typebotV6Schema,
} from "@typebot.io/typebot/schemas/typebot";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import {
  sanitizeFolderId,
  sanitizeGroups,
  sanitizeSettings,
  sanitizeVariables,
} from "../helpers/sanitizers";

const omittedProps = {
  id: true,
  whatsAppCredentialsId: true,
  riskLevel: true,
  isClosed: true,
  isArchived: true,
  createdAt: true,
  updatedAt: true,
  customDomain: true,
  workspaceId: true,
  resultsTablePreferences: true,
  selectedThemeTemplateId: true,
  publicId: true,
} as const;

const importingTypebotSchema = z.preprocess(
  preprocessTypebot,
  z.discriminatedUnion("version", [
    typebotV6Schema
      .omit(omittedProps)
      .extend({
        resultsTablePreferences: resultsTablePreferencesSchema.nullish(),
        selectedThemeTemplateId: z.string().nullish(),
        workspaceId: z.string().optional(),
        id: z.string().optional(),
      })
      .openapi({
        title: "Typebot V6",
      }),
    typebotV5Schema
      .omit(omittedProps)
      .extend({
        resultsTablePreferences: resultsTablePreferencesSchema.nullish(),
        selectedThemeTemplateId: z.string().nullish(),
        workspaceId: z.string().optional(),
        id: z.string().optional(),
      })
      .openapi({
        title: "Typebot V5",
      }),
  ]),
);

type ImportingTypebot = z.infer<typeof importingTypebotSchema>;

const migrateImportingTypebot = async (
  typebot: ImportingTypebot,
): Promise<TypebotV6> => {
  const fullTypebot = {
    ...typebot,
    id: "dummy id",
    workspaceId: "dummy workspace id",
    resultsTablePreferences: typebot.resultsTablePreferences ?? null,
    selectedThemeTemplateId: typebot.selectedThemeTemplateId ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
    customDomain: null,
    isClosed: false,
    isArchived: false,
    whatsAppCredentialsId: null,
    publicId: null,
    riskLevel: null,
  } satisfies Typebot;
  return (await migrateTypebot(fullTypebot)).typebot;
};

export const importTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/typebots/import",
      protect: true,
      summary: "Import a typebot",
      tags: ["Typebot"],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe(
          "[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)",
        ),
      typebot: importingTypebotSchema,
      fromTemplate: z.string().optional(),
      enableSafetyFlags: z.boolean().optional(),
    }),
  )
  .output(
    z.object({
      typebot: typebotV6Schema,
    }),
  )
  .mutation(
    async ({
      input: { typebot, workspaceId, fromTemplate, enableSafetyFlags },
      ctx: { user },
    }) => {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true, members: true, plan: true },
      });
      const userRole = getUserModeInWorkspace(user.id, workspace?.members);
      if (userRole === "guest" || !workspace)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });

      const newBotId = createId();

      const newUploadUrlsResponse = await replaceTypebotUploadUrlsWithNewIds({
        typebot,
        newTypebotId: newBotId,
        newWorkspaceId: workspaceId,
      });

      const duplicatingBot = await migrateImportingTypebot(
        newUploadUrlsResponse.typebot,
      );

      const groups = (
        duplicatingBot.groups
          ? await sanitizeGroups(duplicatingBot.groups, {
              workspace,
              enableSafetyFlags,
            })
          : []
      ) as TypebotV6["groups"];

      const newTypebot = await prisma.typebot.create({
        data: {
          id: newBotId,
          version: duplicatingBot.version,
          workspaceId,
          name: duplicatingBot.name,
          icon: duplicatingBot.icon,
          selectedThemeTemplateId: duplicatingBot.selectedThemeTemplateId,
          groups,
          events: duplicatingBot.events ?? undefined,
          theme: duplicatingBot.theme ? duplicatingBot.theme : {},
          settings: duplicatingBot.settings
            ? sanitizeSettings(
                duplicatingBot.settings,
                workspace.plan,
                "create",
              )
            : workspace.plan === Plan.FREE
              ? {
                  general: {
                    isBrandingEnabled: true,
                  },
                }
              : {},
          folderId: await sanitizeFolderId({
            folderId: duplicatingBot.folderId,
            workspaceId: workspace.id,
          }),
          variables: duplicatingBot.variables
            ? sanitizeVariables({
                variables: duplicatingBot.variables,
                groups,
              })
            : [],
          edges: duplicatingBot.edges ?? [],
          resultsTablePreferences:
            duplicatingBot.resultsTablePreferences ?? undefined,
        } satisfies Partial<TypebotV6>,
      });

      const parsedNewTypebot = typebotV6Schema.parse(newTypebot);

      await copyObjects(newUploadUrlsResponse.filesToCopy);

      await trackEvents([
        {
          name: "Typebot created",
          workspaceId: parsedNewTypebot.workspaceId,
          typebotId: parsedNewTypebot.id,
          userId: user.id,
          data: {
            template: fromTemplate,
          },
        },
      ]);

      return { typebot: parsedNewTypebot };
    },
  );
