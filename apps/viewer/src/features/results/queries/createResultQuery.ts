import { sendRequest } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";

export const createResultQuery = async (typebotId: string) => {
  return sendRequest<{ result: Prisma.Result; hasReachedLimit: boolean }>({
    url: `/api/typebots/${typebotId}/results`,
    method: "POST",
  });
};
