import { createAuthConfig } from "@/features/auth/helpers/createAuthConfig";
import { env } from "@typebot.io/env";
import { getIp } from "@typebot.io/lib/getIp";
import { mockedUser } from "@typebot.io/lib/mockedUser";
import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const isMockingSession =
    req.method === "GET" &&
    req.url === "/api/auth/session" &&
    env.NEXT_PUBLIC_E2E_TEST;
  if (isMockingSession) return res.send({ user: mockedUser });

  const requestIsFromCompanyFirewall = req.method === "HEAD";
  if (requestIsFromCompanyFirewall) return res.status(200).end();

  return NextAuth(req, res, createAuthConfig({ ip: getIp(req) }));
}
