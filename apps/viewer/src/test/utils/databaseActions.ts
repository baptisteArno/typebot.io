import { encrypt } from "@typebot.io/credentials/encrypt";
import type { SmtpCredentials } from "@typebot.io/credentials/schemas";
import { proWorkspaceId } from "@typebot.io/playwright/databaseSetup";
import prisma from "@typebot.io/prisma";

export const createSmtpCredentials = async (
  id: string,
  smtpData: SmtpCredentials["data"],
) => {
  const { encryptedData, iv } = await encrypt(smtpData);
  return prisma.credentials.create({
    data: {
      id,
      data: encryptedData,
      iv,
      name: smtpData.from.email as string,
      type: "smtp",
      workspaceId: proWorkspaceId,
    },
  });
};
