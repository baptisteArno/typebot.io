import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { DropdownList } from '@/components/DropdownList'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  Cell,
  defaultGoogleSheetsGetOptions,
  defaultGoogleSheetsInsertOptions,
  defaultGoogleSheetsUpdateOptions,
  ExtractingCell,
  GoogleSheetsAction,
  GoogleSheetsGetOptions,
  GoogleSheetsInsertRowOptions,
  GoogleSheetsOptions,
  GoogleSheetsUpdateRowOptions,
} from '@typebot.io/schemas'
import React, { useMemo } from 'react'
import { isDefined } from '@typebot.io/lib'
import { SheetsDropdown } from './SheetsDropdown'
import { SpreadsheetsDropdown } from './SpreadsheetDropdown'
import { CellWithValueStack } from './CellWithValueStack'
import { CellWithVariableIdStack } from './CellWithVariableIdStack'
import { GoogleSheetConnectModal } from './GoogleSheetsConnectModal'
import { TableListItemProps, TableList } from '@/components/TableList'
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import { RowsFilterTableList } from './RowsFilterTableList'
import { createId } from '@paralleldrive/cuid2'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useSheets } from '../hooks/useSheets'
import { Sheet } from '../types'

type Props = {
  options: GoogleSheetsOptions
  onOptionsChange: (options: GoogleSheetsOptions) => void
  blockId: string
}

export const GoogleSheetsSettings = ({
  options,
  onOptionsChange,
  blockId,
}: Props) => {
  const { workspace } = useWorkspace()
  const { save } = useTypebot()
  const { sheets, isLoading } = useSheets({
    credentialsId: options?.credentialsId,
    spreadsheetId: options?.spreadsheetId,
  })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const sheet = useMemo(
    () => sheets?.find((s) => s.id === options?.sheetId),
    [sheets, options?.sheetId]
  )
  const handleCredentialsIdChange = (credentialsId: string | undefined) =>
    onOptionsChange({
      ...options,
      credentialsId,
    })
  const handleSpreadsheetIdChange = (spreadsheetId: string | undefined) =>
    onOptionsChange({ ...options, spreadsheetId })
  const handleSheetIdChange = (sheetId: string | undefined) =>
    onOptionsChange({ ...options, sheetId })

  const handleActionChange = (action: GoogleSheetsAction) => {
    const baseOptions = {
      credentialsId: options.credentialsId,
      spreadsheetId: options.spreadsheetId,
      sheetId: options.sheetId,
    }
    switch (action) {
      case GoogleSheetsAction.GET: {
        const newOptions: GoogleSheetsGetOptions = {
          ...baseOptions,
          ...defaultGoogleSheetsGetOptions(createId),
        }
        return onOptionsChange({ ...newOptions })
      }
      case GoogleSheetsAction.INSERT_ROW: {
        const newOptions: GoogleSheetsInsertRowOptions = {
          ...baseOptions,
          ...defaultGoogleSheetsInsertOptions(createId),
        }
        return onOptionsChange({ ...newOptions })
      }
      case GoogleSheetsAction.UPDATE_ROW: {
        const newOptions: GoogleSheetsUpdateRowOptions = {
          ...baseOptions,
          ...defaultGoogleSheetsUpdateOptions(createId),
        }
        return onOptionsChange({ ...newOptions })
      }
    }
  }

  const handleCreateNewClick = async () => {
    await save()
    onOpen()
  }

  return (
    <Stack spacing={4}>
      {workspace && (
        <CredentialsDropdown
          type="google sheets"
          workspaceId={workspace.id}
          currentCredentialsId={options?.credentialsId}
          onCredentialsSelect={handleCredentialsIdChange}
          onCreateNewClick={handleCreateNewClick}
        />
      )}
      <GoogleSheetConnectModal
        blockId={blockId}
        isOpen={isOpen}
        onClose={onClose}
      />
      {options?.credentialsId && (
        <SpreadsheetsDropdown
          credentialsId={options.credentialsId}
          spreadsheetId={options.spreadsheetId}
          onSelectSpreadsheetId={handleSpreadsheetIdChange}
        />
      )}
      {options?.spreadsheetId && options.credentialsId && (
        <SheetsDropdown
          sheets={sheets ?? []}
          isLoading={isLoading}
          sheetId={options.sheetId}
          onSelectSheetId={handleSheetIdChange}
        />
      )}
      {options?.spreadsheetId &&
        options.credentialsId &&
        isDefined(options.sheetId) && (
          <DropdownList
            currentItem={'action' in options ? options.action : undefined}
            onItemSelect={handleActionChange}
            items={Object.values(GoogleSheetsAction)}
            placeholder="Select an operation"
          />
        )}
      {options.action && (
        <ActionOptions
          options={options}
          sheet={sheet}
          onOptionsChange={onOptionsChange}
        />
      )}
    </Stack>
  )
}

const ActionOptions = ({
  options,
  sheet,
  onOptionsChange,
}: {
  options:
    | GoogleSheetsGetOptions
    | GoogleSheetsInsertRowOptions
    | GoogleSheetsUpdateRowOptions
  sheet?: Sheet
  onOptionsChange: (options: GoogleSheetsOptions) => void
}) => {
  const handleInsertColumnsChange = (cellsToInsert: Cell[]) =>
    onOptionsChange({ ...options, cellsToInsert } as GoogleSheetsOptions)

  const handleUpsertColumnsChange = (cellsToUpsert: Cell[]) =>
    onOptionsChange({ ...options, cellsToUpsert } as GoogleSheetsOptions)

  const handleReferenceCellChange = (referenceCell: Cell) =>
    onOptionsChange({ ...options, referenceCell } as GoogleSheetsOptions)

  const handleExtractingCellsChange = (cellsToExtract: ExtractingCell[]) =>
    onOptionsChange({ ...options, cellsToExtract } as GoogleSheetsOptions)

  const handleFilterChange = (filter: GoogleSheetsGetOptions['filter']) =>
    onOptionsChange({ ...options, filter } as GoogleSheetsOptions)

  const UpdatingCellItem = useMemo(
    () =>
      function Component(props: TableListItemProps<Cell>) {
        return <CellWithValueStack {...props} columns={sheet?.columns ?? []} />
      },
    [sheet?.columns]
  )

  const ExtractingCellItem = useMemo(
    () =>
      function Component(props: TableListItemProps<ExtractingCell>) {
        return (
          <CellWithVariableIdStack {...props} columns={sheet?.columns ?? []} />
        )
      },
    [sheet?.columns]
  )

  switch (options.action) {
    case GoogleSheetsAction.INSERT_ROW:
      return (
        <TableList<Cell>
          initialItems={options.cellsToInsert}
          onItemsChange={handleInsertColumnsChange}
          Item={UpdatingCellItem}
          addLabel="Add a value"
        />
      )
    case GoogleSheetsAction.UPDATE_ROW:
      return (
        <Stack>
          <Text>Row to select</Text>
          <CellWithValueStack
            columns={sheet?.columns ?? []}
            item={options.referenceCell ?? { id: 'reference' }}
            onItemChange={handleReferenceCellChange}
          />
          <Text>Cells to update</Text>
          <TableList<Cell>
            initialItems={options.cellsToUpsert}
            onItemsChange={handleUpsertColumnsChange}
            Item={UpdatingCellItem}
            addLabel="Add a value"
          />
        </Stack>
      )
    case GoogleSheetsAction.GET:
      return (
        <Accordion allowMultiple>
          {options.referenceCell && (
            <AccordionItem>
              <AccordionButton>
                <Text w="full" textAlign="left">
                  Rows to select
                </Text>
                <AccordionIcon />
              </AccordionButton>

              <AccordionPanel pt="4">
                <CellWithValueStack
                  columns={sheet?.columns ?? []}
                  item={options.referenceCell ?? { id: 'reference' }}
                  onItemChange={handleReferenceCellChange}
                />
              </AccordionPanel>
            </AccordionItem>
          )}
          {!options.referenceCell && (
            <AccordionItem>
              <AccordionButton>
                <Text w="full" textAlign="left">
                  Rows to filter
                </Text>
                <AccordionIcon />
              </AccordionButton>

              <AccordionPanel pt="4">
                <RowsFilterTableList
                  columns={sheet?.columns ?? []}
                  filter={options.filter}
                  onFilterChange={handleFilterChange}
                />
              </AccordionPanel>
            </AccordionItem>
          )}
          <AccordionItem>
            <AccordionButton>
              <Text w="full" textAlign="left">
                Columns to extract
              </Text>
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel pt="4">
              <TableList<ExtractingCell>
                initialItems={options.cellsToExtract}
                onItemsChange={handleExtractingCellsChange}
                Item={ExtractingCellItem}
                addLabel="Add a value"
              />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )
    default:
      return <></>
  }
}
