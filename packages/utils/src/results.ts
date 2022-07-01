import {
  Group,
  Variable,
  InputBlock,
  ResultHeaderCell,
  ResultWithAnswers,
  Answer,
  VariableWithValue,
} from 'models'
import { isInputBlock, isDefined, byId } from './utils'

export const parseResultHeader = ({
  groups,
  variables,
}: {
  groups: Group[]
  variables: Variable[]
}): ResultHeaderCell[] => {
  const parsedGroups = parseInputsResultHeader({ groups, variables })
  return [
    { label: 'Submitted at', id: 'date' },
    ...parsedGroups,
    ...parseVariablesHeaders(variables, parsedGroups),
  ]
}

const parseInputsResultHeader = ({
  groups,
  variables,
}: {
  groups: Group[]
  variables: Variable[]
}): ResultHeaderCell[] =>
  (
    groups
      .flatMap((g) =>
        g.blocks.map((s) => ({
          ...s,
          blockTitle: g.title,
        }))
      )
      .filter((block) => isInputBlock(block)) as (InputBlock & {
      blockTitle: string
    })[]
  ).reduce<ResultHeaderCell[]>((headers, inputBlock) => {
    if (
      headers.find(
        (h) =>
          isDefined(h.variableId) &&
          h.variableId ===
            variables.find(byId(inputBlock.options.variableId))?.id
      )
    )
      return headers
    const matchedVariableName =
      inputBlock.options.variableId &&
      variables.find(byId(inputBlock.options.variableId))?.name

    let label = matchedVariableName ?? inputBlock.blockTitle
    const totalPrevious = headers.filter((h) => h.label.includes(label)).length
    if (totalPrevious > 0) label = label + ` (${totalPrevious})`
    return [
      ...headers,
      {
        id: inputBlock.id,
        blockType: inputBlock.type,
        blockId: inputBlock.id,
        variableId: inputBlock.options.variableId,
        label,
        isLong: 'isLong' in inputBlock.options && inputBlock.options.isLong,
      },
    ]
  }, [])

const parseVariablesHeaders = (
  variables: Variable[],
  blockResultHeader: ResultHeaderCell[]
) =>
  variables.reduce<ResultHeaderCell[]>((headers, v) => {
    if (blockResultHeader.find((h) => h.variableId === v.id)) return headers
    return [
      ...headers,
      {
        id: v.id,
        label: v.name,
        variableId: v.id,
      },
    ]
  }, [])

export const parseAnswers =
  ({ groups, variables }: { groups: Group[]; variables: Variable[] }) =>
  ({
    createdAt,
    answers,
    variables: resultVariables,
  }: Pick<ResultWithAnswers, 'createdAt' | 'answers' | 'variables'>): {
    [key: string]: string
  } => {
    const header = parseResultHeader({ groups, variables })
    return {
      submittedAt: createdAt,
      ...[...answers, ...resultVariables].reduce<{
        [key: string]: string
      }>((o, answerOrVariable) => {
        if ('blockId' in answerOrVariable) {
          const answer = answerOrVariable as Answer
          const key = answer.variableId
            ? header.find((cell) => cell.variableId === answer.variableId)
                ?.label
            : header.find((cell) => cell.blockId === answer.blockId)?.label
          if (!key) return o
          return {
            ...o,
            [key]: answer.content.toString(),
          }
        }
        const variable = answerOrVariable as VariableWithValue
        if (isDefined(o[variable.name])) return o
        return { ...o, [variable.name]: variable.value }
      }, {}),
    }
  }
