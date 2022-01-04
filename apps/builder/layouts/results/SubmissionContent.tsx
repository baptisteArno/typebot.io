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
} from 'services/results'
import { unparse } from 'papaparse'

type Props = {
  typebotId: string
  totalResults: number
  onDeleteResults: (total: number) => void
}
export const SubmissionsContent = ({
  typebotId,
  totalResults,
  onDeleteResults,
}: Props) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isExportLoading, setIsExportLoading] = useState(false)

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

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

  const totalSelected = useMemo(
    () =>
      selectedIndices.length === results?.length
        ? totalResults
        : selectedIndices.length,
    [results?.length, selectedIndices.length, totalResults]
  )

  const handleScrolledToBottom = useCallback(
    () => setSize((state) => state + 1),
    [setSize]
  )

  const handleExportSelection = async () => {
    setIsExportLoading(true)
    const isSelectAll = totalSelected === totalResults
    const dataToUnparse = isSelectAll
      ? await getAllTableData()
      : tableData.filter((_, idx) => selectedIndices.includes(idx))
    const csvData = new Blob([unparse(dataToUnparse)], {
      type: 'text/csv;charset=utf-8;',
    })
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
    const { data, error } = await getAllResults(typebotId)
    if (error) toast({ description: error.message, title: error.name })
    return convertResultsToTableData(data?.results)
  }

  const tableData: { [key: string]: string }[] = useMemo(
    () => convertResultsToTableData(results),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [results?.length]
  )

  return (
    <Stack maxW="1200px" w="full">
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
        data={tableData}
        onNewSelection={handleNewSelection}
        onScrollToBottom={handleScrolledToBottom}
        hasMore={hasMore}
      />
    </Stack>
  )
}
