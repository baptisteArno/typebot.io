import {
  initMiddleware,
  methodNotAllowed,
  notFound,
} from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import Cors from "cors";
import type { NextApiRequest, NextApiResponse } from "next";

const cors = initMiddleware(Cors());

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  if (req.method === "GET") {
    const typebotId = req.query.typebotId as string;
    const typebot = await prisma.publicTypebot.findUnique({
      where: { typebotId },
    });
    if (!typebot) return notFound(res);
    return res.send({ typebot });
  }
  methodNotAllowed(res);
};

export default handler;
