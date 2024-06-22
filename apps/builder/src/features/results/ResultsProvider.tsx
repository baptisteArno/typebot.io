import { useToast } from '@/hooks/useToast'
import {
  ResultHeaderCell,
  ResultWithAnswers,
  TableData,
  Sniper,
} from '@sniper.io/schemas'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useSniper } from '../editor/providers/SniperProvider'
import { useResultsQuery } from './hooks/useResultsQuery'
import { trpc } from '@/lib/trpc'
import { isDefined } from '@sniper.io/lib/utils'
import { LogicBlockType } from '@sniper.io/schemas/features/blocks/logic/constants'
import { parseResultHeader } from '@sniper.io/results/parseResultHeader'
import { convertResultsToTableData } from '@sniper.io/results/convertResultsToTableData'
import { parseCellContent } from './helpers/parseCellContent'
import { timeFilterValues } from '../analytics/constants'
import { parseBlockIdVariableIdMap } from '@sniper.io/results/parseBlockIdVariableIdMap'

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
  timeFilter,
  children,
  sniperId,
  totalResults,
  onDeleteResults,
}: {
  timeFilter: (typeof timeFilterValues)[number]
  children: ReactNode
  sniperId: string
  totalResults: number
  onDeleteResults: (totalResultsDeleted: number) => void
}) => {
  const { publishedSniper } = useSniper()
  const { showToast } = useToast()
  const { data, fetchNextPage, hasNextPage, refetch } = useResultsQuery({
    timeFilter,
    sniperId,
    onError: (error) => {
      showToast({ description: error })
    },
  })

  const linkedSniperIds =
    publishedSniper?.groups
      .flatMap((group) => group.blocks)
      .reduce<string[]>((sniperIds, block) => {
        if (block.type !== LogicBlockType.SNIPER_LINK) return sniperIds
        const sniperId = block.options?.sniperId
        return isDefined(sniperId) &&
          !sniperIds.includes(sniperId) &&
          block.options?.mergeResults !== false
          ? [...sniperIds, sniperId]
          : sniperIds
      }, []) ?? []

  const { data: linkedSnipersData } = trpc.getLinkedSnipers.useQuery(
    {
      sniperId,
    },
    {
      enabled: linkedSniperIds.length > 0,
    }
  )

  const flatResults = useMemo(
    () => data?.flatMap((d) => d.results) ?? [],
    [data]
  )

  const resultHeader = useMemo(
    () =>
      publishedSniper
        ? parseResultHeader(
            publishedSniper,
            linkedSnipersData?.snipers as Pick<Sniper, 'groups' | 'variables'>[]
          )
        : [],
    [linkedSnipersData?.snipers, publishedSniper]
  )

  const tableData = useMemo(
    () =>
      publishedSniper
        ? convertResultsToTableData({
            results: data?.flatMap((d) => d.results) ?? [],
            headerCells: resultHeader,
            cellParser: parseCellContent,
            blockIdVariableIdMap: parseBlockIdVariableIdMap(
              publishedSniper.groups
            ),
          })
        : [],
    [publishedSniper, data, resultHeader]
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
