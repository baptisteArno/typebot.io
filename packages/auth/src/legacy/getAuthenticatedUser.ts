import * as Sentry from "@sentry/nextjs";
import prisma from "@typebot.io/prisma";
import { type ClientUser, clientUserSchema } from "@typebot.io/user/schemas";
import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "../lib/nextAuth";

// TODO: delete when builder pages/api is migrated to oRPC
export const getAuthenticatedUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const bearerToken = extractBearerToken(req);
  if (bearerToken) return authenticateByToken(bearerToken);
  return (await auth(req, res))?.user;
};

const authenticateByToken = async (
  apiToken: string,
): Promise<ClientUser | undefined> => {
  if (typeof window !== "undefined") return;
  const user = await prisma.user.findFirst({
    where: { apiTokens: { some: { token: apiToken } } },
  });
  if (!user) return;
  Sentry.setUser({ id: user.id });
  return clientUserSchema.parse(user);
};

const extractBearerToken = (req: NextApiRequest) =>
  req.headers["authorization"]?.slice(7);
