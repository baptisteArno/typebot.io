import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { methodNotAllowed, notAuthenticated } from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import { DbNull } from "@typebot.io/prisma/enum";

import type { User } from "@typebot.io/schemas/features/user/schema";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);

  const id = req.query.userId as string;
  if (req.method === "PATCH") {
    const data = (
      typeof req.body === "string" ? JSON.parse(req.body) : req.body
    ) as Partial<User>;
    const typebots = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        onboardingCategories: data.onboardingCategories ?? [],
        displayedInAppNotifications: data.displayedInAppNotifications ?? DbNull,
      },
    });
    if (data.onboardingCategories || data.referral || data.company || data.name)
      await trackEvents([
        {
          name: "User updated",
          userId: user.id,
          data: {
            name: data.name ?? undefined,
            onboardingCategories: data.onboardingCategories ?? undefined,
            referral: data.referral ?? undefined,
            company: data.company ?? undefined,
          },
        },
      ]);
    return res.send({ typebots });
  }
  return methodNotAllowed(res);
};

export default handler;
