import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Stack,
  IconButton,
  Portal,
  Button,
  Text,
  HStack,
  useDisclosure,
} from '@chakra-ui/react'
import {
  ChevronRightIcon,
  DownloadIcon,
  ListIcon,
  MoreHorizontalIcon,
} from '@/components/icons'
import { ResultHeaderCell } from '@typebot.io/schemas'
import React, { useState } from 'react'
import { ColumnSettings } from './ColumnSettings'
import { ExportAllResultsModal } from './ExportAllResultsModal'

type Props = {
  resultHeader: ResultHeaderCell[]
  columnVisibility: { [key: string]: boolean }
  columnOrder: string[]
  onColumnOrderChange: (columnOrder: string[]) => void
  setColumnVisibility: (columnVisibility: { [key: string]: boolean }) => void
}

export const TableSettingsButton = (props: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Popover isLazy placement="bottom-end">
        <PopoverTrigger>
          <IconButton
            size="sm"
            aria-label="Open table settings"
            icon={<MoreHorizontalIcon />}
          />
        </PopoverTrigger>
        <Portal>
          <PopoverContent w="300px">
            <TableSettingsMenu {...props} onExportAllClick={onOpen} />
          </PopoverContent>
        </Portal>
      </Popover>
      <ExportAllResultsModal onClose={onClose} isOpen={isOpen} />
    </>
  )
}

const TableSettingsMenu = ({
  resultHeader,
  columnVisibility,
  setColumnVisibility,
  columnOrder,
  onColumnOrderChange,
  onExportAllClick,
}: Props & { onExportAllClick: () => void }) => {
  const [selectedMenu, setSelectedMenu] = useState<
    'export' | 'columnSettings' | null
  >(null)

  switch (selectedMenu) {
    case 'columnSettings':
      return (
        <PopoverBody as={Stack} spacing="4" p="4" maxH="450px" overflowY="auto">
          <ColumnSettings
            resultHeader={resultHeader}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            columnOrder={columnOrder}
            onColumnOrderChange={onColumnOrderChange}
          />
        </PopoverBody>
      )
    default:
      return (
        <PopoverBody as={Stack} p="0" spacing="0">
          <Button
            onClick={() => setSelectedMenu('columnSettings')}
            variant="ghost"
            borderBottomRadius={0}
            justifyContent="space-between"
          >
            <HStack>
              <ListIcon />
              <Text>Column settings</Text>
            </HStack>

            <ChevronRightIcon color="gray.400" />
          </Button>
          noOfLines={1}
          <Button
            onClick={onExportAllClick}
            variant="ghost"
            borderTopRadius={0}
            justifyContent="space-between"
          >
            <HStack>
              <DownloadIcon />
              <Text>Export all</Text>
            </HStack>
          </Button>
        </PopoverBody>
      )
  }
}
