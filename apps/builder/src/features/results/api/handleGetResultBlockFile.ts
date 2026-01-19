import { ORPCError } from "@orpc/server";
import { getFileTempUrl } from "@typebot.io/lib/s3/getFileTempUrl";
import prisma from "@typebot.io/prisma";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const getResultBlockFileInputSchema = z.object({
  typebotId: z.string(),
  resultId: z.string(),
  blockId: z.string(),
  fileName: z.string(),
});

export const handleGetResultBlockFile = async ({
  input: { typebotId, resultId, blockId, fileName },
  context: { user },
}: {
  input: z.infer<typeof getResultBlockFileInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const typebot = await prisma.typebot.findFirst({
    where: {
      id: typebotId,
    },
    select: {
      whatsAppCredentialsId: true,
      collaborators: {
        select: {
          userId: true,
        },
      },
      workspace: {
        select: {
          id: true,
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

  if (!typebot?.workspace || (await isReadTypebotForbidden(typebot, user)))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  const tmpUrl = await getFileTempUrl({
    key: `private/workspaces/${typebot.workspace.id}/typebots/${typebotId}/results/${resultId}/blocks/${blockId}/${fileName}`,
  });

  if (!tmpUrl) throw new ORPCError("NOT_FOUND", { message: "File not found" });

  return {
    headers: {
      location: tmpUrl,
    },
  };
};
