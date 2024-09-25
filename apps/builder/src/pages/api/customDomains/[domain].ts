import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { env } from "@typebot.io/env";
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
} from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import ky from "ky";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);
  const workspaceId = req.query.workspaceId as string | undefined;
  if (!workspaceId) return badRequest(res);
  if (req.method === "DELETE") {
    const domain = req.query.domain as string;
    try {
      await deleteDomainOnVercel(domain);
    } catch {
      /* empty */
    }
    const customDomains = await prisma.customDomain.delete({
      where: { name: domain },
    });

    return res.send({ customDomains });
  }
  return methodNotAllowed(res);
};

const deleteDomainOnVercel = (name: string) =>
  ky.delete(
    `https://api.vercel.com/v8/projects/${env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME}/domains/${name}?teamId=${env.VERCEL_TEAM_ID}`,
    {
      headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
    },
  );

export default handler;
