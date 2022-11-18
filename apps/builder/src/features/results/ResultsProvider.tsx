import { useToast } from '@/hooks/useToast'
import { ResultHeaderCell, ResultWithAnswers } from 'models'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { parseResultHeader } from 'utils'
import { useTypebot } from '../editor/providers/TypebotProvider'
import { useResultsQuery } from './hooks/useResultsQuery'
import { TableData } from './types'
import { convertResultsToTableData } from './utils'

const resultsContext = createContext<{
  resultsList: { results: ResultWithAnswers[] }[] | undefined
  flatResults: ResultWithAnswers[]
  hasNextPage: boolean
  resultHeader: ResultHeaderCell[]
  totalResults: number
  tableData: TableData[]
  onDeleteResults: (totalResultsDeleted: number) => void
  fetchNextPage: () => void
  refetchResults: () => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const ResultsProvider = ({
  children,
  typebotId,
  totalResults,
  onDeleteResults,
}: {
  children: ReactNode
  typebotId: string
  totalResults: number
  onDeleteResults: (totalResultsDeleted: number) => void
}) => {
  const { publishedTypebot, linkedTypebots } = useTypebot()
  const { showToast } = useToast()
  const { data, fetchNextPage, hasNextPage, refetch } = useResultsQuery({
    typebotId,
    onError: (error) => {
      showToast({ description: error })
    },
  })

  const resultHeader = useMemo(
    () =>
      publishedTypebot
        ? parseResultHeader(publishedTypebot, linkedTypebots)
        : [],
    [linkedTypebots, publishedTypebot]
  )

  const tableData = useMemo(
    () =>
      publishedTypebot
        ? convertResultsToTableData(
            data?.flatMap((d) => d.results) ?? [],
            resultHeader
          )
        : [],
    [publishedTypebot, data, resultHeader]
  )

  return (
    <resultsContext.Provider
      value={{
        resultsList: data,
        flatResults: data?.flatMap((d) => d.results) ?? [],
        hasNextPage: hasNextPage ?? true,
        tableData,
        resultHeader,
        totalResults,
        onDeleteResults,
        fetchNextPage,
        refetchResults: refetch,
      }}
    >
      {children}
    </resultsContext.Provider>
  )
}

export const useResults = () => useContext(resultsContext)
