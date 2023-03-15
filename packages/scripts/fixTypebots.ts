import { PrismaClient } from '@typebot.io/prisma'
import { writeFileSync } from 'fs'
import {
  Block,
  BlockOptions,
  BlockType,
  defaultEmailInputOptions,
  Group,
  InputBlockType,
  PublicTypebot,
  publicTypebotSchema,
  Theme,
  Typebot,
} from '@typebot.io/schemas'
import { isDefined, isNotDefined } from '@typebot.io/lib'
import { promptAndSetEnvironment } from './utils'
import { detailedDiff } from 'deep-object-diff'

const fixTypebot = (brokenTypebot: Typebot | PublicTypebot) =>
  ({
    ...brokenTypebot,
    theme: fixTheme(brokenTypebot.theme),
    groups: fixGroups(brokenTypebot.groups),
  } satisfies Typebot | PublicTypebot)

const fixTheme = (brokenTheme: Theme) =>
  ({
    ...brokenTheme,
    chat: {
      ...brokenTheme.chat,
      hostAvatar: brokenTheme.chat.hostAvatar
        ? {
            isEnabled: brokenTheme.chat.hostAvatar.isEnabled,
            url: brokenTheme.chat.hostAvatar.url ?? undefined,
          }
        : undefined,
    },
  } satisfies Theme)

const fixGroups = (brokenGroups: Group[]) =>
  brokenGroups.map(
    (brokenGroup, index) =>
      ({
        ...brokenGroup,
        graphCoordinates: {
          ...brokenGroup.graphCoordinates,
          x: brokenGroup.graphCoordinates.x ?? 0,
          y: brokenGroup.graphCoordinates.y ?? 0,
        },
        blocks: fixBlocks(brokenGroup.blocks, brokenGroup.id, index),
      } satisfies Group)
  )

const fixBlocks = (
  brokenBlocks: Block[],
  groupId: string,
  groupIndex: number
) => {
  if (groupIndex === 0 && brokenBlocks.length > 1) return [brokenBlocks[0]]
  return brokenBlocks
    .filter((block) => block && Object.keys(block).length > 0)
    .map((brokenBlock) => {
      return removeUndefinedFromObject({
        ...brokenBlock,
        webhookId:
          ('webhookId' in brokenBlock ? brokenBlock.webhookId : undefined) ??
          ('webhook' in brokenBlock && brokenBlock.webhook
            ? //@ts-ignore
              brokenBlock.webhook.id
            : undefined),
        webhook: undefined,
        groupId: brokenBlock.groupId ?? groupId,
        options:
          brokenBlock && 'options' in brokenBlock && brokenBlock.options
            ? fixBrokenBlockOption(brokenBlock.options, brokenBlock.type)
            : undefined,
      })
    }) as Block[]
}

const fixBrokenBlockOption = (options: BlockOptions, blockType: BlockType) =>
  removeUndefinedFromObject({
    ...options,
    sheetId:
      'sheetId' in options && isDefined(options.sheetId)
        ? options.sheetId.toString()
        : undefined,
    step:
      'step' in options && isDefined(options.step) ? options.step : undefined,
    value:
      'value' in options && isDefined(options.value)
        ? options.value
        : undefined,
    retryMessageContent: fixRetryMessageContent(
      //@ts-ignore
      options.retryMessageContent,
      blockType
    ),
  }) as BlockOptions

const fixRetryMessageContent = (
  retryMessageContent: string | undefined,
  blockType: BlockType
) => {
  if (isNotDefined(retryMessageContent) && blockType === InputBlockType.EMAIL)
    return defaultEmailInputOptions.retryMessageContent
  if (isNotDefined(retryMessageContent)) return undefined
  return retryMessageContent
}

const removeUndefinedFromObject = (obj: any) => {
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key])
  return obj
}

const resolve = (path: string, obj: object, separator = '.') => {
  const properties = Array.isArray(path) ? path : path.split(separator)
  //@ts-ignore
  return properties.reduce((prev, curr) => prev?.[curr], obj)
}

const fixTypebots = async () => {
  await promptAndSetEnvironment()
  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  const typebots = await prisma.publicTypebot.findMany({
    where: {
      updatedAt: {
        gte: new Date('2023-01-01T00:00:00.000Z'),
      },
    },
  })

  writeFileSync('logs/typebots.json', JSON.stringify(typebots))

  const total = typebots.length
  let totalFixed = 0
  let progress = 0
  const fixedTypebots: (Typebot | PublicTypebot)[] = []
  const diffs: any[] = []
  for (const typebot of typebots) {
    progress += 1
    console.log(
      `Progress: ${progress}/${total} (${Math.round(
        (progress / total) * 100
      )}%) (${totalFixed} fixed typebots)`
    )
    const parser = publicTypebotSchema.safeParse({
      ...typebot,
      updatedAt: new Date(typebot.updatedAt),
      createdAt: new Date(typebot.createdAt),
    })
    if ('error' in parser) {
      const fixedTypebot = {
        ...fixTypebot(typebot as Typebot | PublicTypebot),
        updatedAt: new Date(),
        createdAt: new Date(typebot.createdAt),
      }
      publicTypebotSchema.parse(fixedTypebot)
      fixedTypebots.push(fixedTypebot)
      totalFixed += 1
      diffs.push({
        id: typebot.id,
        failedObject: resolve(parser.error.issues[0].path.join('.'), typebot),
        ...detailedDiff(typebot, fixedTypebot),
      })
    }
  }
  writeFileSync('logs/fixedTypebots.json', JSON.stringify(fixedTypebots))
  writeFileSync(
    'logs/diffs.json',
    JSON.stringify(diffs.reverse().slice(0, 100))
  )

  const queries = fixedTypebots.map((fixedTypebot) =>
    prisma.publicTypebot.updateMany({
      where: { id: fixedTypebot.id },
      data: {
        ...fixedTypebot,
        // theme: fixedTypebot.theme ?? undefined,
        // settings: fixedTypebot.settings ?? undefined,
        // resultsTablePreferences:
        //   'resultsTablePreferences' in fixedTypebot &&
        //   fixedTypebot.resultsTablePreferences
        //     ? fixedTypebot.resultsTablePreferences
        //     : undefined,
      } as any,
    })
  )

  const totalQueries = queries.length
  progress = 0
  prisma.$on('query', () => {
    progress += 1
    console.log(`Progress: ${progress}/${totalQueries}`)
  })

  await prisma.$transaction(queries)
}

fixTypebots()
