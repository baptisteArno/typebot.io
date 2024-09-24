import { getUserRoleInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { Plan, WorkspaceRole } from "@typebot.io/prisma/enum";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import { migrateTypebot } from "@typebot.io/typebot/migrations/migrateTypebot";
import { preprocessTypebot } from "@typebot.io/typebot/preprocessTypebot";
import {
  type Typebot,
  type TypebotV6,
  resultsTablePreferencesSchema,
  typebotV5Schema,
  typebotV6Schema,
} from "@typebot.io/typebot/schemas/typebot";
import { z } from "@typebot.io/zod";
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
      })
      .openapi({
        title: "Typebot V6",
      }),
    typebotV5Schema
      .omit(omittedProps)
      .extend({
        resultsTablePreferences: resultsTablePreferencesSchema.nullish(),
        selectedThemeTemplateId: z.string().nullish(),
      })
      .openapi({
        title: "Typebot V5",
      }),
  ]),
);

type ImportingTypebot = z.infer<typeof importingTypebotSchema>;

const migrateImportingTypebot = (
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
  return migrateTypebot(fullTypebot);
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
    }),
  )
  .output(
    z.object({
      typebot: typebotV6Schema,
    }),
  )
  .mutation(async ({ input: { typebot, workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, members: true, plan: true },
    });
    const userRole = getUserRoleInWorkspace(user.id, workspace?.members);
    if (
      userRole === undefined ||
      userRole === WorkspaceRole.GUEST ||
      !workspace
    )
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });

    const migratedTypebot = await migrateImportingTypebot(typebot);

    const groups = (
      migratedTypebot.groups
        ? await sanitizeGroups(workspaceId)(migratedTypebot.groups)
        : []
    ) as TypebotV6["groups"];

    const newTypebot = await prisma.typebot.create({
      data: {
        version: "6",
        workspaceId,
        name: migratedTypebot.name,
        icon: migratedTypebot.icon,
        selectedThemeTemplateId: migratedTypebot.selectedThemeTemplateId,
        groups,
        events: migratedTypebot.events ?? undefined,
        theme: migratedTypebot.theme ? migratedTypebot.theme : {},
        settings: migratedTypebot.settings
          ? sanitizeSettings(migratedTypebot.settings, workspace.plan, "create")
          : workspace.plan === Plan.FREE
            ? {
                general: {
                  isBrandingEnabled: true,
                },
              }
            : {},
        folderId: await sanitizeFolderId({
          folderId: migratedTypebot.folderId,
          workspaceId: workspace.id,
        }),
        variables: migratedTypebot.variables
          ? sanitizeVariables({ variables: migratedTypebot.variables, groups })
          : [],
        edges: migratedTypebot.edges ?? [],
        resultsTablePreferences:
          migratedTypebot.resultsTablePreferences ?? undefined,
      } satisfies Partial<TypebotV6>,
    });

    const parsedNewTypebot = typebotV6Schema.parse(newTypebot);

    await trackEvents([
      {
        name: "Typebot created",
        workspaceId: parsedNewTypebot.workspaceId,
        typebotId: parsedNewTypebot.id,
        userId: user.id,
        data: {
          name: newTypebot.name,
        },
      },
    ]);

    return { typebot: parsedNewTypebot };
  });
