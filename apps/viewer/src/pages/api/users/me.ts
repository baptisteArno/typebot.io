import { authenticateUser } from "@/helpers/authenticateUser";
import { methodNotAllowed } from "@typebot.io/lib/api/utils";
import { isNotDefined } from "@typebot.io/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const user = await authenticateUser(req);
    if (isNotDefined(user))
      return res.status(404).send({ message: "User not found" });
    return res.send({ id: user.id, email: user.email });
  }
  return methodNotAllowed(res);
};

export default handler;
