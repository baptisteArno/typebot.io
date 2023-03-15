import { isDefined } from '@typebot.io/lib'
import { Answer } from '@typebot.io/prisma'
import {
  ResultWithAnswers,
  ResultHeaderCell,
  VariableWithValue,
  InputBlockType,
} from '@typebot.io/schemas'
import { FileLinks } from '../components/FileLinks'
import { TableData } from '../types'
import { convertDateToReadable } from './convertDateToReadable'
import { parseAccessor } from './parseAccessor'

export const convertResultsToTableData = (
  results: ResultWithAnswers[] | undefined,
  headerCells: ResultHeaderCell[]
): TableData[] =>
  (results ?? []).map((result) => ({
    id: { plainText: result.id },
    'Submitted at': {
      plainText: convertDateToReadable(result.createdAt),
    },
    ...[...result.answers, ...result.variables].reduce<{
      [key: string]: { element?: JSX.Element; plainText: string }
    }>((o, answerOrVariable) => {
      if ('groupId' in answerOrVariable) {
        const answer = answerOrVariable as Answer
        const header = answer.variableId
          ? headerCells.find((headerCell) =>
              headerCell.variableIds?.includes(answer.variableId as string)
            )
          : headerCells.find((headerCell) =>
              headerCell.blocks?.some((block) => block.id === answer.blockId)
            )
        if (!header || !header.blocks || !header.blockType) return o
        return {
          ...o,
          [parseAccessor(header.label)]: {
            element: parseContent(answer.content, header.blockType),
            plainText: answer.content,
          },
        }
      }
      const variable = answerOrVariable as VariableWithValue
      if (variable.value === null) return o
      const key = headerCells.find((headerCell) =>
        headerCell.variableIds?.includes(variable.id)
      )?.label
      if (!key) return o
      if (isDefined(o[key])) return o
      return {
        ...o,
        [parseAccessor(key)]: { plainText: variable.value?.toString() },
      }
    }, {}),
  }))

const parseContent = (
  str: string,
  blockType: InputBlockType
): JSX.Element | undefined =>
  blockType === InputBlockType.FILE ? (
    <FileLinks fileNamesStr={str} />
  ) : undefined
