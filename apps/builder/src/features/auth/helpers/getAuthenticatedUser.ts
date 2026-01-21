import * as Sentry from "@sentry/nextjs";
import prisma from "@typebot.io/prisma";
import { type ClientUser, clientUserSchema } from "@typebot.io/user/schemas";
import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth/config";

export const getAuthenticatedUser = async (
  req: NextApiRequest,
  _res: NextApiResponse,
): Promise<ClientUser | undefined> => {
  const bearerToken = extractBearerToken(req);
  if (bearerToken) return authenticateByToken(bearerToken);

  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: new Headers({
      cookie: req.headers.cookie || "",
    }),
  });

  if (!session?.user?.id) return undefined;

  // Fetch full user from database (Better Auth session only has basic fields)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return undefined;

  Sentry.setUser({ id: user.id });
  return clientUserSchema.parse(user);
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
