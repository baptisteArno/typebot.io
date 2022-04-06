import {
  Block,
  Variable,
  InputStep,
  ResultHeaderCell,
  ResultWithAnswers,
  Answer,
  VariableWithValue,
} from 'models'
import { isInputStep, isDefined, byId } from './utils'

export const parseResultHeader = ({
  blocks,
  variables,
}: {
  blocks: Block[]
  variables: Variable[]
}): ResultHeaderCell[] => {
  const parsedBlocks = parseInputsResultHeader({ blocks, variables })
  return [
    { label: 'Submitted at' },
    ...parsedBlocks,
    ...parseVariablesHeaders(variables, parsedBlocks),
  ]
}

const parseInputsResultHeader = ({
  blocks,
  variables,
}: {
  blocks: Block[]
  variables: Variable[]
}): ResultHeaderCell[] =>
  (
    blocks
      .flatMap((b) =>
        b.steps.map((s) => ({
          ...s,
          blockTitle: b.title,
        }))
      )
      .filter((step) => isInputStep(step)) as (InputStep & {
      blockTitle: string
    })[]
  ).reduce<ResultHeaderCell[]>((headers, inputStep) => {
    if (
      headers.find(
        (h) =>
          isDefined(h.variableId) &&
          h.variableId ===
            variables.find(byId(inputStep.options.variableId))?.id
      )
    )
      return headers
    const matchedVariableName =
      inputStep.options.variableId &&
      variables.find(byId(inputStep.options.variableId))?.name

    let label = matchedVariableName ?? inputStep.blockTitle
    const totalPrevious = headers.filter((h) => h.label.includes(label)).length
    if (totalPrevious > 0) label = label + ` (${totalPrevious})`
    return [
      ...headers,
      {
        stepType: inputStep.type,
        stepId: inputStep.id,
        variableId: inputStep.options.variableId,
        label,
        isLong: 'isLong' in inputStep.options && inputStep.options.isLong,
      },
    ]
  }, [])

const parseVariablesHeaders = (
  variables: Variable[],
  stepResultHeader: ResultHeaderCell[]
) =>
  variables.reduce<ResultHeaderCell[]>((headers, v) => {
    if (stepResultHeader.find((h) => h.variableId === v.id)) return headers
    return [
      ...headers,
      {
        label: v.name,
        variableId: v.id,
      },
    ]
  }, [])

export const parseAnswers =
  ({ blocks, variables }: { blocks: Block[]; variables: Variable[] }) =>
  ({
    createdAt,
    answers,
    variables: resultVariables,
  }: Pick<ResultWithAnswers, 'createdAt' | 'answers' | 'variables'>): {
    [key: string]: string
  } => {
    const header = parseResultHeader({ blocks, variables })
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
            : header.find((cell) => cell.stepId === answer.stepId)?.label
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
