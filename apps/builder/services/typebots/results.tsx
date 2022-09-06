import { ResultWithAnswers, VariableWithValue, ResultHeaderCell } from 'models'
import useSWRInfinite from 'swr/infinite'
import { stringify } from 'qs'
import { Answer } from 'model'
import { isDefined, sendRequest } from 'utils'
import { fetcher } from 'services/utils'
import { HStack, Text } from '@chakra-ui/react'
import { CodeIcon, CalendarIcon } from 'assets/icons'
import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'

const paginationLimit = 50

const getKey = (
  typebotId: string,
  pageIndex: number,
  previousPageData: {
    results: ResultWithAnswers[]
  }
) => {
  if (previousPageData && previousPageData.results.length === 0) return null
  if (pageIndex === 0) return `${process.env.BASE_PATH || ''}/api/typebots/${typebotId}/results?limit=50`
  return `${process.env.BASE_PATH || ''}/api/typebots/${typebotId}/results?lastResultId=${
    previousPageData.results[previousPageData.results.length - 1].id
  }&limit=${paginationLimit}`
}

export const useResults = ({
  typebotId,
  onError,
}: {
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
    ) => getKey(typebotId, pageIndex, previousPageData),
    fetcher,
    { revalidateAll: true }
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
    url: `${process.env.BASE_PATH || ''}/api/typebots/${typebotId}/results?${params}`,
    method: 'DELETE',
  })
}

export const deleteAllResults = async (typebotId: string) =>
  sendRequest({
    url: `${process.env.BASE_PATH || ''}/api/typebots/${typebotId}/results`,
    method: 'DELETE',
  })

export const getAllResults = async (typebotId: string) => {
  const results = []
  let hasMore = true
  let lastResultId: string | undefined = undefined
  do {
    const query = stringify({ limit: 200, lastResultId })
    const { data } = await sendRequest<{ results: ResultWithAnswers[] }>({
      url: `${process.env.BASE_PATH || ''}/api/typebots/${typebotId}/results?${query}`,
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
  header.stepType ? (
    <StepIcon type={header.stepType} />
  ) : header.variableId ? (
    <CodeIcon />
  ) : (
    <CalendarIcon />
  )

export const convertResultsToTableData = (
  results: ResultWithAnswers[] | undefined,
  header: ResultHeaderCell[]
): { [key: string]: string }[] =>
  (results ?? []).map((result) => ({
    'Submitted at': parseDateToReadable(result.createdAt),
    ...[...result.answers, ...result.variables].reduce<{
      [key: string]: string
    }>((o, answerOrVariable) => {
      if ('blockId' in answerOrVariable) {
        const answer = answerOrVariable as Answer
        const key = answer.variableId
          ? header.find((h) => h.variableId === answer.variableId)?.label
          : header.find((h) => h.stepId === answer.stepId)?.label
        if (!key) return o
        return {
          ...o,
          [key]: answer.content,
        }
      }
      const variable = answerOrVariable as VariableWithValue
      if (isDefined(o[variable.id])) return o
      const key = header.find((h) => h.variableId === variable.id)?.label
      if (!key) return o
      return { ...o, [key]: variable.value }
    }, {}),
  }))
