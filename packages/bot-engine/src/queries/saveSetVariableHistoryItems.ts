import prisma from "@typebot.io/prisma";
import { JsonNull } from "@typebot.io/prisma/enum";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";

export const saveSetVariableHistoryItems = (
  setVariableHistory: SetVariableHistoryItem[],
) =>
  prisma.setVariableHistoryItem.createMany({
    data: {
      ...setVariableHistory.map((item) => ({
        ...item,
        value: item.value === null ? JsonNull : item.value,
      })),
    },
    skipDuplicates: true,
  });
