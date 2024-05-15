import {
  ResultWithAnswers,
  ResultHeaderCell,
  Group,
  Variable,
  InputBlock,
  Typebot,
} from '@typebot.io/schemas'
import { isInputBlock } from '@typebot.io/schemas/helpers'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { byId, isNotEmpty } from '@typebot.io/lib/utils'

export const parseResultHeader = (
  typebot: Pick<Typebot, 'groups' | 'variables'>,
  linkedTypebots: Pick<Typebot, 'groups' | 'variables'>[] | undefined,
  results?: ResultWithAnswers[]
): ResultHeaderCell[] => {
  const parsedGroups = [
    ...typebot.groups,
    ...(linkedTypebots ?? []).flatMap(
      (linkedTypebot) => linkedTypebot.groups as Group[]
    ),
  ]
  const parsedVariables = [
    ...typebot.variables,
    ...(linkedTypebots ?? []).flatMap(
      (linkedTypebot) => linkedTypebot.variables
    ),
  ]
  const inputsResultHeader = parseInputsResultHeader({
    groups: parsedGroups,
    variables: parsedVariables,
  })
  return [
    { label: 'Submitted at', id: 'date' },
    ...inputsResultHeader,
    ...parseVariablesHeaders(parsedVariables, inputsResultHeader),
    ...parseResultsFromPreviousBotVersions({
      results: results ?? [],
      existingInputResultHeaders: inputsResultHeader,
      groups: parsedGroups,
    }),
  ]
}

type ResultHeaderCellWithBlock = Omit<ResultHeaderCell, 'blocks'> & {
  blocks: NonNullable<ResultHeaderCell['blocks']>
}

const parseInputsResultHeader = ({
  groups,
  variables,
}: {
  groups: Group[]
  variables: Variable[]
}): ResultHeaderCellWithBlock[] =>
  (
    groups
      .flatMap((group) =>
        group.blocks.map((block) => ({
          ...block,
          groupTitle: group.title,
          groupId: group.id,
        }))
      )
      .filter((block) => isInputBlock(block)) as (InputBlock & {
      groupId: string
      groupTitle: string
    })[]
  ).reduce<ResultHeaderCellWithBlock[]>((existingHeaders, inputBlock) => {
    if (
      existingHeaders.some(
        (existingHeader) =>
          inputBlock.options?.variableId &&
          existingHeader.variableIds?.includes(inputBlock.options.variableId)
      )
    )
      return existingHeaders
    const matchedVariableName =
      inputBlock.options?.variableId &&
      variables.find(byId(inputBlock.options.variableId))?.name

    let label = matchedVariableName ?? inputBlock.groupTitle
    const headerWithSameLabel = existingHeaders.find((h) => h.label === label)
    if (headerWithSameLabel) {
      const shouldMerge = headerWithSameLabel.blocks?.some(
        (block) => block.id === inputBlock.id
      )
      if (shouldMerge) {
        const updatedHeaderCell: ResultHeaderCellWithBlock = {
          ...headerWithSameLabel,
          variableIds:
            headerWithSameLabel.variableIds && inputBlock.options?.variableId
              ? headerWithSameLabel.variableIds.concat([
                  inputBlock.options.variableId,
                ])
              : undefined,
          blocks: headerWithSameLabel.blocks.concat({
            id: inputBlock.id,
            groupId: inputBlock.groupId,
          }),
        }
        return [
          ...existingHeaders.filter(
            (existingHeader) => existingHeader.label !== label
          ),
          updatedHeaderCell,
        ]
      }
      const totalPrevious = existingHeaders.filter((h) =>
        h.label.includes(label)
      ).length
      const newHeaderCell: ResultHeaderCellWithBlock = {
        id: inputBlock.id,
        label: label + ` (${totalPrevious})`,
        blocks: [
          {
            id: inputBlock.id,
            groupId: inputBlock.groupId,
          },
        ],
        blockType: inputBlock.type,
        variableIds: inputBlock.options?.variableId
          ? [inputBlock.options.variableId]
          : undefined,
      }
      return [...existingHeaders, newHeaderCell]
    }

    const newHeaderCell: ResultHeaderCellWithBlock = {
      id: inputBlock.id,
      label,
      blocks: [
        {
          id: inputBlock.id,
          groupId: inputBlock.groupId,
        },
      ],
      blockType: inputBlock.type,
      variableIds: inputBlock.options?.variableId
        ? [inputBlock.options.variableId]
        : undefined,
    }

    return [...existingHeaders, newHeaderCell]
  }, [])

const parseVariablesHeaders = (
  variables: Variable[],
  existingInputResultHeaders: ResultHeaderCell[]
) =>
  variables.reduce<ResultHeaderCell[]>((existingHeaders, variable) => {
    if (
      existingInputResultHeaders.some((existingInputResultHeader) =>
        existingInputResultHeader.variableIds?.includes(variable.id)
      ) ||
      variable.isSessionVariable
    )
      return existingHeaders

    const headerCellWithSameLabel = existingHeaders.find(
      (existingHeader) => existingHeader.label === variable.name
    )
    if (headerCellWithSameLabel) {
      const updatedHeaderCell: ResultHeaderCell = {
        ...headerCellWithSameLabel,
        variableIds: headerCellWithSameLabel.variableIds?.concat([variable.id]),
      }
      return [
        ...existingHeaders.filter((h) => h.label !== variable.name),
        updatedHeaderCell,
      ]
    }
    const newHeaderCell: ResultHeaderCell = {
      id: variable.id,
      label: variable.name,
      variableIds: [variable.id],
    }

    return [...existingHeaders, newHeaderCell]
  }, [])

const parseResultsFromPreviousBotVersions = ({
  results,
  existingInputResultHeaders,
  groups,
}: {
  results: ResultWithAnswers[]
  existingInputResultHeaders: ResultHeaderCell[]
  groups: Group[]
}): ResultHeaderCell[] =>
  results
    .flatMap((result) => result.answers)
    .filter(
      (answer) =>
        existingInputResultHeaders.every(
          (header) => header.id !== answer.blockId
        ) && isNotEmpty(answer.content)
    )
    .reduce<ResultHeaderCell[]>((existingHeaders, answer) => {
      if (
        existingHeaders.some(
          (existingHeader) => existingHeader.id === answer.blockId
        )
      )
        return existingHeaders
      const groupId =
        groups.find((group) =>
          group.blocks.some((block) => block.id === answer.blockId)
        )?.id ?? ''
      return [
        ...existingHeaders,
        {
          id: answer.blockId,
          label: `${answer.blockId} (deleted block)`,
          blocks: [
            {
              id: answer.blockId,
              groupId,
            },
          ],
          blockType: InputBlockType.TEXT,
        },
      ]
    }, [])
