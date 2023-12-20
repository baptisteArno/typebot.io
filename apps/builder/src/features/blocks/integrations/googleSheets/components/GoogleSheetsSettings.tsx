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
  ExtractingCell,
  GoogleSheetsBlock,
  GoogleSheetsGetOptions,
  GoogleSheetsGetOptionsV6,
  GoogleSheetsInsertRowOptions,
  GoogleSheetsUpdateRowOptionsV6,
} from '@typebot.io/schemas'
import React, { useMemo } from 'react'
import { isDefined } from '@typebot.io/lib'
import { SheetsDropdown } from './SheetsDropdown'
import { CellWithValueStack } from './CellWithValueStack'
import { CellWithVariableIdStack } from './CellWithVariableIdStack'
import { GoogleSheetConnectModal } from './GoogleSheetsConnectModal'
import { TableList } from '@/components/TableList'
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import { RowsFilterTableList } from './RowsFilterTableList'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useSheets } from '../hooks/useSheets'
import { Sheet } from '../types'
import {
  GoogleSheetsAction,
  defaultGoogleSheetsOptions,
  totalRowsToExtractOptions,
} from '@typebot.io/schemas/features/blocks/integrations/googleSheets/constants'
import { GoogleSpreadsheetPicker } from './GoogleSpreadsheetPicker'

type Props = {
  options: GoogleSheetsBlock['options']
  onOptionsChange: (options: GoogleSheetsBlock['options']) => void
  blockId: string
}

export const GoogleSheetsSettings = ({
  options,
  onOptionsChange,
  blockId,
}: Props) => {
  const { workspace } = useWorkspace()
  const { typebot } = useTypebot()
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

  const handleActionChange = (action: GoogleSheetsAction) =>
    onOptionsChange({
      credentialsId: options?.credentialsId,
      spreadsheetId: options?.spreadsheetId,
      sheetId: options?.sheetId,
      action,
    })

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
          credentialsName="Sheets account"
        />
      )}
      {typebot && (
        <GoogleSheetConnectModal
          typebotId={typebot.id}
          blockId={blockId}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
      {options?.credentialsId && workspace && (
        <GoogleSpreadsheetPicker
          spreadsheetId={options.spreadsheetId}
          workspaceId={workspace.id}
          credentialsId={options.credentialsId}
          onSpreadsheetIdSelect={handleSpreadsheetIdChange}
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
      {options?.action && (
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
    | GoogleSheetsGetOptionsV6
    | GoogleSheetsInsertRowOptions
    | GoogleSheetsUpdateRowOptionsV6
  sheet?: Sheet
  onOptionsChange: (options: GoogleSheetsBlock['options']) => void
}) => {
  const handleInsertColumnsChange = (cellsToInsert: Cell[]) =>
    onOptionsChange({
      ...options,
      cellsToInsert,
    } as GoogleSheetsBlock['options'])

  const handleUpsertColumnsChange = (cellsToUpsert: Cell[]) =>
    onOptionsChange({
      ...options,
      cellsToUpsert,
    } as GoogleSheetsBlock['options'])

  const handleExtractingCellsChange = (cellsToExtract: ExtractingCell[]) =>
    onOptionsChange({
      ...options,
      cellsToExtract,
    } as GoogleSheetsBlock['options'])

  const handleFilterChange = (filter: GoogleSheetsGetOptions['filter']) =>
    onOptionsChange({ ...options, filter } as GoogleSheetsBlock['options'])

  const updateTotalRowsToExtract = (
    totalRowsToExtract: GoogleSheetsGetOptions['totalRowsToExtract']
  ) =>
    onOptionsChange({
      ...options,
      totalRowsToExtract,
    } as GoogleSheetsBlock['options'])

  switch (options.action) {
    case GoogleSheetsAction.INSERT_ROW:
      return (
        <TableList<Cell>
          initialItems={options.cellsToInsert}
          onItemsChange={handleInsertColumnsChange}
          addLabel="Add a value"
        >
          {({ item, onItemChange }) => (
            <CellWithValueStack
              item={item}
              onItemChange={onItemChange}
              columns={sheet?.columns ?? []}
            />
          )}
        </TableList>
      )
    case GoogleSheetsAction.UPDATE_ROW:
      return (
        <Accordion allowMultiple>
          <AccordionItem>
            <AccordionButton>
              <Text w="full" textAlign="left">
                Row(s) to update
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
          <AccordionItem>
            <AccordionButton>
              <Text w="full" textAlign="left">
                Cells to update
              </Text>
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel pt="4">
              <TableList<Cell>
                initialItems={options.cellsToUpsert}
                onItemsChange={handleUpsertColumnsChange}
                addLabel="Add a value"
              >
                {({ item, onItemChange }) => (
                  <CellWithValueStack
                    item={item}
                    onItemChange={onItemChange}
                    columns={sheet?.columns ?? []}
                  />
                )}
              </TableList>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )
    case GoogleSheetsAction.GET:
      return (
        <Accordion allowMultiple>
          <Stack>
            <>
              <AccordionItem>
                <AccordionButton>
                  <Text w="full" textAlign="left">
                    Select row(s)
                  </Text>
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel pt="4" as={Stack}>
                  <DropdownList
                    items={totalRowsToExtractOptions}
                    currentItem={
                      options.totalRowsToExtract ??
                      defaultGoogleSheetsOptions.totalRowsToExtract
                    }
                    onItemSelect={updateTotalRowsToExtract}
                  />
                  <RowsFilterTableList
                    columns={sheet?.columns ?? []}
                    filter={options.filter}
                    onFilterChange={handleFilterChange}
                  />
                </AccordionPanel>
              </AccordionItem>
            </>

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
                  addLabel="Add a value"
                  hasDefaultItem
                >
                  {({ item, onItemChange }) => (
                    <CellWithVariableIdStack
                      item={item}
                      onItemChange={onItemChange}
                      columns={sheet?.columns ?? []}
                    />
                  )}
                </TableList>
              </AccordionPanel>
            </AccordionItem>
          </Stack>
        </Accordion>
      )
    default:
      return <></>
  }
}
