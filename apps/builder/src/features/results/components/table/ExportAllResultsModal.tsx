import { AlertInfo } from '@/components/AlertInfo'
import { DownloadIcon } from '@/components/icons'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react'
import { TRPCError } from '@trpc/server'
import { unparse } from 'papaparse'
import { useState } from 'react'
import { parseResultHeader } from '@typebot.io/lib/results'
import { useResults } from '../../ResultsProvider'
import { parseColumnOrder } from '../../helpers/parseColumnsOrder'
import { convertResultsToTableData } from '../../helpers/convertResultsToTableData'
import { parseAccessor } from '../../helpers/parseAccessor'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const ExportAllResultsModal = ({ isOpen, onClose }: Props) => {
  const { typebot, publishedTypebot, linkedTypebots } = useTypebot()
  const workspaceId = typebot?.workspaceId
  const typebotId = typebot?.id
  const { showToast } = useToast()
  const { resultHeader: existingResultHeader } = useResults()
  const trpcContext = trpc.useContext()
  const [isExportLoading, setIsExportLoading] = useState(false)

  const [areDeletedBlocksIncluded, setAreDeletedBlocksIncluded] =
    useState(false)

  const getAllResults = async () => {
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

    return allResults
  }

  const exportAllResultsToCSV = async () => {
    if (!publishedTypebot) return

    setIsExportLoading(true)

    const results = await getAllResults()

    const resultHeader = areDeletedBlocksIncluded
      ? parseResultHeader(publishedTypebot, linkedTypebots, results)
      : existingResultHeader

    const dataToUnparse = convertResultsToTableData(results, resultHeader)

    const fields = parseColumnOrder(
      typebot?.resultsTablePreferences?.columnsOrder,
      resultHeader
    ).reduce<string[]>((currentHeaderLabels, columnId) => {
      if (
        typebot?.resultsTablePreferences?.columnsVisibility[columnId] === false
      )
        return currentHeaderLabels
      const columnLabel = resultHeader.find(
        (headerCell) => headerCell.id === columnId
      )?.label
      if (!columnLabel) return currentHeaderLabels
      return [...currentHeaderLabels, columnLabel]
    }, [])

    const data = dataToUnparse.map<{ [key: string]: string }>((data) => {
      const newObject: { [key: string]: string } = {}
      fields?.forEach((field) => {
        newObject[field] = data[parseAccessor(field)]?.plainText
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
    const fileName = `typebot-export_${new Date()
      .toLocaleDateString()
      .replaceAll('/', '-')}`
    const tempLink = document.createElement('a')
    tempLink.href = window.URL.createObjectURL(csvData)
    tempLink.setAttribute('download', `${fileName}.csv`)
    tempLink.click()
    setIsExportLoading(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader />
        <ModalBody as={Stack} spacing="4">
          <SwitchWithLabel
            label="Include deleted blocks"
            moreInfoContent="Blocks from previous bot version that have been deleted"
            initialValue={false}
            onCheckChange={setAreDeletedBlocksIncluded}
          />
          <AlertInfo>The export may take up to 1 minute.</AlertInfo>
        </ModalBody>
        <ModalFooter as={HStack}>
          <Button onClick={onClose} variant="ghost" size="sm">
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={exportAllResultsToCSV}
            leftIcon={<DownloadIcon />}
            size="sm"
            isLoading={isExportLoading}
          >
            Export
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
