import type { inferAsyncReturnType } from "@trpc/server";
import type * as trpcNext from "@trpc/server/adapters/next";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import { mockedUser } from "@typebot.io/user/mockedUser";
import type { NextApiRequest } from "next";

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const user = await getAuthenticatedUser(opts.req);

  return {
    user,
    origin: opts.req.headers.origin,
    iframeReferrerOrigin: opts.req.headers[
      "x-typebot-iframe-referrer-origin"
    ] as string | undefined,
  };
}

const getAuthenticatedUser = async (
  req: NextApiRequest,
): Promise<Prisma.User | undefined> => {
  if (env.NEXT_PUBLIC_E2E_TEST) return mockedUser;
  const bearerToken = extractBearerToken(req);
  if (!bearerToken) return;
  return authenticateByToken(bearerToken);
};

const authenticateByToken = async (
  token: string,
): Promise<Prisma.User | undefined> => {
  if (typeof window !== "undefined") return;
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

const extractBearerToken = (req: NextApiRequest) =>
  req.headers["authorization"]?.slice(7);

export type Context = inferAsyncReturnType<typeof createContext>;
