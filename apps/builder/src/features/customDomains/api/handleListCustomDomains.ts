import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";

export const listCustomDomainsInputSchema = z.object({
  workspaceId: z.string(),
});

export const handleListCustomDomains = async ({
  input: { workspaceId },
  context: { user },
}: {
  input: z.infer<typeof listCustomDomainsInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId },
    select: {
      members: {
        select: {
          userId: true,
        },
      },
      customDomains: true,
    },
  });

  if (!workspace || isReadWorkspaceFobidden(workspace, user))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  const descSortedCustomDomains = workspace.customDomains.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  return { customDomains: descSortedCustomDomains };
};
