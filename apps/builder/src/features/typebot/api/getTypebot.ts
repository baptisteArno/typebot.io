import { publicProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import type { CollaborationType } from "@typebot.io/prisma/enum";
import { migrateTypebot } from "@typebot.io/typebot/migrations/migrateTypebot";
import { typebotSchema } from "@typebot.io/typebot/schemas/typebot";
import { z } from "@typebot.io/zod";
import { isReadTypebotForbidden } from "../helpers/isReadTypebotForbidden";

export const getTypebot = publicProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/typebots/{typebotId}",
      protect: true,
      summary: "Get a typebot",
      tags: ["Typebot"],
    },
  })
  .input(
    z.object({
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
    }),
  )
  .output(
    z.object({
      typebot: typebotSchema,
      currentUserMode: z.enum(["guest", "read", "write"]),
    }),
  )
  .query(
    async ({ input: { typebotId, migrateToLatestVersion }, ctx: { user } }) => {
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Typebot not found",
        });

      try {
        const parsedTypebot = migrateToLatestVersion
          ? await migrateTypebot(typebotSchema.parse(existingTypebot))
          : typebotSchema.parse(existingTypebot);

        return {
          typebot: parsedTypebot,
          currentUserMode: getCurrentUserMode(user, existingTypebot),
        };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to parse typebot",
          cause: err,
        });
      }
    },
  );

const getCurrentUserMode = (
  user: { email: string | null; id: string } | undefined,
  typebot: { collaborators: { userId: string; type: CollaborationType }[] } & {
    workspace: { members: { userId: string }[] };
  },
) => {
  const collaborator = typebot.collaborators.find((c) => c.userId === user?.id);
  const isMemberOfWorkspace = typebot.workspace.members.some(
    (m) => m.userId === user?.id,
  );
  if (
    collaborator?.type === "WRITE" ||
    collaborator?.type === "FULL_ACCESS" ||
    isMemberOfWorkspace
  )
    return "write";

  if (collaborator) return "read";
  if (user?.email && env.ADMIN_EMAIL?.includes(user.email)) return "read";
  return "guest";
};
