import {
  ResultWithAnswers,
  VariableWithValue,
  ResultHeaderCell,
  InputBlockType,
} from 'models'
import useSWRInfinite from 'swr/infinite'
import { stringify } from 'qs'
import { Answer } from 'db'
import { env, isDefined, sendRequest } from 'utils'
import { fetcher } from 'services/utils'
import { HStack, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { CodeIcon, CalendarIcon, FileIcon } from 'assets/icons'
import { Link } from '@chakra-ui/react'
import { BlockIcon } from 'components/editor/BlocksSideBar/BlockIcon'

const paginationLimit = 50

const getKey = (
  workspaceId: string,
  typebotId: string,
  pageIndex: number,
  previousPageData: {
    results: ResultWithAnswers[]
  }
) => {
  if (previousPageData && previousPageData.results.length === 0) return null
  if (pageIndex === 0)
    return `/api/typebots/${typebotId}/results?limit=50&workspaceId=${workspaceId}`
  return `/api/typebots/${typebotId}/results?lastResultId=${
    previousPageData.results[previousPageData.results.length - 1].id
  }&limit=${paginationLimit}&workspaceId=${workspaceId}`
}

export const useResults = ({
  workspaceId,
  typebotId,
  onError,
}: {
  workspaceId: string
  typebotId: string
  onError?: (error: Error) => void
}) => {
  const { data, error, mutate, setSize, size, isValidating } = useSWRInfinite<
    { results: ResultWithAnswers[] },
    Error
  >(
    (
      pageIndex: number,
      previousPageData: {
        results: ResultWithAnswers[]
      }
    ) => getKey(workspaceId, typebotId, pageIndex, previousPageData),
    fetcher,
    {
      revalidateAll: true,
      dedupingInterval: env('E2E_TEST') === 'true' ? 0 : undefined,
    }
  )

  if (error && onError) onError(error)
  return {
    data,
    isLoading: !error && !data,
    mutate,
    setSize,
    size,
    hasMore:
      isValidating ||
      (data &&
        data.length > 0 &&
        data[data.length - 1].results.length > 0 &&
        data.length === paginationLimit),
  }
}

export const deleteResults = async (
  workspaceId: string,
  typebotId: string,
  ids: string[]
) => {
  const params = stringify({
    workspaceId,
  })
  return sendRequest({
    url: `/api/typebots/${typebotId}/results?${params}`,
    method: 'DELETE',
    body: {
      ids,
    },
  })
}

export const getAllResults = async (workspaceId: string, typebotId: string) => {
  const results = []
  let hasMore = true
  let lastResultId: string | undefined = undefined
  do {
    const query = stringify({ limit: 200, lastResultId, workspaceId })
    const { data, error } = await sendRequest<{ results: ResultWithAnswers[] }>(
      {
        url: `/api/typebots/${typebotId}/results?${query}`,
        method: 'GET',
      }
    )
    if (error) {
      console.error(error)
      break
    }
    results.push(...(data?.results ?? []))
    lastResultId = results[results.length - 1]?.id as string | undefined
    if (data?.results.length === 0) hasMore = false
  } while (hasMore)
  return results
}

export const parseDateToReadable = (dateStr: string): string => {
  const date = new Date(dateStr)
  return (
    date.toDateString().split(' ').slice(1, 3).join(' ') +
    ', ' +
    date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  )
}

type HeaderCell = {
  Header: JSX.Element
  accessor: string
}

export const parseSubmissionsColumns = (
  resultHeader: ResultHeaderCell[]
): HeaderCell[] =>
  resultHeader.map((header) => ({
    Header: (
      <HStack minW="150px" maxW="500px">
        <HeaderIcon header={header} />
        <Text>{header.label}</Text>
      </HStack>
    ),
    accessor: header.label,
  }))

export const HeaderIcon = ({ header }: { header: ResultHeaderCell }) =>
  header.blockType ? (
    <BlockIcon type={header.blockType} />
  ) : header.variableIds ? (
    <CodeIcon />
  ) : (
    <CalendarIcon />
  )

export type CellValueType = { element?: JSX.Element; plainText: string }

export type TableData = {
  id: Pick<CellValueType, 'plainText'>
} & Record<string, CellValueType>

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
          [header.label]: {
            element: parseContent(answer.content, header.blockType),
            plainText: answer.content,
          },
        }
      }
      const variable = answerOrVariable as VariableWithValue
      const key = headerCells.find((headerCell) =>
        headerCell.variableIds?.includes(variable.id)
      )?.label
      if (!key) return o
      if (isDefined(o[key])) return o
      return {
        ...o,
        [key]: { plainText: variable.value?.toString() },
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
          <Link href={name} isExternal color="blue.500">
            {name.split('/').pop()}
          </Link>
        </HStack>
      ))}
    </Wrap>
  )
}
