import { methodNotAllowed } from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "PUT") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { uploadedFiles, ...answer } = (
      typeof req.body === "string" ? JSON.parse(req.body) : req.body
    ) as Prisma.Answer & { uploadedFiles: string[] };
    const result = await prisma.answer.createMany({
      data: [{ ...answer }],
    });
    return res.send(result);
  }
  return methodNotAllowed(res);
};

export default handler;
