import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import { Result } from '@typebot.io/schemas'
import { isDefined, isNotDefined } from '@typebot.io/lib'

let progress = 0

const bulkUpdate = async () => {
  await promptAndSetEnvironment()
  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      'info',
      'warn',
      'error',
    ],
  })

  const results = (await prisma.result.findMany({
    where: {
      variables: { equals: [] },
    },
    select: { variables: true, id: true },
  })) as Pick<Result, 'variables' | 'id'>[]

  const queries = results
    .map((result) => {
      if (
        result.variables.some((variable) => typeof variable.value !== 'string')
      ) {
        return prisma.result.updateMany({
          where: { id: result.id },
          data: {
            variables: result.variables
              .map((variable) => ({
                ...variable,
                value:
                  typeof variable.value !== 'string'
                    ? safeStringify(variable.value)
                    : variable.value,
              }))
              .filter(isDefined),
          },
        })
      }
    })
    .filter(isDefined)

  const total = queries.length

  prisma.$on('query', () => {
    progress += 1
    console.log(`Progress: ${progress}/${total}`)
  })

  await prisma.$transaction(queries)
}

export const safeStringify = (val: unknown): string | null => {
  if (isNotDefined(val)) return null
  if (typeof val === 'string') return val
  try {
    return JSON.stringify(val)
  } catch {
    console.warn('Failed to safely stringify variable value', val)
    return null
  }
}

bulkUpdate()
