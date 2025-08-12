import prisma from "@typebot.io/prisma";
import type { ChatProvider } from "@typebot.io/prisma/enum";

type Params = {
  url: string;
  provider: ChatProvider;
  publicTypebotId: string;
};

export const getMediaIdFromCache = async ({
  url,
  provider,
  publicTypebotId,
}: Params) => {
  const { mediaId, expiresAt } =
    (await prisma.runtimeMediaIdCache.findUnique({
      where: {
        publicTypebotId_provider_url: { publicTypebotId, provider, url },
      },
      select: {
        mediaId: true,
        expiresAt: true,
      },
    })) ?? {};

  if (expiresAt && expiresAt < new Date()) {
    await prisma.runtimeMediaIdCache.delete({
      where: {
        publicTypebotId_provider_url: { publicTypebotId, provider, url },
      },
    });
    return null;
  }

  return mediaId;
};
