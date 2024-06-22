import { PrismaClient } from '@sniper.io/prisma'
import * as p from '@clack/prompts'
import { promptAndSetEnvironment } from './utils'
import cliProgress from 'cli-progress'
import { writeFileSync } from 'fs'
import {
  ResultWithAnswers,
  SniperV6,
  resultWithAnswersSchema,
} from '@sniper.io/schemas'
import { byId } from '@sniper.io/lib'
import { parseResultHeader } from '@sniper.io/results/parseResultHeader'
import { convertResultsToTableData } from '@sniper.io/results/convertResultsToTableData'
import { parseBlockIdVariableIdMap } from '@sniper.io/results/parseBlockIdVariableIdMap'
import { parseColumnsOrder } from '@sniper.io/results/parseColumnsOrder'
import { parseUniqueKey } from '@sniper.io/lib/parseUniqueKey'
import { unparse } from 'papaparse'
import { z } from 'zod'

const exportResults = async () => {
  await promptAndSetEnvironment('production')

  const prisma = new PrismaClient()

  const sniperId = (await p.text({
    message: 'Sniper ID?',
  })) as string

  if (!sniperId || typeof sniperId !== 'string') {
    console.log('No id provided')
    return
  }

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  )

  const sniper = (await prisma.sniper.findUnique({
    where: {
      id: sniperId,
    },
  })) as SniperV6 | null

  if (!sniper) {
    console.log('No sniper found')
    return
  }

  const totalResultsToExport = await prisma.result.count({
    where: {
      sniperId,
      hasStarted: true,
      isArchived: false,
    },
  })

  progressBar.start(totalResultsToExport, 0)

  const results: ResultWithAnswers[] = []

  for (let skip = 0; skip < totalResultsToExport; skip += 50) {
    results.push(
      ...z.array(resultWithAnswersSchema).parse(
        (
          await prisma.result.findMany({
            take: 50,
            skip,
            where: {
              sniperId,
              hasStarted: true,
              isArchived: false,
            },
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              answers: {
                select: {
                  content: true,
                  blockId: true,
                },
              },
              answersV2: {
                select: {
                  content: true,
                  blockId: true,
                },
              },
            },
          })
        ).map((r) => ({ ...r, answers: r.answersV2.concat(r.answers) }))
      )
    )
    progressBar.increment(50)
  }

  progressBar.stop()

  writeFileSync('logs/results.json', JSON.stringify(results))

  const resultHeader = parseResultHeader(sniper, [])

  const dataToUnparse = convertResultsToTableData({
    results,
    headerCells: resultHeader,
    blockIdVariableIdMap: parseBlockIdVariableIdMap(sniper?.groups),
  })

  const headerIds = parseColumnsOrder(
    sniper?.resultsTablePreferences?.columnsOrder,
    resultHeader
  ).reduce<string[]>((currentHeaderIds, columnId) => {
    if (sniper?.resultsTablePreferences?.columnsVisibility[columnId] === false)
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
