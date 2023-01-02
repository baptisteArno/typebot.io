import { PrismaClient } from 'db'
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
} from 'models'
import { isNotDefined } from 'utils'
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

const fixBrokenBlockOption = (option: BlockOptions, blockType: BlockType) =>
  removeUndefinedFromObject({
    ...option,
    sheetId:
      'sheetId' in option && option.sheetId
        ? option.sheetId.toString()
        : undefined,
    step: 'step' in option && option.step ? option.step : undefined,
    value: 'value' in option && option.value ? option.value : undefined,
    retryMessageContent: fixRetryMessageContent(
      //@ts-ignore
      option.retryMessageContent,
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

  const typebots = await prisma.publicTypebot.findMany()

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
        updatedAt: new Date(typebot.updatedAt),
        createdAt: new Date(typebot.createdAt),
      }
      publicTypebotSchema.parse(fixedTypebot)
      fixedTypebots.push(fixedTypebot)
      totalFixed += 1
      diffs.push({
        id: typebot.id,
        failedObject: resolve(
          parser.error.issues[0].path.join('.'),
          fixedTypebot
        ),
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

// export const parseZodError = (parser: any) => {
//   if ('error' in parser) {
//     console.log(
//       parser.error.issues.map((issue) =>
//         JSON.stringify({
//           message: issue.message,
//           path: issue.path,
//         })
//       )
//     )
//     writeFileSync(
//       'failedObject.json',
//       JSON.stringify(
//         resolve(parser.error.issues[0].path.join('.'), fixedTypebot)
//       )
//     )
//     writeFileSync('failedTypebot.json', JSON.stringify(fixedTypebot))
//     writeFileSync('issue.json', JSON.stringify(parser.error.issues))
//     exit()
//   }
// }

fixTypebots()
