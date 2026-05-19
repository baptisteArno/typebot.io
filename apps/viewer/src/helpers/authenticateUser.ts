import { hashApiToken, isHashedApiToken } from "@typebot.io/lib/apiToken";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import type { NextApiRequest } from "next";

export const authenticateUser = async (
  req: NextApiRequest,
): Promise<Prisma.User | undefined> =>
  authenticateByToken(extractBearerToken(req));

const authenticateByToken = async (
  apiToken?: string,
): Promise<Prisma.User | undefined> => {
  if (!apiToken) return;
  const hashedApiToken = hashApiToken(apiToken);
  const hashedApiTokenRecord = await prisma.apiToken.findFirst({
    where: { token: hashedApiToken },
    include: { owner: true },
  });
  if (hashedApiTokenRecord) return hashedApiTokenRecord.owner as Prisma.User;
  const apiTokenRecord = await prisma.apiToken.findFirst({
    where: { token: apiToken },
    include: { owner: true },
  });
  if (!apiTokenRecord) return;
  if (isHashedApiToken(apiTokenRecord.token)) return;
  await prisma.apiToken.update({
    where: { id: apiTokenRecord.id },
    data: { token: hashedApiToken },
  });
  return apiTokenRecord.owner as Prisma.User;
};

const extractBearerToken = (req: NextApiRequest) =>
  req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
