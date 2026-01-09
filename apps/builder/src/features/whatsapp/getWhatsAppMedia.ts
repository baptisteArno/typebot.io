import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { decrypt } from "@typebot.io/credentials/decrypt";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import prisma from "@typebot.io/prisma";
import { downloadMedia } from "@typebot.io/whatsapp/downloadMedia";
import { z } from "@typebot.io/zod";
import { isReadWorkspaceFobidden } from "../workspace/helpers/isReadWorkspaceFobidden";

export const getWhatsAppMedia = authenticatedProcedure
  .route({
    method: "GET",
    path: "/typebots/{typebotId}/whatsapp/media/{mediaId}",
    outputStructure: "detailed",
  })
  .input(
    z.object({
      typebotId: z.string(),
      mediaId: z.string(),
    }),
  )
  .handler(async ({ input: { typebotId, mediaId }, context: { user } }) => {
    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      select: {
        whatsAppCredentialsId: true,
        workspace: {
          select: {
            credentials: {
              where: {
                type: "whatsApp",
              },
            },
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!typebot?.workspace || isReadWorkspaceFobidden(typebot.workspace, user))
      throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

    const mediaIdWithoutExtension = mediaId.split(".")[0];
    const credentialsId = typebot.whatsAppCredentialsId;

    const credentials = typebot.workspace.credentials.find(
      (credential) => credential.id === credentialsId,
    );

    if (!credentials)
      throw new ORPCError("NOT_FOUND", { message: "Credentials not found" });

    const credentialsData = (await decrypt(
      credentials.data,
      credentials.iv,
    )) as WhatsAppCredentials["data"];

    const { file, mimeType } = await downloadMedia({
      mediaId: mediaIdWithoutExtension,
      credentials: credentialsData,
    });

    return {
      headers: {
        "content-type": mimeType,
        "cache-control": "public, max-age=86400",
      },
      body: file,
    };
  });
