import prisma from "@typebot.io/prisma";
import type { ChatProvider } from "@typebot.io/prisma/enum";

type Params = {
  url: string;
  mediaId: string;
  provider: ChatProvider;
  expiresAt?: Date;
  publicTypebotId: string;
};

export const insertMediaIdToCache = async ({
  url,
  mediaId,
  provider,
  expiresAt,
  publicTypebotId,
}: Params) =>
  prisma.runtimeMediaIdCache.upsert({
    where: {
      publicTypebotId_provider_url: {
        publicTypebotId,
        provider,
        url,
      },
    },
    create: {
      provider,
      url,
      mediaId,
      expiresAt,
      publicTypebotId,
    },
    update: {
      mediaId,
      expiresAt,
    },
  });
