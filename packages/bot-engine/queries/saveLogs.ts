import prisma from '@sniper.io/lib/prisma'
import { Log } from '@sniper.io/schemas'

export const saveLogs = (logs: Omit<Log, 'id' | 'createdAt'>[]) =>
  prisma.log.createMany({ data: logs })
