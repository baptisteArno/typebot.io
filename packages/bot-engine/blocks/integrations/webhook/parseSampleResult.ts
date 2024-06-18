import {
  InputBlock,
  PublicSniper,
  ResultHeaderCell,
  Block,
  Sniper,
  SniperLinkBlock,
  Variable,
} from '@sniper.io/schemas'
import { byId, isNotDefined } from '@sniper.io/lib'
import { isInputBlock } from '@sniper.io/schemas/helpers'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@sniper.io/schemas/features/blocks/logic/constants'
import { parseResultHeader } from '@sniper.io/results/parseResultHeader'

export const parseSampleResult =
  (
    sniper: Pick<Sniper | PublicSniper, 'groups' | 'variables' | 'edges'>,
    linkedSnipers: (Sniper | PublicSniper)[],
    userEmail?: string
  ) =>
  async (
    currentGroupId: string,
    variables: Variable[]
  ): Promise<Record<string, string | boolean | undefined>> => {
    const header = parseResultHeader(sniper, linkedSnipers)
    const linkedInputBlocks = await extractLinkedInputBlocks(
      sniper,
      linkedSnipers
    )(currentGroupId)

    return {
      message: 'This is a sample result, it has been generated ⬇️',
      submittedAt: new Date().toISOString(),
      ...parseResultSample(linkedInputBlocks, header, variables, userEmail),
    }
  }

const extractLinkedInputBlocks =
  (
    sniper: Pick<Sniper | PublicSniper, 'groups' | 'variables' | 'edges'>,
    linkedSnipers: (Sniper | PublicSniper)[]
  ) =>
  async (
    currentGroupId?: string,
    direction: 'backward' | 'forward' = 'backward'
  ): Promise<InputBlock[]> => {
    const previousLinkedSniperBlocks = walkEdgesAndExtract(
      'linkedBot',
      direction,
      sniper
    )({
      groupId: currentGroupId,
    }) as SniperLinkBlock[]

    const linkedBotInputs =
      previousLinkedSniperBlocks.length > 0
        ? await Promise.all(
            previousLinkedSniperBlocks.map((linkedBot) => {
              const linkedSniper = linkedSnipers.find((t) =>
                'sniperId' in t
                  ? t.sniperId === linkedBot.options?.sniperId
                  : t.id === linkedBot.options?.sniperId
              )
              if (!linkedSniper) return []
              return extractLinkedInputBlocks(linkedSniper, linkedSnipers)(
                linkedBot.options?.groupId,
                'forward'
              )
            })
          )
        : []

    return (
      walkEdgesAndExtract(
        'input',
        direction,
        sniper
      )({
        groupId: currentGroupId,
      }) as InputBlock[]
    ).concat(linkedBotInputs.flatMap((l) => l))
  }

const parseResultSample = (
  inputBlocks: InputBlock[],
  headerCells: ResultHeaderCell[],
  variables: Variable[],
  userEmail?: string
) =>
  headerCells.reduce<Record<string, string | (string | null)[] | undefined>>(
    (resultSample, cell) => {
      const inputBlock = inputBlocks.find((inputBlock) =>
        cell.blocks?.some((block) => block.id === inputBlock.id)
      )
      if (isNotDefined(inputBlock)) {
        if (cell.variableIds) {
          const variableValue = variables.find(
            (variable) =>
              cell.variableIds?.includes(variable.id) && variable.value
          )?.value
          return {
            ...resultSample,
            [cell.label]: variableValue ?? 'content',
          }
        }

        return resultSample
      }
      const variableValue = variables.find(
        (variable) => cell.variableIds?.includes(variable.id) && variable.value
      )?.value
      const value = variableValue ?? getSampleValue(inputBlock, userEmail)
      return {
        ...resultSample,
        [cell.label]: value,
      }
    },
    {}
  )

const getSampleValue = (block: InputBlock, userEmail?: string): string => {
  switch (block.type) {
    case InputBlockType.CHOICE:
      return block.options?.isMultipleChoice
        ? block.items.map((item) => item.content).join(', ')
        : block.items[0]?.content ?? 'Item'
    case InputBlockType.DATE:
      return new Date().toUTCString()
    case InputBlockType.EMAIL:
      return userEmail ?? 'test@email.com'
    case InputBlockType.NUMBER:
      return '20'
    case InputBlockType.PHONE:
      return '+33665566773'
    case InputBlockType.TEXT:
      return 'answer value'
    case InputBlockType.URL:
      return 'https://test.com'
    case InputBlockType.FILE:
      return 'https://domain.com/fake-file.png'
    case InputBlockType.RATING:
      return '8'
    case InputBlockType.PAYMENT:
      return 'Success'
    case InputBlockType.PICTURE_CHOICE:
      return block.options?.isMultipleChoice
        ? block.items.map((item) => item.title ?? item.pictureSrc).join(', ')
        : block.items[0]?.title ?? block.items[0]?.pictureSrc ?? 'Item'
  }
}

const walkEdgesAndExtract =
  (
    type: 'input' | 'linkedBot',
    direction: 'backward' | 'forward',
    sniper: Pick<Sniper | PublicSniper, 'groups' | 'variables' | 'edges'>
  ) =>
  ({ groupId }: { groupId?: string }): Block[] => {
    const currentGroupId =
      groupId ??
      (sniper.groups.find((b) => b.blocks[0].type === 'start')?.id as string)
    const blocksInGroup = extractBlocksInGroup(
      type,
      sniper
    )({
      groupId: currentGroupId,
    })
    const otherGroupIds = getGroupIds(sniper, direction)(currentGroupId)
    return [
      ...blocksInGroup,
      ...otherGroupIds.flatMap((groupId) =>
        extractBlocksInGroup(type, sniper)({ groupId })
      ),
    ]
  }

const getGroupIds =
  (
    sniper: Pick<Sniper | PublicSniper, 'groups' | 'variables' | 'edges'>,
    direction: 'backward' | 'forward',
    existingGroupIds?: string[]
  ) =>
  (groupId: string): string[] => {
    const groups = sniper.edges.reduce<string[]>((groupIds, edge) => {
      const fromGroupId = sniper.groups.find((g) =>
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
      groups.flatMap(getGroupIds(sniper, direction, newGroups))
    )
  }

const extractBlocksInGroup =
  (
    type: 'input' | 'linkedBot',
    sniper: Pick<Sniper | PublicSniper, 'groups' | 'variables' | 'edges'>
  ) =>
  ({ groupId, blockId }: { groupId: string; blockId?: string }) => {
    const currentGroup = sniper.groups.find(byId(groupId))
    if (!currentGroup) return []
    const blocks: Block[] = []
    for (const block of currentGroup.blocks) {
      if (block.id === blockId) break
      if (type === 'input' && isInputBlock(block)) blocks.push(block)
      if (type === 'linkedBot' && block.type === LogicBlockType.SNIPER_LINK)
        blocks.push(block)
    }
    return blocks
  }
