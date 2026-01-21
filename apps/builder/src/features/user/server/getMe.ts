import prisma from "@typebot.io/prisma";
import type { ClientUser } from "@typebot.io/user/schemas";
import { clientUserSchema } from "@typebot.io/user/schemas";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const getMe = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/users/me",
    },
  })
  .output(clientUserSchema)
  .query(async ({ ctx: { user } }) => {
    const fullUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        company: true,
        createdAt: true,
        lastActivityAt: true,
        graphNavigation: true,
        preferredAppAppearance: true,
        displayedInAppNotifications: true,
        groupTitlesAutoGeneration: true,
        preferredLanguage: true,
        termsAcceptedAt: true,
      },
    });

    // Transform Prisma Json types to proper TypeScript types
    return {
      ...fullUser,
      displayedInAppNotifications:
        fullUser.displayedInAppNotifications as ClientUser["displayedInAppNotifications"],
      groupTitlesAutoGeneration:
        fullUser.groupTitlesAutoGeneration as ClientUser["groupTitlesAutoGeneration"],
    };
  });
