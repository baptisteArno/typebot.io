import {
  InputBlock,
  PublicTypebot,
  ResultHeaderCell,
  Block,
  Typebot,
  TypebotLinkBlock,
} from '@typebot.io/schemas'
import { isInputBlock, byId, isNotDefined } from '@typebot.io/lib'
import { parseResultHeader } from '@typebot.io/lib/results'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { EventType } from '@typebot.io/schemas/features/events/constants'

export const parseResultExample =
  ({
    typebot,
    linkedTypebots,
    userEmail,
  }: {
    typebot: Pick<
      Typebot | PublicTypebot,
      'groups' | 'variables' | 'edges' | 'events'
    >
    linkedTypebots: (Typebot | PublicTypebot)[]
    userEmail: string
  }) =>
  async (
    currentBlockId: string
  ): Promise<
    {
      message: 'This is a sample result, it has been generated ⬇️'
      'Submitted at': string
    } & { [k: string]: string | undefined }
  > => {
    const header = parseResultHeader(typebot, linkedTypebots)
    const linkedInputBlocks = await extractLinkedInputBlocks(
      typebot,
      linkedTypebots
    )(currentBlockId)

    return {
      message: 'This is a sample result, it has been generated ⬇️',
      'Submitted at': new Date().toISOString(),
      ...parseResultSample({
        inputBlocks: linkedInputBlocks,
        headerCells: header,
        userEmail,
      }),
    }
  }

const extractLinkedInputBlocks =
  (
    typebot:
      | Pick<
          Typebot | PublicTypebot,
          'groups' | 'variables' | 'edges' | 'events'
        >
      | undefined,
    linkedTypebots: (Typebot | PublicTypebot)[]
  ) =>
  async (
    blockId?: string,
    direction: 'backward' | 'forward' = 'backward'
  ): Promise<InputBlock[]> => {
    if (!typebot) return []
    const previousLinkedTypebotBlocks = walkEdgesAndExtract(
      'linkedBot',
      direction,
      typebot
    )({
      blockId,
    }) as TypebotLinkBlock[]

    const linkedBotInputs =
      previousLinkedTypebotBlocks.length > 0
        ? await Promise.all(
            previousLinkedTypebotBlocks.map((linkedBot) => {
              const typebot = linkedTypebots.find((t) =>
                'typebotId' in t
                  ? t.typebotId === linkedBot.options?.typebotId
                  : t.id === linkedBot.options?.typebotId
              )
              const blockId = linkedBot.options?.groupId
                ? typebot?.groups
                    .find(byId(linkedBot.options?.groupId))
                    ?.blocks.at(0)?.id
                : undefined
              return extractLinkedInputBlocks(typebot, linkedTypebots)(
                blockId,
                'forward'
              )
            })
          )
        : []

    return (
      walkEdgesAndExtract(
        'input',
        direction,
        typebot
      )({
        blockId,
      }) as InputBlock[]
    ).concat(linkedBotInputs.flatMap((l) => l))
  }

const parseResultSample = ({
  inputBlocks,
  headerCells,
  userEmail,
}: {
  inputBlocks: InputBlock[]
  headerCells: ResultHeaderCell[]
  userEmail: string
}) =>
  headerCells.reduce<Record<string, string | undefined>>(
    (resultSample, cell) => {
      const inputBlock = inputBlocks.find((inputBlock) =>
        cell.blocks?.some((block) => block.id === inputBlock.id)
      )
      if (isNotDefined(inputBlock)) {
        if (cell.variableIds)
          return {
            ...resultSample,
            [cell.label]: 'content',
          }
        return resultSample
      }
      const value = getSampleValue({ block: inputBlock, userEmail })
      return {
        ...resultSample,
        [cell.label]: value,
      }
    },
    {}
  )

const getSampleValue = ({
  block,
  userEmail,
}: {
  block: InputBlock
  userEmail: string
}) => {
  switch (block.type) {
    case InputBlockType.CHOICE:
      return block.options?.isMultipleChoice
        ? block.items?.map((i) => i.content).join(', ')
        : block.items?.at(0)?.content ?? 'Item'
    case InputBlockType.DATE:
      return new Date().toUTCString()
    case InputBlockType.EMAIL:
      return userEmail
    case InputBlockType.NUMBER:
      return '20'
    case InputBlockType.PHONE:
      return '+33665566773'
    case InputBlockType.TEXT:
      return 'answer value'
    case InputBlockType.URL:
      return 'https://test.com'
  }
}

const walkEdgesAndExtract =
  (
    type: 'input' | 'linkedBot',
    direction: 'backward' | 'forward',
    typebot: Pick<
      Typebot | PublicTypebot,
      'groups' | 'variables' | 'edges' | 'events'
    >
  ) =>
  ({ blockId }: { blockId?: string }): Block[] => {
    const groupId = typebot.groups.find((g) =>
      g.blocks.some((b) => b.id === blockId)
    )?.id
    const startEventEdgeId = groupId
      ? undefined
      : typebot.events?.find((e) => e.type === EventType.START)?.outgoingEdgeId
    const currentGroupId =
      groupId ??
      (startEventEdgeId
        ? typebot.edges.find(byId(startEventEdgeId))?.to.groupId
        : typebot.groups.find((g) => g.blocks[0].type === 'start')?.id)
    if (!currentGroupId)
      throw new Error("walkEdgesAndExtract - Can't find currentGroupId")
    const blocksInGroup = extractBlocksInGroup(
      type,
      typebot
    )({
      groupId: currentGroupId,
      blockId,
    })
    const otherGroupIds = getConnectedGroups(typebot, direction)(currentGroupId)
    return [
      ...blocksInGroup,
      ...otherGroupIds.flatMap((groupId) =>
        extractBlocksInGroup(type, typebot)({ groupId, blockId })
      ),
    ]
  }

const getConnectedGroups =
  (
    typebot: Pick<Typebot | PublicTypebot, 'groups' | 'variables' | 'edges'>,
    direction: 'backward' | 'forward',
    existingGroupIds?: string[]
  ) =>
  (groupId: string): string[] => {
    const groups = typebot.edges.reduce<string[]>((groupIds, edge) => {
      const fromGroupId = typebot.groups.find((g) =>
        g.blocks.some(
          (b) => 'blockId' in edge.from && b.id === edge.from.blockId
        )
      )?.id
      if (!fromGroupId) return groupIds
      if (direction === 'forward')
        return (!existingGroupIds ||
          !existingGroupIds?.includes(edge.to.groupId)) &&
          fromGroupId === groupId
          ? [...groupIds, edge.to.groupId]
          : groupIds
      return (!existingGroupIds || !existingGroupIds.includes(fromGroupId)) &&
        edge.to.groupId === groupId
        ? [...groupIds, fromGroupId]
        : groupIds
    }, [])
    const newGroups = [...(existingGroupIds ?? []), ...groups]
    return groups.concat(
      groups.flatMap(getConnectedGroups(typebot, direction, newGroups))
    )
  }

const extractBlocksInGroup =
  (
    type: 'input' | 'linkedBot',
    typebot: Pick<Typebot | PublicTypebot, 'groups' | 'variables' | 'edges'>
  ) =>
  ({ groupId, blockId }: { groupId: string; blockId: string | undefined }) => {
    const currentGroup = typebot.groups.find(byId(groupId))
    if (!currentGroup) return []
    const blocks: Block[] = []
    for (const block of currentGroup.blocks) {
      if (block.id === blockId) break
      if (type === 'input' && isInputBlock(block)) blocks.push(block)
      if (type === 'linkedBot' && block.type === LogicBlockType.TYPEBOT_LINK)
        blocks.push(block)
    }
    return blocks
  }
