import { getUserRoleInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { omit } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import {
  type Typebot,
  typebotV5Schema,
} from "@typebot.io/typebot/schemas/typebot";
import { z } from "@typebot.io/zod";

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
          .merge(z.object({ publishedTypebotId: z.string().optional() })),
      ),
    }),
  )
  .query(async ({ input: { workspaceId, folderId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { members: true },
    });
    const userRole = getUserRoleInWorkspace(user.id, workspace?.members);
    if (userRole === undefined)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });
    const typebots = (await prisma.typebot.findMany({
      where: {
        isArchived: { not: true },
        folderId:
          userRole === WorkspaceRole.GUEST
            ? undefined
            : folderId === "root"
              ? null
              : folderId,
        workspaceId,
        collaborators:
          userRole === WorkspaceRole.GUEST
            ? { some: { userId: user.id } }
            : undefined,
      },
      orderBy: { createdAt: "desc" },
      select: {
        name: true,
        publishedTypebot: { select: { id: true } },
        id: true,
        icon: true,
      },
    })) as (Pick<Typebot, "name" | "id" | "icon"> & {
      publishedTypebot: Pick<PublicTypebot, "id">;
    })[];

    if (!typebots)
      throw new TRPCError({ code: "NOT_FOUND", message: "No typebots found" });

    return {
      typebots: typebots.map((typebot) => ({
        publishedTypebotId: typebot.publishedTypebot?.id,
        ...omit(typebot, "publishedTypebot"),
      })),
    };
  });
