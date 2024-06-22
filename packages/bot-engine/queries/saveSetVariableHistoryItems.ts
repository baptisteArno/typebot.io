import prisma from '@sniper.io/lib/prisma'
import { Prisma } from '@sniper.io/prisma'
import { SetVariableHistoryItem } from '@sniper.io/schemas'

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
