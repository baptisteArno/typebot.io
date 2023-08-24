import { useToast } from '@/hooks/useToast'
import {
  LogicBlockType,
  ResultHeaderCell,
  ResultWithAnswers,
} from '@typebot.io/schemas'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { parseResultHeader } from '@typebot.io/lib/results'
import { useTypebot } from '../editor/providers/TypebotProvider'
import { useResultsQuery } from './hooks/useResultsQuery'
import { TableData } from './types'
import { convertResultsToTableData } from './helpers/convertResultsToTableData'
import { trpc } from '@/lib/trpc'
import { isDefined } from '@typebot.io/lib/utils'

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
  const { publishedTypebot } = useTypebot()
  const { showToast } = useToast()
  const { data, fetchNextPage, hasNextPage, refetch } = useResultsQuery({
    typebotId,
    onError: (error) => {
      showToast({ description: error })
    },
  })

  const linkedTypebotIds =
    publishedTypebot?.groups
      .flatMap((group) => group.blocks)
      .reduce<string[]>(
        (typebotIds, block) =>
          block.type === LogicBlockType.TYPEBOT_LINK &&
          isDefined(block.options.typebotId) &&
          !typebotIds.includes(block.options.typebotId) &&
          block.options.mergeResults !== false
            ? [...typebotIds, block.options.typebotId]
            : typebotIds,
        []
      ) ?? []

  const { data: linkedTypebotsData } = trpc.getLinkedTypebots.useQuery(
    {
      typebotId,
    },
    {
      enabled: linkedTypebotIds.length > 0,
    }
  )

  const flatResults = useMemo(
    () => data?.flatMap((d) => d.results) ?? [],
    [data]
  )

  const resultHeader = useMemo(
    () =>
      publishedTypebot
        ? parseResultHeader(publishedTypebot, linkedTypebotsData?.typebots)
        : [],
    [linkedTypebotsData?.typebots, publishedTypebot]
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
        flatResults,
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
