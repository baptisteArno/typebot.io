import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";

export function createContext(req: Request) {
  return {
    bearerToken: extractBearerToken(req),
    origin: req.headers.get("origin") ?? undefined,
    iframeReferrerOrigin:
      req.headers.get("x-typebot-iframe-referrer-origin") ?? undefined,
  };
}

export const authenticateByToken = async (
  token: string | undefined,
): Promise<Prisma.User | undefined> => {
  if (typeof window !== "undefined" || !token) return;
  const apiToken = await prisma.apiToken.findFirst({
    where: {
      token,
    },
    select: {
      owner: true,
    },
  });
  return apiToken?.owner;
};

export const extractBearerToken = (req: Request) =>
  req.headers.get("authorization")?.slice(7);

export type Context = ReturnType<typeof createContext>;
