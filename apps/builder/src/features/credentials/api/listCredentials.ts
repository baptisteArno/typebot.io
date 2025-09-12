import { TRPCError } from "@trpc/server";
import { credentialsTypeSchema } from "@typebot.io/credentials/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";

const deletedCredentialsTypes = ["zemanticAi", "zemantic-ai"];

const outputCredentialsSchema = z.array(
  z.object({
    id: z.string(),
    type: credentialsTypeSchema,
    name: z.string(),
  }),
);

export const listCredentials = authenticatedProcedure
  .input(
    z.discriminatedUnion("scope", [
      z.object({
        scope: z.literal("workspace"),
        workspaceId: z.string(),
        type: credentialsTypeSchema.optional(),
      }),
      z.object({
        scope: z.literal("user"),
        type: credentialsTypeSchema.optional(),
      }),
    ]),
  )
  .output(
    z.object({
      credentials: outputCredentialsSchema,
    }),
  )
  .query(async ({ input, ctx: { user } }) => {
    if (input.scope === "user") {
      const credentials = await prisma.userCredentials.findMany({
        where: {
          userId: user.id,
          type: input.type,
        },
        select: {
          id: true,
          type: true,
          name: true,
        },
      });
      return {
        credentials: outputCredentialsSchema.parse(
          isDefined(input.type)
            ? credentials
            : credentials.sort((a, b) => a.type.localeCompare(b.type)),
        ),
      };
    }
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: input.workspaceId,
      },
      select: {
        id: true,
        members: true,
        credentials: {
          where: {
            type: input.type,
          },
          select: {
            id: true,
            type: true,
            name: true,
          },
        },
      },
    });
    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });

    return {
      credentials: outputCredentialsSchema.parse(
        isDefined(input.type)
          ? workspace.credentials
          : workspace.credentials
              .filter((c) => !deletedCredentialsTypes.includes(c.type))
              .sort((a, b) => a.type.localeCompare(b.type)),
      ),
    };
  });
