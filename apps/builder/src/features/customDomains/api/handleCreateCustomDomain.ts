import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import { ky } from "@typebot.io/lib/ky";
import prisma from "@typebot.io/prisma";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import type { User } from "@typebot.io/user/schemas";
import { HTTPError } from "ky";
import { z } from "zod";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

export const createCustomDomainInputSchema = z.object({
  workspaceId: z.string(),
  name: z.string(),
});

export const handleCreateCustomDomain = async ({
  input: { workspaceId, name },
  context: { user },
}: {
  input: z.infer<typeof createCustomDomainInputSchema>;
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

  const existingCustomDomain = await prisma.customDomain.findFirst({
    where: { name },
  });

  if (existingCustomDomain)
    throw new ORPCError("CONFLICT", {
      message: "Custom domain already registered",
    });

  try {
    await createDomainOnVercel(name);
  } catch (err) {
    if (err instanceof HTTPError && err.response.status !== 409) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create custom domain on Vercel",
        cause: await err.response.text(),
      });
    }
  }

  const customDomain = await prisma.customDomain.create({
    data: {
      name,
      workspaceId,
    },
  });

  await trackEvents([
    {
      name: "Custom domain added",
      userId: user.id,
      workspaceId,
    },
  ]);

  return { customDomain };
};

const createDomainOnVercel = (name: string) =>
  ky.post(
    `https://api.vercel.com/v10/projects/${env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME}/domains?teamId=${env.VERCEL_TEAM_ID}`,
    {
      headers: {
        authorization: `Bearer ${env.VERCEL_TOKEN}`,
      },
      json: { name },
    },
  );
