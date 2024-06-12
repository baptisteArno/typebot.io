import { useToast } from '@/hooks/useToast'
import {
  ResultHeaderCell,
  ResultWithAnswers,
  TableData,
  Typebot,
} from '@typebot.io/schemas'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useTypebot } from '../editor/providers/TypebotProvider'
import { useResultsQuery } from './hooks/useResultsQuery'
import { trpc } from '@/lib/trpc'
import { isDefined } from '@typebot.io/lib/utils'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { parseResultHeader } from '@typebot.io/results/parseResultHeader'
import { convertResultsToTableData } from '@typebot.io/results/convertResultsToTableData'
import { parseCellContent } from './helpers/parseCellContent'
import { timeFilterValues } from '../analytics/constants'
import { parseBlockIdVariableIdMap } from '@typebot.io/results/parseBlockIdVariableIdMap'

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
  typebotId,
  totalResults,
  onDeleteResults,
}: {
  timeFilter: (typeof timeFilterValues)[number]
  children: ReactNode
  typebotId: string
  totalResults: number
  onDeleteResults: (totalResultsDeleted: number) => void
}) => {
  const { publishedTypebot } = useTypebot()
  const { showToast } = useToast()
  const { data, fetchNextPage, hasNextPage, refetch } = useResultsQuery({
    timeFilter,
    typebotId,
    onError: (error) => {
      showToast({ description: error })
    },
  })

  const linkedTypebotIds =
    publishedTypebot?.groups
      .flatMap((group) => group.blocks)
      .reduce<string[]>((typebotIds, block) => {
        if (block.type !== LogicBlockType.TYPEBOT_LINK) return typebotIds
        const typebotId = block.options?.typebotId
        return isDefined(typebotId) &&
          !typebotIds.includes(typebotId) &&
          block.options?.mergeResults !== false
          ? [...typebotIds, typebotId]
          : typebotIds
      }, []) ?? []

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
        ? parseResultHeader(
            publishedTypebot,
            linkedTypebotsData?.typebots as Pick<
              Typebot,
              'groups' | 'variables'
            >[]
          )
        : [],
    [linkedTypebotsData?.typebots, publishedTypebot]
  )

  const tableData = useMemo(
    () =>
      publishedTypebot
        ? convertResultsToTableData({
            results: data?.flatMap((d) => d.results) ?? [],
            headerCells: resultHeader,
            cellParser: parseCellContent,
            blockIdVariableIdMap: parseBlockIdVariableIdMap(
              publishedTypebot.groups
            ),
          })
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
