import { sendRequest } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";

export const updateResultQuery = async (
  resultId: string,
  result: Partial<Prisma.Result>,
) =>
  sendRequest<Prisma.Result>({
    url: `/api/typebots/t/results/${resultId}`,
    method: "PATCH",
    body: result,
  });
