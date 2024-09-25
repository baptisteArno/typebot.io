import { sendRequest } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";

export const deleteApiTokenQuery = ({
  userId,
  tokenId,
}: {
  userId: string;
  tokenId: string;
}) =>
  sendRequest<{ apiToken: Prisma.ApiToken }>({
    url: `/api/users/${userId}/api-tokens/${tokenId}`,
    method: "DELETE",
  });
