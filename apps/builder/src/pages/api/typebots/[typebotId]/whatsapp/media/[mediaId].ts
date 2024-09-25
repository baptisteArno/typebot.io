import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";
import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";
import {
  methodNotAllowed,
  notAuthenticated,
  notFound,
} from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import { downloadMedia } from "@typebot.io/whatsapp/downloadMedia";
import type { WhatsAppCredentials } from "@typebot.io/whatsapp/schemas";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const user = await getAuthenticatedUser(req, res);
    if (!user) return notAuthenticated(res);

    const typebotId = req.query.typebotId as string;

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
      return notFound(res, "Workspace not found");

    if (!typebot) return notFound(res, "Typebot not found");

    const mediaId = req.query.mediaId as string;
    const credentialsId = typebot.whatsAppCredentialsId;

    const credentials = typebot.workspace.credentials.find(
      (credential) => credential.id === credentialsId,
    );

    if (!credentials) return notFound(res, "Credentials not found");

    const credentialsData = (await decrypt(
      credentials.data,
      credentials.iv,
    )) as WhatsAppCredentials["data"];

    const { file, mimeType } = await downloadMedia({
      mediaId,
      systemUserAccessToken: credentialsData.systemUserAccessToken,
    });

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    return res.send(file);
  }
  return methodNotAllowed(res);
};

export default handler;
