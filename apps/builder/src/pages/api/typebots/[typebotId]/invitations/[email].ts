import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { canEditGuests } from "@/helpers/databaseRules";
import { methodNotAllowed, notAuthenticated } from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);
  const typebotId = req.query.typebotId as string;
  const email = req.query.email as string;
  if (req.method === "PATCH") {
    const data = req.body as Prisma.Invitation;
    await prisma.invitation.updateMany({
      where: { email, typebot: canEditGuests(user, typebotId) },
      data: { type: data.type },
    });
    return res.send({
      message: "success",
    });
  }
  if (req.method === "DELETE") {
    await prisma.invitation.deleteMany({
      where: {
        email,
        typebot: canEditGuests(user, typebotId),
      },
    });
    return res.send({
      message: "success",
    });
  }
  methodNotAllowed(res);
};

export default handler;
