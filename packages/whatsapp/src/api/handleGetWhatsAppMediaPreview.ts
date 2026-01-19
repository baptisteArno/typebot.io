import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { downloadMedia } from "@typebot.io/whatsapp/downloadMedia";
import { isReadWorkspaceFobidden } from "@typebot.io/workspaces/isReadWorkspaceFobidden";
import { z } from "zod";

export const getWhatsAppMediaPreviewInputSchema = z.object({
  typebotId: z.string(),
  mediaId: z.string(),
});

export const handleGetWhatsAppMediaPreview = async ({
  input: { typebotId, mediaId },
  context: { user },
}: {
  input: z.infer<typeof getWhatsAppMediaPreviewInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
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
    body: new Blob([new Uint8Array(file)], { type: mimeType }),
  };
};
