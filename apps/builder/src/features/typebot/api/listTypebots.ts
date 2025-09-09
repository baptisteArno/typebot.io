import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { getTypebotAccessRight } from "@typebot.io/typebot/helpers/getTypebotAccessRight";
import { typebotV5Schema } from "@typebot.io/typebot/schemas/typebot";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const listTypebots = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/typebots",
      protect: true,
      summary: "List typebots",
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
      folderId: z.string().optional(),
    }),
  )
  .output(
    z.object({
      typebots: z.array(
        typebotV5Schema
          .pick({
            name: true,
            icon: true,
            id: true,
          })
          .merge(
            z.object({
              publishedTypebotId: z.string().optional(),
              accessRight: z.enum(["read", "write", "guest"]),
            }),
          ),
      ),
    }),
  )
  .query(async ({ input: { workspaceId, folderId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
      },
    });
    const userRole = getUserModeInWorkspace(user.id, workspace?.members);
    if (!workspace || userRole === undefined)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });
    const typebots = await prisma.typebot.findMany({
      where: {
        isArchived: { not: true },
        folderId:
          userRole === "guest"
            ? undefined
            : folderId === "root"
              ? null
              : folderId,
        workspaceId,
        collaborators:
          userRole === "guest" ? { some: { userId: user.id } } : undefined,
      },
      orderBy: { createdAt: "desc" },
      select: {
        name: true,
        publishedTypebot: { select: { id: true } },
        id: true,
        icon: true,
        collaborators: { select: { userId: true, type: true } },
      },
    });

    if (!typebots)
      throw new TRPCError({ code: "NOT_FOUND", message: "No typebots found" });

    return {
      typebots: typebots.map((typebot) => ({
        id: typebot.id,
        name: typebot.name,
        icon: typebot.icon,
        publishedTypebotId: typebot.publishedTypebot?.id,
        accessRight: getTypebotAccessRight(user, {
          ...typebot,
          workspace: { members: workspace.members },
        }),
      })),
    };
  });
