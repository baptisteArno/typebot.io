import { auth } from "@/features/auth/lib/nextAuth";
import prisma from "@typebot.io/prisma";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import type { User } from "@typebot.io/user/schemas";
import type { GetServerSidePropsContext } from "next";

export const trackAnalyticsPageView = async (
  context: GetServerSidePropsContext,
) => {
  const typebotId = context.params?.typebotId as string | undefined;
  if (!typebotId) return;
  const typebot = await prisma.typebot.findUnique({
    where: { id: typebotId },
    select: { workspaceId: true },
  });
  if (!typebot) return;
  const session = await auth(context);
  await trackEvents([
    {
      name: "Analytics visited",
      typebotId,
      userId: (session?.user as User).id,
      workspaceId: typebot.workspaceId,
    },
  ]);
};
