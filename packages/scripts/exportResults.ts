import { PrismaClient } from '@typebot.io/prisma'
import * as p from '@clack/prompts'
import { promptAndSetEnvironment } from './utils'
import cliProgress from 'cli-progress'
import { writeFileSync } from 'fs'
import {
  ResultWithAnswers,
  Typebot,
  resultWithAnswersSchema,
} from '@typebot.io/schemas'
import { byId } from '@typebot.io/lib'
import { parseResultHeader } from '@typebot.io/lib/results/parseResultHeader'
import { convertResultsToTableData } from '@typebot.io/lib/results/convertResultsToTableData'
import { parseColumnsOrder } from '@typebot.io/lib/results/parseColumnsOrder'
import { parseUniqueKey } from '@typebot.io/lib/parseUniqueKey'
import { unparse } from 'papaparse'
import { z } from 'zod'

const exportResults = async () => {
  await promptAndSetEnvironment('production')

  const prisma = new PrismaClient()

  const typebotId = (await p.text({
    message: 'Typebot ID?',
  })) as string

  if (!typebotId || typeof typebotId !== 'string') {
    console.log('No id provided')
    return
  }

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  )

  const typebot = (await prisma.typebot.findUnique({
    where: {
      id: typebotId,
    },
  })) as Typebot | null

  if (!typebot) {
    console.log('No typebot found')
    return
  }

  const totalResultsToExport = await prisma.result.count({
    where: {
      typebotId,
      hasStarted: true,
      isArchived: false,
    },
  })

  progressBar.start(totalResultsToExport, 0)

  const results: ResultWithAnswers[] = []

  for (let skip = 0; skip < totalResultsToExport; skip += 50) {
    results.push(
      ...z.array(resultWithAnswersSchema).parse(
        await prisma.result.findMany({
          take: 50,
          skip,
          where: {
            typebotId,
            hasStarted: true,
            isArchived: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: { answers: true },
        })
      )
    )
    progressBar.increment(50)
  }

  progressBar.stop()

  writeFileSync('logs/results.json', JSON.stringify(results))

  const resultHeader = parseResultHeader(typebot, [])

  const dataToUnparse = convertResultsToTableData(results, resultHeader)

  const headerIds = parseColumnsOrder(
    typebot?.resultsTablePreferences?.columnsOrder,
    resultHeader
  ).reduce<string[]>((currentHeaderIds, columnId) => {
    if (typebot?.resultsTablePreferences?.columnsVisibility[columnId] === false)
      return currentHeaderIds
    const columnLabel = resultHeader.find(
      (headerCell) => headerCell.id === columnId
    )?.id
    if (!columnLabel) return currentHeaderIds
    return [...currentHeaderIds, columnLabel]
  }, [])

  const data = dataToUnparse.map<{ [key: string]: string }>((data) => {
    const newObject: { [key: string]: string } = {}
    headerIds?.forEach((headerId) => {
      const headerLabel = resultHeader.find(byId(headerId))?.label
      if (!headerLabel) return
      const newKey = parseUniqueKey(headerLabel, Object.keys(newObject))
      newObject[newKey] = data[headerId]?.plainText
    })
    return newObject
  })

  const csv = unparse(data)

  writeFileSync('logs/results.csv', csv)
}

exportResults()
