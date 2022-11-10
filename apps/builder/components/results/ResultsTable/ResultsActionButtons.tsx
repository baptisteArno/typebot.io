import {
  HStack,
  Button,
  Fade,
  Tag,
  Text,
  useDisclosure,
  StackProps,
} from '@chakra-ui/react'
import { DownloadIcon, TrashIcon } from 'assets/icons'
import { ConfirmModal } from 'components/modals/ConfirmModal'
import { useToast } from 'components/shared/hooks/useToast'
import { useResults } from 'contexts/ResultsProvider'
import { useTypebot } from 'contexts/TypebotContext'
import { unparse } from 'papaparse'
import React, { useState } from 'react'
import {
  convertResultsToTableData,
  getAllResults,
  deleteResults as deleteFetchResults,
} from 'services/typebots/results'

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
    resultsList: data,
    flatResults: results,
    resultHeader,
    mutate,
    totalResults,
    tableData,
    onDeleteResults,
  } = useResults()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isExportLoading, setIsExportLoading] = useState(false)

  const workspaceId = typebot?.workspaceId
  const typebotId = typebot?.id

  const getAllTableData = async () => {
    if (!workspaceId || !typebotId) return []
    const results = await getAllResults(workspaceId, typebotId)
    return convertResultsToTableData(results, resultHeader)
  }

  const totalSelected =
    selectedResultsId.length > 0 && selectedResultsId.length === results?.length
      ? totalResults
      : selectedResultsId.length

  const deleteResults = async () => {
    if (!workspaceId || !typebotId) return
    setIsDeleteLoading(true)
    const { error } = await deleteFetchResults(
      workspaceId,
      typebotId,
      totalSelected === totalResults ? [] : selectedResultsId
    )
    if (error) showToast({ description: error.message, title: error.name })
    else {
      mutate(
        totalSelected === totalResults
          ? []
          : data?.map((d) => ({
              results: d.results.filter(
                (r) => !selectedResultsId.includes(r.id)
              ),
            }))
      )
    }
    onDeleteResults(selectedResultsId.length)
    onClearSelection()
    setIsDeleteLoading(false)
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
