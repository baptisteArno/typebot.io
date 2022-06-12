import {
  ResultWithAnswers,
  VariableWithValue,
  ResultHeaderCell,
  InputBlockType,
} from 'models'
import useSWRInfinite from 'swr/infinite'
import { stringify } from 'qs'
import { Answer } from 'db'
import { isDefined, isEmpty, sendRequest } from 'utils'
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
  onError: (error: Error) => void
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
      dedupingInterval: isEmpty(process.env.NEXT_PUBLIC_E2E_TEST)
        ? undefined
        : 0,
    }
  )

  if (error) onError(error)
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

export const deleteResults = async (typebotId: string, ids: string[]) => {
  const params = stringify(
    {
      ids,
    },
    { indices: false }
  )
  return sendRequest({
    url: `/api/typebots/${typebotId}/results?${params}`,
    method: 'DELETE',
  })
}

export const deleteAllResults = async (typebotId: string) =>
  sendRequest({
    url: `/api/typebots/${typebotId}/results`,
    method: 'DELETE',
  })

export const getAllResults = async (workspaceId: string, typebotId: string) => {
  const results = []
  let hasMore = true
  let lastResultId: string | undefined = undefined
  do {
    const query = stringify({ limit: 200, lastResultId, workspaceId })
    const { data } = await sendRequest<{ results: ResultWithAnswers[] }>({
      url: `/api/typebots/${typebotId}/results?${query}`,
      method: 'GET',
    })
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
      <HStack minW={header.isLong ? '400px' : '150px'} maxW="500px">
        <HeaderIcon header={header} />
        <Text>{header.label}</Text>
      </HStack>
    ),
    accessor: header.label,
  }))

const HeaderIcon = ({ header }: { header: ResultHeaderCell }) =>
  header.blockType ? (
    <BlockIcon type={header.blockType} />
  ) : header.variableId ? (
    <CodeIcon />
  ) : (
    <CalendarIcon />
  )

export const convertResultsToTableData = (
  results: ResultWithAnswers[] | undefined,
  headerCells: ResultHeaderCell[]
): { [key: string]: JSX.Element | string }[] =>
  (results ?? []).map((result) => ({
    'Submitted at': parseDateToReadable(result.createdAt),
    ...[...result.answers, ...result.variables].reduce<{
      [key: string]: JSX.Element | string
    }>((o, answerOrVariable) => {
      if ('groupId' in answerOrVariable) {
        const answer = answerOrVariable as Answer
        const header = answer.variableId
          ? headerCells.find((h) => h.variableId === answer.variableId)
          : headerCells.find((h) => h.blockId === answer.blockId)
        if (!header || !header.blockId || !header.blockType) return o
        return {
          ...o,
          [header.label]: parseContent(answer.content, header.blockType),
        }
      }
      const variable = answerOrVariable as VariableWithValue
      if (isDefined(o[variable.id])) return o
      const key = headerCells.find((h) => h.variableId === variable.id)?.label
      if (!key) return o
      return { ...o, [key]: variable.value }
    }, {}),
  }))

const parseContent = (str: string, blockType: InputBlockType) =>
  blockType === InputBlockType.FILE ? parseFileContent(str) : str

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
