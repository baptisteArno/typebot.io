import prisma from "@typebot.io/prisma";

export const getCredentials = async (
  credentialsId: string,
  workspaceId: string,
) => {
  const credentials = await prisma.credentials.findUnique({
    where: { id: credentialsId },
    select: {
      iv: true,
      data: true,
      workspaceId: true,
    },
  });
  if (credentials?.workspaceId !== workspaceId) {
    return null;
  }
  return credentials;
};
