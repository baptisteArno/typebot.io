import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { methodNotAllowed, notAuthenticated } from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);
  if (req.method === "GET") {
    const publicId = req.query.publicId as string | undefined;
    const exists = await prisma.typebot.count({
      where: { publicId: publicId ?? "" },
    });
    return res.send({ isAvailable: Boolean(!exists) });
  }
  return methodNotAllowed(res);
};

export default handler;
