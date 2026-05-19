import { hashApiToken, isHashedApiToken } from "@typebot.io/lib/apiToken";
import prisma from "@typebot.io/prisma";
import { type ClientUser, clientUserSchema } from "@typebot.io/user/schemas";

export const authenticateWithBearerToken = async (
  req: Request,
): Promise<ClientUser | null> => {
  const apiToken = extractBearerToken(req);
  if (!apiToken) return null;
  const hashedApiToken = hashApiToken(apiToken);
  const hashedApiTokenRecord = await prisma.apiToken.findFirst({
    where: { token: hashedApiToken },
    include: { owner: true },
  });
  if (hashedApiTokenRecord)
    return clientUserSchema.parse(hashedApiTokenRecord.owner);
  const apiTokenRecord = await prisma.apiToken.findFirst({
    where: { token: apiToken },
    include: { owner: true },
  });
  if (!apiTokenRecord) return null;
  if (isHashedApiToken(apiTokenRecord.token)) return null;
  await prisma.apiToken.update({
    where: { id: apiTokenRecord.id },
    data: { token: hashedApiToken },
  });
  return clientUserSchema.parse(apiTokenRecord.owner);
};

const extractBearerToken = (req: Request) =>
  req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
