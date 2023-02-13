import {
  Group,
  Variable,
  InputBlock,
  ResultHeaderCell,
  Answer,
  VariableWithValue,
  Typebot,
  ResultWithAnswersInput,
} from 'models'
import { isInputBlock, isDefined, byId } from './utils'

export const parseResultHeader = (
  typebot: Pick<Typebot, 'groups' | 'variables'>,
  linkedTypebots: Pick<Typebot, 'groups' | 'variables'>[] | undefined
): ResultHeaderCell[] => {
  const parsedGroups = [
    ...typebot.groups,
    ...(linkedTypebots ?? []).flatMap((linkedTypebot) => linkedTypebot.groups),
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
        }))
      )
      .filter((block) => isInputBlock(block)) as (InputBlock & {
      groupTitle: string
    })[]
  ).reduce<ResultHeaderCellWithBlock[]>((existingHeaders, inputBlock) => {
    if (
      existingHeaders.some(
        (existingHeader) =>
          inputBlock.options.variableId &&
          existingHeader.variableIds?.includes(inputBlock.options.variableId)
      )
    )
      return existingHeaders
    const matchedVariableName =
      inputBlock.options.variableId &&
      variables.find(byId(inputBlock.options.variableId))?.name

    let label = matchedVariableName ?? inputBlock.groupTitle
    const existingHeader = existingHeaders.find((h) => h.label === label)
    if (existingHeader) {
      if (
        existingHeader.blocks?.some(
          (block) => block.groupId === inputBlock.groupId
        )
      ) {
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
          variableIds: inputBlock.options.variableId
            ? [inputBlock.options.variableId]
            : undefined,
        }
        return [...existingHeaders, newHeaderCell]
      }
      const updatedHeaderCell: ResultHeaderCellWithBlock = {
        ...existingHeader,
        variableIds:
          existingHeader.variableIds && inputBlock.options.variableId
            ? existingHeader.variableIds.concat([inputBlock.options.variableId])
            : undefined,
        blocks: existingHeader.blocks.concat({
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
      variableIds: inputBlock.options.variableId
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
      )
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

export const parseAnswers =
  (
    typebot: Pick<Typebot, 'groups' | 'variables'>,
    linkedTypebots: Pick<Typebot, 'groups' | 'variables'>[] | undefined
  ) =>
  ({
    createdAt,
    answers,
    variables: resultVariables,
  }: Pick<ResultWithAnswersInput, 'answers' | 'variables'> & {
    // TODO: remove once we are using 100% tRPC
    createdAt: Date | string
  }): {
    [key: string]: string
  } => {
    const header = parseResultHeader(typebot, linkedTypebots)
    return {
      submittedAt:
        typeof createdAt === 'string' ? createdAt : createdAt.toISOString(),
      ...[...answers, ...resultVariables].reduce<{
        [key: string]: string
      }>((o, answerOrVariable) => {
        const isVariable = !('blockId' in answerOrVariable)
        if (isVariable) {
          const variable = answerOrVariable as VariableWithValue
          if (variable.value === null) return o
          return { ...o, [variable.name]: variable.value }
        }
        const answer = answerOrVariable as Answer
        const key = answer.variableId
          ? header.find(
              (cell) =>
                answer.variableId &&
                cell.variableIds?.includes(answer.variableId)
            )?.label
          : header.find((cell) =>
              cell.blocks?.some((block) => block.id === answer.blockId)
            )?.label
        if (!key) return o
        if (isDefined(o[key])) return o
        return {
          ...o,
          [key]: answer.content.toString(),
        }
      }, {}),
    }
  }
