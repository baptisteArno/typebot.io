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
  return (await prisma.user.findFirst({
    where: { apiTokens: { some: { token: apiToken } } },
  })) as Prisma.User;
};

const extractBearerToken = (req: NextApiRequest) =>
  req.headers["authorization"]?.slice(7);
