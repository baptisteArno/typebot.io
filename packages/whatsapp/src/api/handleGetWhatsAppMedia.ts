import { ORPCError } from "@orpc/server";
import { decrypt } from "@typebot.io/credentials/decrypt";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { downloadMedia } from "@typebot.io/whatsapp/downloadMedia";
import { isReadWorkspaceFobidden } from "@typebot.io/workspaces/isReadWorkspaceFobidden";
import { z } from "zod";

export const getWhatsAppMediaInputSchema = z.object({
  typebotId: z.string(),
  mediaId: z.string(),
});

export const handleGetWhatsAppMedia = async ({
  input: { typebotId, mediaId },
  context: { user },
}: {
  input: z.infer<typeof getWhatsAppMediaInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
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
    body: new Blob([new Uint8Array(file)], { type: mimeType }),
  };
};
