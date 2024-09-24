import { sendRequest } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";
import type { AnswerInput } from "@typebot.io/results/schemas/answers";

export const upsertAnswerQuery = async (
  answer: AnswerInput & { resultId: string } & { uploadedFiles?: boolean },
) =>
  sendRequest<Prisma.Answer>({
    url: `/api/typebots/t/results/r/answers`,
    method: "PUT",
    body: answer,
  });
