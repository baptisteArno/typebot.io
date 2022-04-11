import { Divider, Stack, Text, useDisclosure } from '@chakra-ui/react'
import { DropdownList } from 'components/shared/DropdownList'
import { TableList, TableListItemProps } from 'components/shared/TableList'
import { useTypebot } from 'contexts/TypebotContext'
import {
  Cell,
  CredentialsType,
  ExtractingCell,
  GoogleSheetsAction,
  GoogleSheetsGetOptions,
  GoogleSheetsInsertRowOptions,
  GoogleSheetsOptions,
  GoogleSheetsUpdateRowOptions,
} from 'models'
import React, { useMemo } from 'react'
import { Sheet, useSheets } from 'services/integrations'
import { isDefined, omit } from 'utils'
import { SheetsDropdown } from './SheetsDropdown'
import { SpreadsheetsDropdown } from './SpreadsheetDropdown'
import { CellWithValueStack } from './CellWithValueStack'
import { CellWithVariableIdStack } from './CellWithVariableIdStack'
import { CredentialsDropdown } from 'components/shared/CredentialsDropdown'
import { GoogleSheetConnectModal } from './GoogleSheetsConnectModal'

type Props = {
  options: GoogleSheetsOptions
  onOptionsChange: (options: GoogleSheetsOptions) => void
  stepId: string
}

export const GoogleSheetsSettingsBody = ({
  options,
  onOptionsChange,
  stepId,
}: Props) => {
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
  const handleCredentialsIdChange = (credentialsId?: string) =>
    onOptionsChange({ ...omit(options, 'credentialsId'), credentialsId })
  const handleSpreadsheetIdChange = (spreadsheetId: string) =>
    onOptionsChange({ ...options, spreadsheetId })
  const handleSheetIdChange = (sheetId: string) =>
    onOptionsChange({ ...options, sheetId })

  const handleActionChange = (action: GoogleSheetsAction) => {
    switch (action) {
      case GoogleSheetsAction.GET: {
        const newOptions: GoogleSheetsGetOptions = {
          ...options,
          action,
          cellsToExtract: [],
        }
        return onOptionsChange({ ...newOptions })
      }
      case GoogleSheetsAction.INSERT_ROW: {
        const newOptions: GoogleSheetsInsertRowOptions = {
          ...options,
          action,
          cellsToInsert: [],
        }
        return onOptionsChange({ ...newOptions })
      }
      case GoogleSheetsAction.UPDATE_ROW: {
        const newOptions: GoogleSheetsUpdateRowOptions = {
          ...options,
          action,
          cellsToUpsert: [],
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
    <Stack>
      <CredentialsDropdown
        type={CredentialsType.GOOGLE_SHEETS}
        currentCredentialsId={options?.credentialsId}
        onCredentialsSelect={handleCredentialsIdChange}
        onCreateNewClick={handleCreateNewClick}
      />
      <GoogleSheetConnectModal
        stepId={stepId}
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
          <>
            <Divider />
            <DropdownList<GoogleSheetsAction>
              currentItem={'action' in options ? options.action : undefined}
              onItemSelect={handleActionChange}
              items={Object.values(GoogleSheetsAction)}
              placeholder="Select an operation"
            />
          </>
        )}
      {'action' in options && (
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

  const UpdatingCellItem = useMemo(
    () => (props: TableListItemProps<Cell>) =>
      <CellWithValueStack {...props} columns={sheet?.columns ?? []} />,
    [sheet?.columns]
  )

  const ExtractingCellItem = useMemo(
    () => (props: TableListItemProps<ExtractingCell>) =>
      <CellWithVariableIdStack {...props} columns={sheet?.columns ?? []} />,
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
        <Stack>
          <Text>Row to select</Text>
          <CellWithValueStack
            columns={sheet?.columns ?? []}
            item={options.referenceCell ?? { id: 'reference' }}
            onItemChange={handleReferenceCellChange}
          />
          <Text>Cells to extract</Text>
          <TableList<ExtractingCell>
            initialItems={options.cellsToExtract}
            onItemsChange={handleExtractingCellsChange}
            Item={ExtractingCellItem}
            addLabel="Add a value"
          />
        </Stack>
      )
    default:
      return <></>
  }
}
