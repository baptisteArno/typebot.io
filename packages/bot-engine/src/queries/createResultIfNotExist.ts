import prisma from "@typebot.io/prisma";
import type { TypebotInSession } from "../schemas/chatSession";

type Props = {
  resultId: string;
  typebot: TypebotInSession;
  hasStarted: boolean;
  isCompleted: boolean;
};

export const createResultIfNotExist = async ({
  resultId,
  typebot,
  hasStarted,
  isCompleted,
}: Props) => {
  const existingResult = await prisma.result.findUnique({
    where: { id: resultId },
    select: { id: true },
  });
  if (existingResult) return;
  return prisma.result.createMany({
    data: [
      {
        id: resultId,
        typebotId: typebot.id,
        isCompleted: isCompleted ? true : false,
        hasStarted,
        variables: typebot.variables,
      },
    ],
  });
};
