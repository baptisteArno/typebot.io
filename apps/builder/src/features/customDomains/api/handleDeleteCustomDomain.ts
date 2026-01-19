import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import { ky } from "@typebot.io/lib/ky";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { HTTPError } from "ky";
import { z } from "zod";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

export const deleteCustomDomainInputSchema = z.object({
  workspaceId: z.string(),
  name: z.string(),
});

export const handleDeleteCustomDomain = async ({
  input: { workspaceId, name },
  context: { user },
}: {
  input: z.infer<typeof deleteCustomDomainInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const workspace = await prisma.workspace.findFirst({
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

  if (!workspace || isWriteWorkspaceForbidden(workspace, user))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  try {
    await deleteDomainOnVercel(name);
  } catch (error) {
    console.error(error);
    if (error instanceof HTTPError)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete domain on Vercel",
        cause: await error.response.text(),
      });
    else
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete domain on Vercel",
      });
  }
  await prisma.customDomain.deleteMany({
    where: {
      name,
      workspaceId,
    },
  });

  return { message: "success" as const };
};

const deleteDomainOnVercel = (name: string) =>
  ky.delete(
    `https://api.vercel.com/v9/projects/${env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME}/domains/${name}?teamId=${env.VERCEL_TEAM_ID}`,
    {
      headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
    },
  );
