import prisma from "@typebot.io/prisma";

export const getCredentials = async (
  credentialsId: string,
  workspaceId: string | undefined,
) => {
  const credentials = await prisma.credentials.findUnique({
    where: { id: credentialsId },
    select: {
      iv: true,
      data: true,
      workspaceId: true,
    },
  });
  if (workspaceId && credentials?.workspaceId !== workspaceId) {
    return null;
  }
  return credentials;
};
