import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { methodNotAllowed, notAuthenticated } from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);

  if (req.method === "DELETE") {
    const id = req.query.tokenId as string;
    const apiToken = await prisma.apiToken.delete({
      where: { id },
    });
    return res.send({ apiToken });
  }
  methodNotAllowed(res);
};

export default handler;
