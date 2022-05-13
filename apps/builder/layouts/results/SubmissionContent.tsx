import { Stack, useToast, Flex } from '@chakra-ui/react'
import { ResultsActionButtons } from 'components/results/ResultsActionButtons'
import { SubmissionsTable } from 'components/results/SubmissionsTable'
import React, { useCallback, useMemo, useState } from 'react'
import {
  convertResultsToTableData,
  deleteAllResults,
  deleteResults,
  getAllResults,
  useResults,
} from 'services/typebots'
import { unparse } from 'papaparse'
import { UnlockPlanInfo } from 'components/shared/Info'
import { LogsModal } from './LogsModal'
import { useTypebot } from 'contexts/TypebotContext'
import { isDefined, parseResultHeader } from 'utils'
import { Plan } from 'db'

type Props = {
  typebotId: string
  totalResults: number
  totalHiddenResults?: number
  onDeleteResults: (total: number) => void
}
export const SubmissionsContent = ({
  typebotId,
  totalResults,
  totalHiddenResults,
  onDeleteResults,
}: Props) => {
  const { publishedTypebot, linkedTypebots } = useTypebot()
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isExportLoading, setIsExportLoading] = useState(false)
  const [inspectingLogsResultId, setInspectingLogsResultId] = useState<string>()

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const blocksAndVariables = {
    blocks: [
      ...(publishedTypebot?.blocks ?? []),
      ...(linkedTypebots?.flatMap((t) => t.blocks) ?? []),
    ].filter(isDefined),
    variables: [
      ...(publishedTypebot?.variables ?? []),
      ...(linkedTypebots?.flatMap((t) => t.variables) ?? []),
    ].filter(isDefined),
  }

  const resultHeader = parseResultHeader(blocksAndVariables)

  const { data, mutate, setSize, hasMore } = useResults({
    typebotId,
    onError: (err) => toast({ title: err.name, description: err.message }),
  })

  const results = useMemo(() => data?.flatMap((d) => d.results), [data])

  const handleNewSelection = (newSelectionIndices: number[]) => {
    if (newSelectionIndices.length === selectedIndices.length) return
    setSelectedIndices(newSelectionIndices)
  }

  const handleDeleteSelection = async () => {
    setIsDeleteLoading(true)
    const selectedIds = (results ?? [])
      .filter((_, idx) => selectedIndices.includes(idx))
      .map((result) => result.id)
    const { error } =
      totalSelected === totalResults
        ? await deleteAllResults(typebotId)
        : await deleteResults(typebotId, selectedIds)
    if (error) toast({ description: error.message, title: error.name })
    else {
      mutate(
        totalSelected === totalResults
          ? []
          : data?.map((d) => ({
              results: d.results.filter((r) => !selectedIds.includes(r.id)),
            }))
      )
      onDeleteResults(totalSelected)
    }
    setIsDeleteLoading(false)
  }

  const totalSelected =
    selectedIndices.length > 0 && selectedIndices.length === results?.length
      ? totalResults - (totalHiddenResults ?? 0)
      : selectedIndices.length

  const handleScrolledToBottom = useCallback(
    () => setSize((state) => state + 1),
    [setSize]
  )

  const handleExportSelection = async () => {
    setIsExportLoading(true)
    const isSelectAll =
      totalSelected === totalResults - (totalHiddenResults ?? 0)
    const dataToUnparse = isSelectAll
      ? await getAllTableData()
      : tableData.filter((_, idx) => selectedIndices.includes(idx))
    const csvData = new Blob(
      [
        unparse({
          data: dataToUnparse,
          fields: resultHeader.map((h) => h.label),
        }),
      ],
      {
        type: 'text/csv;charset=utf-8;',
      }
    )
    const fileName =
      `typebot-export_${new Date().toLocaleDateString().replaceAll('/', '-')}` +
      (isSelectAll ? `_all` : ``)
    const tempLink = document.createElement('a')
    tempLink.href = window.URL.createObjectURL(csvData)
    tempLink.setAttribute('download', `${fileName}.csv`)
    tempLink.click()
    setIsExportLoading(false)
  }

  const getAllTableData = async () => {
    if (!publishedTypebot) return []
    const results = await getAllResults(typebotId)
    return convertResultsToTableData(results, resultHeader)
  }

  const tableData: { [key: string]: string }[] = useMemo(
    () =>
      publishedTypebot ? convertResultsToTableData(results, resultHeader) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publishedTypebot?.id, resultHeader.length, results]
  )

  const handleLogsModalClose = () => setInspectingLogsResultId(undefined)

  const handleLogOpenIndex = (index: number) => () => {
    if (!results) return
    setInspectingLogsResultId(results[index].id)
  }

  return (
    <Stack maxW="1200px" w="full" pb="28" px={['4', '0']} spacing="4">
      {totalHiddenResults && (
        <UnlockPlanInfo
          buttonLabel={`Unlock ${totalHiddenResults} results`}
          contentLabel="You are seeing complete submissions only."
          plan={Plan.PRO}
        />
      )}
      {publishedTypebot && (
        <LogsModal
          typebotId={publishedTypebot?.typebotId}
          resultId={inspectingLogsResultId}
          onClose={handleLogsModalClose}
        />
      )}
      <Flex w="full" justifyContent="flex-end">
        <ResultsActionButtons
          isDeleteLoading={isDeleteLoading}
          isExportLoading={isExportLoading}
          totalSelected={totalSelected}
          onDeleteClick={handleDeleteSelection}
          onExportClick={handleExportSelection}
        />
      </Flex>

      <SubmissionsTable
        resultHeader={resultHeader}
        data={tableData}
        onNewSelection={handleNewSelection}
        onScrollToBottom={handleScrolledToBottom}
        hasMore={hasMore}
        onLogOpenIndex={handleLogOpenIndex}
      />
    </Stack>
  )
}
