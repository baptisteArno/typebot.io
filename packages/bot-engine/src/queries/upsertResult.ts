import prisma from "@typebot.io/prisma";
import { JsonNull } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import { filterNonSessionVariablesWithValues } from "@typebot.io/variables/filterVariablesWithValues";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";
import { formatLogDetails } from "../logs/helpers/formatLogDetails";
import type { ContinueChatResponse } from "../schemas/api";
import type { TypebotInSession } from "../schemas/chatSession";

type Props = {
  resultId: string;
  typebot: TypebotInSession;
  hasStarted: boolean;
  isCompleted: boolean;
  lastChatSessionId?: string;
  logs?: ContinueChatResponse["logs"];
  visitedEdges?: Prisma.VisitedEdge[];
  setVariableHistory?: SetVariableHistoryItem[];
};
export const upsertResult = ({
  resultId,
  typebot,
  hasStarted,
  isCompleted,
  lastChatSessionId,
  logs,
  visitedEdges,
  setVariableHistory,
}: Props): Prisma.PrismaPromise<any> => {
  const variablesWithValue = filterNonSessionVariablesWithValues(
    typebot.variables,
  );
  const logsToCreate =
    logs && logs.length > 0
      ? {
          createMany: {
            data: logs.map((log) => ({
              ...log,
              details: formatLogDetails(log.details),
            })),
            skipDuplicates: true,
          },
        }
      : undefined;

  const setVariableHistoryToCreate =
    setVariableHistory && setVariableHistory.length > 0
      ? ({
          createMany: {
            data: setVariableHistory.map((item) => ({
              ...item,
              value: item.value === null ? JsonNull : item.value,
              resultId: undefined,
            })),
            skipDuplicates: true,
          },
        } as Prisma.Prisma.SetVariableHistoryItemUpdateManyWithoutResultNestedInput)
      : undefined;

  const visitedEdgesToCreate =
    visitedEdges && visitedEdges.length > 0
      ? {
          createMany: {
            data: visitedEdges.map((edge) => ({
              ...edge,
              resultId: undefined,
            })),
            skipDuplicates: true,
          },
        }
      : undefined;

  return prisma.result.upsert({
    where: { id: resultId },
    update: {
      isCompleted: isCompleted ? true : undefined,
      hasStarted,
      variables: variablesWithValue,
      lastChatSessionId,
      logs: logsToCreate,
      setVariableHistory: setVariableHistoryToCreate,
      edges: visitedEdgesToCreate,
    },
    create: {
      id: resultId,
      typebotId: typebot.id,
      isCompleted: isCompleted ? true : false,
      hasStarted,
      variables: variablesWithValue,
      lastChatSessionId,
      logs: logsToCreate,
      setVariableHistory: setVariableHistoryToCreate,
      edges: visitedEdgesToCreate,
    },
    select: { id: true },
  });
};
