import prisma from '@typebot.io/lib/prisma'
import { Prisma } from '@typebot.io/prisma'
import { SetVariableHistoryItem } from '@typebot.io/schemas'

export const saveSetVariableHistoryItems = (
  setVariableHistory: SetVariableHistoryItem[]
) =>
  prisma.setVariableHistoryItem.createMany({
    data: {
      ...setVariableHistory.map((item) => ({
        ...item,
        value: item.value === null ? Prisma.JsonNull : item.value,
      })),
    },
    skipDuplicates: true,
  })
