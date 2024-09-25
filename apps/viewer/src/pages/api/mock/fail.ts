import { methodNotAllowed } from "@typebot.io/lib/api/utils";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    return res.status(500).json({
      statusCode: 500,
      statusMessage: "Fail",
    });
  }
  methodNotAllowed(res);
};

export default handler;
