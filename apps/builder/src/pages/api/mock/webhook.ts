import { methodNotAllowed } from "@typebot.io/lib/api/utils";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const firstParam = req.query.firstParam?.toString();
    const secondParam = req.query.secondParam?.toString();
    const customHeader = req.headers["custom-typebot"];
    const { body } = req;
    if (
      body.customField === "secret4" &&
      customHeader === "secret3" &&
      secondParam === "secret2" &&
      firstParam === "secret1"
    ) {
      return res.status(200).send([
        { name: "John", age: 21 },
        { name: "Tim", age: 52 },
      ]);
    }
    return res.status(400).send({ message: "Bad request" });
  }
  return methodNotAllowed(res);
};

export default handler;
