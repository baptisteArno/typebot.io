import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { methodNotAllowed, notAuthenticated } from "@typebot.io/lib/api/utils";
import { generateId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);
  if (req.method === "GET") {
    const apiTokens = await prisma.apiToken.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.send({ apiTokens });
  }
  if (req.method === "POST") {
    const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const apiToken = await prisma.apiToken.create({
      data: { name: data.name, ownerId: user.id, token: generateId(24) },
    });
    return res.send({
      apiToken: {
        id: apiToken.id,
        name: apiToken.name,
        createdAt: apiToken.createdAt,
        token: apiToken.token,
      },
    });
  }
  methodNotAllowed(res);
};

export default handler;
