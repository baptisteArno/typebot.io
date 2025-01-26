import prisma from "@typebot.io/prisma";

export const getCredentials = async (
  credentialsId: string,
  // TODO: Remove workspaceId optionality once v3.4 is out
  workspaceId?: string,
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
