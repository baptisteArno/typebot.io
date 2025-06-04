import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { methodNotAllowed, notAuthenticated } from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import { updateUserSchema } from "@typebot.io/user/schemas";
import type { NextApiRequest, NextApiResponse } from "next";

// TODO: Delete in favor of updateUser mutation
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);

  const id = req.query.userId as string;
  if (req.method === "PATCH") {
    const data = updateUserSchema
      .partial()
      .parse(typeof req.body === "string" ? JSON.parse(req.body) : req.body);
    const typebots = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        onboardingCategories: data.onboardingCategories,
        displayedInAppNotifications:
          data.displayedInAppNotifications ?? undefined,
        groupTitlesAutoGeneration: data.groupTitlesAutoGeneration ?? undefined,
      },
    });
    return res.send({ typebots });
  }
  return methodNotAllowed(res);
};

export default handler;
