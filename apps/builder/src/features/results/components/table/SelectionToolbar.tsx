import {
  HStack,
  Button,
  Text,
  useDisclosure,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { DownloadIcon, TrashIcon } from '@/components/icons'
import { ConfirmModal } from '@/components/ConfirmModal'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { unparse } from 'papaparse'
import React, { useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { useResults } from '../../ResultsProvider'
import { trpc } from '@/lib/trpc'
import { byId } from '@sniper.io/lib/utils'
import { parseColumnsOrder } from '@sniper.io/results/parseColumnsOrder'
import { parseUniqueKey } from '@sniper.io/lib/parseUniqueKey'

type Props = {
  selectedResultsId: string[]
  onClearSelection: () => void
}

export const SelectionToolbar = ({
  selectedResultsId,
  onClearSelection,
}: Props) => {
  const selectLabelColor = useColorModeValue('blue.500', 'blue.200')
  const { sniper } = useSniper()
  const { showToast } = useToast()
  const { resultHeader, tableData, onDeleteResults } = useResults()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isExportLoading, setIsExportLoading] = useState(false)
  const trpcContext = trpc.useContext()
  const deleteResultsMutation = trpc.results.deleteResults.useMutation({
    onMutate: () => {
      setIsDeleteLoading(true)
    },
    onError: (error) => showToast({ description: error.message }),
    onSuccess: async () => {
      await trpcContext.results.getResults.invalidate()
    },
    onSettled: () => {
      onDeleteResults(selectedResultsId.length)
      onClearSelection()
      setIsDeleteLoading(false)
    },
  })

  const workspaceId = sniper?.workspaceId
  const sniperId = sniper?.id

  const totalSelected = selectedResultsId.length

  const deleteResults = async () => {
    if (!workspaceId || !sniperId) return
    deleteResultsMutation.mutate({
      sniperId,
      resultIds: selectedResultsId.join(','),
    })
  }

  const exportResultsToCSV = async () => {
    setIsExportLoading(true)

    const dataToUnparse = tableData.filter((data) =>
      selectedResultsId.includes(data.id.plainText)
    )

    const headerIds = parseColumnsOrder(
      sniper?.resultsTablePreferences?.columnsOrder,
      resultHeader
    )
      .reduce<string[]>((currentHeaderIds, columnId) => {
        if (
          sniper?.resultsTablePreferences?.columnsVisibility[columnId] === false
        )
          return currentHeaderIds
        const columnLabel = resultHeader.find(
          (headerCell) => headerCell.id === columnId
        )?.id
        if (!columnLabel) return currentHeaderIds
        return [...currentHeaderIds, columnLabel]
      }, [])
      .concat(
        sniper?.resultsTablePreferences?.columnsOrder
          ? resultHeader
              .filter(
                (headerCell) =>
                  !sniper?.resultsTablePreferences?.columnsOrder.includes(
                    headerCell.id
                  )
              )
              .map((headerCell) => headerCell.id)
          : []
      )

    const data = dataToUnparse.map<{ [key: string]: string }>((data) => {
      const newObject: { [key: string]: string } = {}
      headerIds?.forEach((headerId) => {
        const headerLabel = resultHeader.find(byId(headerId))?.label
        if (!headerLabel) return
        const newKey = parseUniqueKey(headerLabel, Object.keys(newObject))
        newObject[newKey] = data[headerId]?.plainText
      })
      return newObject
    })

    const csvData = new Blob([unparse(data)], {
      type: 'text/csv;charset=utf-8;',
    })
    const fileName = `sniper-export_${new Date()
      .toLocaleDateString()
      .replaceAll('/', '-')}`
    const tempLink = document.createElement('a')
    tempLink.href = window.URL.createObjectURL(csvData)
    tempLink.setAttribute('download', `${fileName}.csv`)
    tempLink.click()
    setIsExportLoading(false)
  }

  if (totalSelected === 0) return null

  return (
    <HStack rounded="md" spacing={0}>
      <Button
        color={selectLabelColor}
        borderRightWidth="1px"
        borderRightRadius="none"
        onClick={onClearSelection}
        size="sm"
      >
        {totalSelected} selected
      </Button>
      <IconButton
        borderRightWidth="1px"
        borderRightRadius="none"
        borderLeftRadius="none"
        aria-label="Export"
        icon={<DownloadIcon />}
        onClick={exportResultsToCSV}
        isLoading={isExportLoading}
        size="sm"
      />

      <IconButton
        aria-label="Delete"
        borderLeftRadius="none"
        icon={<TrashIcon />}
        onClick={onOpen}
        isLoading={isDeleteLoading}
        size="sm"
      />

      <ConfirmModal
        isOpen={isOpen}
        onConfirm={deleteResults}
        onClose={onClose}
        message={
          <Text>
            You are about to delete{' '}
            <strong>
              {totalSelected} submission
              {totalSelected > 1 ? 's' : ''}
            </strong>
            . Are you sure you wish to continue?
          </Text>
        }
        confirmButtonLabel={'Delete'}
      />
    </HStack>
  )
}
