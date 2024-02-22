import {
  ResultWithAnswers,
  ResultHeaderCell,
  VariableWithValue,
  Answer,
  TableData,
} from '@typebot.io/schemas'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { isDefined } from '../utils'

type CellParser = (
  content: VariableWithValue['value'],
  blockType?: InputBlockType
) => { element?: React.JSX.Element; plainText: string }

const defaultCellParser: CellParser = (content, blockType) => {
  if (!content) return { plainText: '' }
  if (Array.isArray(content))
    return {
      plainText: content.join(', '),
    }
  return blockType === InputBlockType.FILE
    ? { plainText: content }
    : { plainText: content.toString() }
}

export const convertResultsToTableData = (
  results: ResultWithAnswers[] | undefined,
  headerCells: ResultHeaderCell[],
  cellParser: CellParser = defaultCellParser
): TableData[] =>
  (results ?? []).map((result) => ({
    id: { plainText: result.id },
    date: {
      plainText: convertDateToReadable(result.createdAt),
    },
    ...[...result.answers, ...result.variables].reduce<{
      [key: string]: { element?: JSX.Element; plainText: string }
    }>((tableData, answerOrVariable) => {
      if ('groupId' in answerOrVariable) {
        const answer = answerOrVariable satisfies Answer
        const header = answer.variableId
          ? headerCells.find((headerCell) =>
              headerCell.variableIds?.includes(answer.variableId as string)
            )
          : headerCells.find((headerCell) =>
              headerCell.blocks?.some((block) => block.id === answer.blockId)
            )
        if (!header || !header.blocks || !header.blockType) return tableData
        const variableValue = result.variables.find(
          (variable) => variable.id === answer.variableId
        )?.value
        const content = variableValue ?? answer.content
        return {
          ...tableData,
          [header.id]: cellParser(content, header.blockType),
        }
      }
      const variable = answerOrVariable satisfies VariableWithValue
      if (variable.value === null) return tableData
      const headerId = headerCells.find((headerCell) =>
        headerCell.variableIds?.includes(variable.id)
      )?.id
      if (!headerId) return tableData
      if (isDefined(tableData[headerId])) return tableData
      return {
        ...tableData,
        [headerId]: cellParser(variable.value),
      }
    }, {}),
  }))

const convertDateToReadable = (date: Date): string =>
  date.toDateString().split(' ').slice(1, 3).join(' ') +
  ', ' +
  date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
