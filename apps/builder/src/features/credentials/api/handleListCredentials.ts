import { ORPCError } from "@orpc/server";
import { credentialsTypeSchema } from "@typebot.io/credentials/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";

const deletedCredentialsTypes = ["zemanticAi", "zemantic-ai"];

export const outputCredentialsSchema = z.array(
  z.object({
    id: z.string(),
    type: credentialsTypeSchema,
    name: z.string(),
  }),
);

export const listCredentialsInputSchema = z.discriminatedUnion("scope", [
  z.object({
    scope: z.literal("workspace"),
    workspaceId: z.string(),
    type: credentialsTypeSchema.optional(),
  }),
  z.object({
    scope: z.literal("user"),
    type: credentialsTypeSchema.optional(),
  }),
]);

export const handleListCredentials = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof listCredentialsInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
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
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  return {
    credentials: outputCredentialsSchema.parse(
      isDefined(input.type)
        ? workspace.credentials
        : workspace.credentials
            .filter((c) => !deletedCredentialsTypes.includes(c.type))
            .sort((a, b) => a.type.localeCompare(b.type)),
    ),
  };
};
