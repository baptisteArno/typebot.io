import {
  ResultWithAnswers,
  VariableWithValue,
  ResultHeaderCell,
  InputBlockType,
} from '@typebot.io/schemas'
import { Answer } from '@typebot.io/prisma'
import { isDefined } from '@typebot.io/lib'
import { HStack, Wrap, WrapItem, Text } from '@chakra-ui/react'
import { BlockIcon } from '@/features/editor'
import { HeaderCell, TableData } from './types'
import { CodeIcon, CalendarIcon, FileIcon } from '@/components/icons'
import { TextLink } from '@/components/TextLink'

export const parseDateToReadable = (date: Date): string =>
  date.toDateString().split(' ').slice(1, 3).join(' ') +
  ', ' +
  date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

export const parseAccessor = (label: string) => label.replaceAll('.', '')

export const parseHeaderCells = (
  resultHeader: ResultHeaderCell[]
): HeaderCell[] =>
  resultHeader.map((header) => ({
    Header: (
      <HStack minW="150px" maxW="500px">
        <HeaderIcon header={header} />
        <Text>{header.label}</Text>
      </HStack>
    ),
    accessor: parseAccessor(header.label),
  }))

export const HeaderIcon = ({ header }: { header: ResultHeaderCell }) =>
  header.blockType ? (
    <BlockIcon type={header.blockType} />
  ) : header.variableIds ? (
    <CodeIcon />
  ) : (
    <CalendarIcon />
  )

export const convertResultsToTableData = (
  results: ResultWithAnswers[] | undefined,
  headerCells: ResultHeaderCell[]
): TableData[] =>
  (results ?? []).map((result) => ({
    id: { plainText: result.id },
    'Submitted at': {
      plainText: parseDateToReadable(result.createdAt),
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
  blockType === InputBlockType.FILE ? parseFileContent(str) : undefined

const parseFileContent = (str: string) => {
  const fileNames = str.split(', ')
  return (
    <Wrap maxW="300px">
      {fileNames.map((name) => (
        <HStack as={WrapItem} key={name}>
          <FileIcon />
          <TextLink href={name} isExternal>
            {name.split('/').pop()}
          </TextLink>
        </HStack>
      ))}
    </Wrap>
  )
}
