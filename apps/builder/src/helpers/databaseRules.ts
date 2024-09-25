import { env } from "@typebot.io/env";
import { forbidden } from "@typebot.io/lib/api/utils";
import prisma, {} from "@typebot.io/prisma";
import {
  CollaborationType,
  Plan,
  WorkspaceRole,
} from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import type { NextApiResponse } from "next";

export const canWriteTypebots = (
  typebotIds: string[] | string,
  user: Pick<Prisma.User, "email" | "id">,
): Prisma.Prisma.TypebotWhereInput =>
  env.NEXT_PUBLIC_E2E_TEST
    ? { id: typeof typebotIds === "string" ? typebotIds : { in: typebotIds } }
    : {
        id: typeof typebotIds === "string" ? typebotIds : { in: typebotIds },
        OR: [
          {
            workspace: {
              members: {
                some: { userId: user.id, role: { not: WorkspaceRole.GUEST } },
              },
            },
          },
          {
            collaborators: {
              some: { userId: user.id, type: { not: CollaborationType.READ } },
            },
          },
        ],
      };

export const canReadTypebots = (
  typebotIds: string | string[],
  user: Pick<Prisma.User, "email" | "id">,
) => ({
  id: typeof typebotIds === "string" ? typebotIds : { in: typebotIds },
  workspace:
    env.ADMIN_EMAIL?.some((email) => email === user.email) ||
    env.NEXT_PUBLIC_E2E_TEST
      ? undefined
      : {
          members: {
            some: { userId: user.id },
          },
        },
});

export const canEditGuests = (user: Prisma.User, typebotId: string) => ({
  id: typebotId,
  workspace: {
    members: {
      some: { userId: user.id, role: { not: WorkspaceRole.GUEST } },
    },
  },
});

export const canPublishFileInput = async ({
  userId,
  workspaceId,
  res,
}: {
  userId: string;
  workspaceId: string;
  res: NextApiResponse;
}) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, members: { some: { userId } } },
    select: { plan: true },
  });
  if (!workspace) {
    forbidden(res, "workspace not found");
    return false;
  }
  if (workspace?.plan === Plan.FREE) {
    forbidden(res, "You need to upgrade your plan to use file input blocks");
    return false;
  }
  return true;
};

export const isUniqueConstraintError = (error: unknown) =>
  typeof error === "object" &&
  error &&
  "code" in error &&
  error.code === "P2002";
