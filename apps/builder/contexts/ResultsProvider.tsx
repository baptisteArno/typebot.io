import { ResultHeaderCell, ResultWithAnswers } from 'models'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import {
  convertResultsToTableData,
  TableData,
  useResults as useFetchResults,
} from 'services/typebots/results'
import { KeyedMutator } from 'swr'
import { isDefined, parseResultHeader } from 'utils'
import { useTypebot } from './TypebotContext'

const resultsContext = createContext<{
  resultsList: { results: ResultWithAnswers[] }[] | undefined
  flatResults: ResultWithAnswers[]
  hasMore: boolean
  resultHeader: ResultHeaderCell[]
  totalResults: number
  totalHiddenResults?: number
  tableData: TableData[]
  onDeleteResults: (totalResultsDeleted: number) => void
  fetchMore: () => void
  mutate: KeyedMutator<
    {
      results: ResultWithAnswers[]
    }[]
  >
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const ResultsProvider = ({
  children,
  workspaceId,
  typebotId,
  totalResults,
  totalHiddenResults,
  onDeleteResults,
}: {
  children: ReactNode
  workspaceId: string
  typebotId: string
  totalResults: number
  totalHiddenResults?: number
  onDeleteResults: (totalResultsDeleted: number) => void
}) => {
  const { publishedTypebot, linkedTypebots } = useTypebot()
  const { data, mutate, setSize, hasMore } = useFetchResults({
    workspaceId,
    typebotId,
  })

  const fetchMore = () => setSize((state) => state + 1)

  const groupsAndVariables = {
    groups: [
      ...(publishedTypebot?.groups ?? []),
      ...(linkedTypebots?.flatMap((t) => t.groups) ?? []),
    ].filter(isDefined),
    variables: [
      ...(publishedTypebot?.variables ?? []),
      ...(linkedTypebots?.flatMap((t) => t.variables) ?? []),
    ].filter(isDefined),
  }
  const resultHeader = parseResultHeader(groupsAndVariables)

  const tableData = useMemo(
    () =>
      publishedTypebot
        ? convertResultsToTableData(
            data?.flatMap((d) => d.results) ?? [],
            resultHeader
          )
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publishedTypebot?.id, resultHeader.length, data]
  )

  return (
    <resultsContext.Provider
      value={{
        resultsList: data,
        flatResults: data?.flatMap((d) => d.results) ?? [],
        hasMore: hasMore ?? true,
        tableData,
        resultHeader,
        totalResults,
        totalHiddenResults,
        onDeleteResults,
        fetchMore,
        mutate,
      }}
    >
      {children}
    </resultsContext.Provider>
  )
}

export const useResults = () => useContext(resultsContext)
