import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { downloadMedia } from "@typebot.io/whatsapp/downloadMedia";
import { z } from "@typebot.io/zod";
import { isReadWorkspaceFobidden } from "../workspace/helpers/isReadWorkspaceFobidden";

export const getWhatsAppMediaPreview = authenticatedProcedure
  .route({
    method: "GET",
    path: "/typebots/{typebotId}/whatsapp/media/preview/{mediaId}",
    outputStructure: "detailed",
  })
  .input(
    z.object({
      typebotId: z.string(),
      mediaId: z.string(),
    }),
  )
  .handler(async ({ input: { typebotId, mediaId }, context: { user } }) => {
    if (!env.META_SYSTEM_USER_TOKEN)
      throw new ORPCError("BAD_REQUEST", {
        message: "Meta system user token is not set",
      });

    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      select: {
        whatsAppCredentialsId: true,
        workspace: {
          select: {
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

    const { file, mimeType } = await downloadMedia({
      mediaId: mediaIdWithoutExtension,
      credentials: {
        provider: "meta",
        systemUserAccessToken: env.META_SYSTEM_USER_TOKEN,
        phoneNumberId: env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID ?? "",
      },
    });

    return {
      headers: {
        "content-type": mimeType,
        "cache-control": "public, max-age=86400",
      },
      body: file,
    };
  });
