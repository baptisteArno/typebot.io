import { methodNotAllowed } from "@typebot.io/lib/api/utils";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    return res.status(200).send(req.body);
  }
  return methodNotAllowed(res);
};

export default handler;
