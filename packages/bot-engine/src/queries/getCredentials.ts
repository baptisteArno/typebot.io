import prisma from "@typebot.io/prisma";

export const getCredentials = async (credentialsId: string) =>
  prisma.credentials.findUnique({
    where: { id: credentialsId },
  });
