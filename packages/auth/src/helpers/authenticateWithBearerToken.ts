import prisma from "@typebot.io/prisma";
import { type ClientUser, clientUserSchema } from "@typebot.io/user/schemas";

export const authenticateWithBearerToken = async (
  req: Request,
): Promise<ClientUser | null> => {
  const apiToken = extractBearerToken(req);
  if (!apiToken) return null;
  const user = await prisma.user.findFirst({
    where: { apiTokens: { some: { token: apiToken } } },
  });
  if (!user) return null;
  return clientUserSchema.parse(user);
};

const extractBearerToken = (req: Request) =>
  req.headers.get("authorization")?.slice(7);
