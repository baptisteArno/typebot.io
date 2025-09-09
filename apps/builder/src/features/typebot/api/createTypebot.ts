import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { EventType } from "@typebot.io/events/constants";
import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import { latestTypebotVersion } from "@typebot.io/schemas/versions";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import {
  type TypebotV6,
  typebotV6Schema,
} from "@typebot.io/typebot/schemas/typebot";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import {
  isCustomDomainNotAvailable,
  isPublicIdNotAvailable,
  sanitizeGroups,
  sanitizeSettings,
  sanitizeVariables,
} from "../helpers/sanitizers";

const typebotCreateSchemaPick = {
  name: true,
  icon: true,
  selectedThemeTemplateId: true,
  groups: true,
  events: true,
  theme: true,
  settings: true,
  folderId: true,
  variables: true,
  edges: true,
  resultsTablePreferences: true,
  publicId: true,
  customDomain: true,
} as const;

export const createTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/typebots",
      protect: true,
      summary: "Create a typebot",
      tags: ["Typebot"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      typebot: typebotV6Schema.pick(typebotCreateSchemaPick).partial(),
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
    const userRole = getUserModeInWorkspace(user.id, workspace?.members);
    if (userRole === "guest" || !workspace)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });

    if (
      typebot.customDomain &&
      (await isCustomDomainNotAvailable({
        customDomain: typebot.customDomain,
        workspaceId,
      }))
    )
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Custom domain not available",
      });

    if (typebot.publicId && (await isPublicIdNotAvailable(typebot.publicId)))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Public id not available",
      });

    if (typebot.folderId) {
      const existingFolder = await prisma.dashboardFolder.findUnique({
        where: {
          id: typebot.folderId,
        },
      });
      if (!existingFolder) typebot.folderId = null;
    }

    const groups = (
      typebot.groups ? await sanitizeGroups(workspace)(typebot.groups) : []
    ) as TypebotV6["groups"];
    const newTypebot = await prisma.typebot.create({
      data: {
        version: latestTypebotVersion,
        workspaceId,
        name: typebot.name ?? "My typebot",
        icon: typebot.icon,
        selectedThemeTemplateId: typebot.selectedThemeTemplateId,
        groups,
        events: typebot.events ?? [
          {
            type: EventType.START,
            graphCoordinates: { x: 0, y: 0 },
            id: createId(),
          },
        ],
        theme: typebot.theme ? typebot.theme : {},
        settings: typebot.settings
          ? sanitizeSettings(typebot.settings, workspace.plan, "create")
          : workspace.plan === Plan.FREE
            ? {
                general: { isBrandingEnabled: true },
              }
            : {},
        folderId: typebot.folderId,
        variables: typebot.variables
          ? sanitizeVariables({ variables: typebot.variables, groups })
          : [],
        edges: typebot.edges ?? [],
        resultsTablePreferences: typebot.resultsTablePreferences ?? undefined,
        publicId: typebot.publicId ?? undefined,
        customDomain: typebot.customDomain ?? undefined,
      } satisfies Partial<TypebotV6>,
    });

    const parsedNewTypebot = typebotV6Schema.parse(newTypebot);

    await trackEvents([
      {
        name: "Typebot created",
        workspaceId: parsedNewTypebot.workspaceId,
        typebotId: parsedNewTypebot.id,
        userId: user.id,
      },
    ]);

    return { typebot: parsedNewTypebot };
  });
