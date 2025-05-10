import * as Sentry from "@sentry/nextjs";
import { env } from "@typebot.io/env";
import { mockedUser } from "@typebot.io/lib/mockedUser";
import prisma from "@typebot.io/prisma";
import {
  type ClientUser,
  clientUserSchema,
} from "@typebot.io/schemas/features/user/schema";
import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "../lib/nextAuth";

export const getAuthenticatedUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<ClientUser | undefined> => {
  const bearerToken = extractBearerToken(req);
  if (bearerToken) return authenticateByToken(bearerToken);
  return env.NEXT_PUBLIC_E2E_TEST ? mockedUser : (await auth(req, res))?.user;
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
