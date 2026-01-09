import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { getFileTempUrl } from "@typebot.io/lib/s3/getFileTempUrl";
import prisma from "@typebot.io/prisma";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { z } from "@typebot.io/zod";

export const getResultBlockFile = authenticatedProcedure
  .route({
    method: "GET",
    path: "/typebots/{typebotId}/results/{resultId}/blocks/{blockId}/{fileName}",
    successStatus: 302,
    outputStructure: "detailed",
  })
  .input(
    z.object({
      typebotId: z.string(),
      resultId: z.string(),
      blockId: z.string(),
      fileName: z.string(),
    }),
  )
  .output(
    z.object({
      headers: z.object({
        location: z.string(),
      }),
    }),
  )
  .handler(
    async ({
      input: { typebotId, resultId, blockId, fileName },
      context: { user },
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

      if (!tmpUrl)
        throw new ORPCError("NOT_FOUND", { message: "File not found" });

      return {
        headers: {
          location: tmpUrl,
        },
      };
    },
  );
