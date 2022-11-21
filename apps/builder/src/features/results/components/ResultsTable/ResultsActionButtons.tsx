import {
  HStack,
  Button,
  Fade,
  Tag,
  Text,
  useDisclosure,
  StackProps,
} from '@chakra-ui/react'
import { DownloadIcon, TrashIcon } from '@/components/icons'
import { ConfirmModal } from '@/components/ConfirmModal'
import { useTypebot } from '@/features/editor'
import { unparse } from 'papaparse'
import React, { useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { convertResultsToTableData } from '../../utils'
import { useResults } from '../../ResultsProvider'
import { trpc } from '@/lib/trpc'
import { TRPCError } from '@trpc/server'

type ResultsActionButtonsProps = {
  selectedResultsId: string[]
  onClearSelection: () => void
}

export const ResultsActionButtons = ({
  selectedResultsId,
  onClearSelection,
  ...props
}: ResultsActionButtonsProps & StackProps) => {
  const { typebot } = useTypebot()
  const { showToast } = useToast()
  const {
    flatResults: results,
    resultHeader,
    totalResults,
    tableData,
    onDeleteResults,
  } = useResults()
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

  const workspaceId = typebot?.workspaceId
  const typebotId = typebot?.id

  const getAllTableData = async () => {
    if (!workspaceId || !typebotId) return []
    const allResults = []
    let cursor: string | undefined
    do {
      try {
        const { results, nextCursor } =
          await trpcContext.results.getResults.fetch({
            typebotId,
            limit: '200',
            cursor,
          })
        allResults.push(...results)
        cursor = nextCursor ?? undefined
      } catch (error) {
        showToast({ description: (error as TRPCError).message })
      }
    } while (cursor)

    return convertResultsToTableData(allResults, resultHeader)
  }

  const totalSelected =
    selectedResultsId.length > 0 && selectedResultsId.length === results?.length
      ? totalResults
      : selectedResultsId.length

  const deleteResults = async () => {
    if (!workspaceId || !typebotId) return
    deleteResultsMutation.mutate({
      typebotId,
      ids:
        totalSelected === totalResults
          ? undefined
          : selectedResultsId.join(','),
    })
  }

  const exportResultsToCSV = async () => {
    setIsExportLoading(true)
    const isSelectAll = totalSelected === 0 || totalSelected === totalResults

    const dataToUnparse = isSelectAll
      ? await getAllTableData()
      : tableData.filter((data) =>
          selectedResultsId.includes(data.id.plainText)
        )

    const fields = typebot?.resultsTablePreferences?.columnsOrder
      ? typebot.resultsTablePreferences.columnsOrder.reduce<string[]>(
          (currentHeaderLabels, columnId) => {
            if (
              typebot.resultsTablePreferences?.columnsVisibility[columnId] ===
              false
            )
              return currentHeaderLabels
            const columnLabel = resultHeader.find(
              (headerCell) => headerCell.id === columnId
            )?.label
            if (!columnLabel) return currentHeaderLabels
            return [...currentHeaderLabels, columnLabel]
          },
          []
        )
      : resultHeader.map((headerCell) => headerCell.label)

    const data = dataToUnparse.map<{ [key: string]: string }>((data) => {
      const newObject: { [key: string]: string } = {}
      fields?.forEach((field) => {
        newObject[field] = data[field]?.plainText
      })
      return newObject
    })

    const csvData = new Blob(
      [
        unparse({
          data,
          fields,
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
  return (
    <HStack {...props}>
      <HStack
        as={Button}
        onClick={exportResultsToCSV}
        isLoading={isExportLoading}
      >
        <DownloadIcon />
        <Text>Export {totalSelected > 0 ? '' : 'all'}</Text>

        {totalSelected && (
          <Tag variant="solid" size="sm">
            {totalSelected}
          </Tag>
        )}
      </HStack>

      <Fade in={totalSelected > 0} unmountOnExit>
        <HStack
          as={Button}
          colorScheme="red"
          onClick={onOpen}
          isLoading={isDeleteLoading}
        >
          <TrashIcon />
          <Text>Delete</Text>
          {totalSelected > 0 && (
            <Tag colorScheme="red" variant="subtle" size="sm">
              {totalSelected}
            </Tag>
          )}
        </HStack>
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
      </Fade>
    </HStack>
  )
}
