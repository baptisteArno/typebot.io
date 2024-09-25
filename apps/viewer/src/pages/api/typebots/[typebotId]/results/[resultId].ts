import { methodNotAllowed } from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import type { Result } from "@typebot.io/results/schemas/results";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "PATCH") {
    const data = (
      typeof req.body === "string" ? JSON.parse(req.body) : req.body
    ) as Result;
    const resultId = req.query.resultId as string;
    const result = await prisma.result.updateMany({
      where: { id: resultId },
      data,
    });
    return res.send(result);
  }
  return methodNotAllowed(res);
};

export default handler;
