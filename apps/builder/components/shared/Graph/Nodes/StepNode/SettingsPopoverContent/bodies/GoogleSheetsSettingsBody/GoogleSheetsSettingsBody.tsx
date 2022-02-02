import { Divider, Stack, Text } from '@chakra-ui/react'
import { CredentialsDropdown } from 'components/shared/CredentialsDropdown'
import { DropdownList } from 'components/shared/DropdownList'
import { TableList, TableListItemProps } from 'components/shared/TableList'
import { useTypebot } from 'contexts/TypebotContext'
import { CredentialsType } from 'db'
import {
  Cell,
  defaultTable,
  ExtractingCell,
  GoogleSheetsAction,
  GoogleSheetsGetOptions,
  GoogleSheetsInsertRowOptions,
  GoogleSheetsOptions,
  GoogleSheetsUpdateRowOptions,
  Table,
} from 'models'
import React, { useMemo } from 'react'
import {
  getGoogleSheetsConsentScreenUrl,
  Sheet,
  useSheets,
} from 'services/integrations'
import { isDefined } from 'utils'
import { SheetsDropdown } from './SheetsDropdown'
import { SpreadsheetsDropdown } from './SpreadsheetDropdown'
import { CellWithValueStack } from './CellWithValueStack'
import { CellWithVariableIdStack } from './CellWithVariableIdStack'

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
  const { save, hasUnsavedChanges } = useTypebot()
  const { sheets, isLoading } = useSheets({
    credentialsId: options?.credentialsId,
    spreadsheetId: options?.spreadsheetId,
  })
  const sheet = useMemo(
    () => sheets?.find((s) => s.id === options?.sheetId),
    [sheets, options?.sheetId]
  )
  const handleCredentialsIdChange = (credentialsId: string) =>
    onOptionsChange({ ...options, credentialsId })
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
          cellsToExtract: defaultTable,
        }
        return onOptionsChange({ ...newOptions })
      }
      case GoogleSheetsAction.INSERT_ROW: {
        const newOptions: GoogleSheetsInsertRowOptions = {
          ...options,
          action,
          cellsToInsert: defaultTable,
        }
        return onOptionsChange({ ...newOptions })
      }
      case GoogleSheetsAction.UPDATE_ROW: {
        const newOptions: GoogleSheetsUpdateRowOptions = {
          ...options,
          action,
          cellsToUpsert: defaultTable,
        }
        return onOptionsChange({ ...newOptions })
      }
    }
  }

  const handleCreateNewClick = async () => {
    if (hasUnsavedChanges) {
      const errorToastId = await save()
      if (errorToastId) return
    }
    const linkElement = document.createElement('a')
    linkElement.href = getGoogleSheetsConsentScreenUrl(
      window.location.href,
      stepId
    )
    linkElement.click()
  }

  return (
    <Stack>
      <CredentialsDropdown
        type={CredentialsType.GOOGLE_SHEETS}
        currentCredentialsId={options?.credentialsId}
        onCredentialsSelect={handleCredentialsIdChange}
        onCreateNewClick={handleCreateNewClick}
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
      {sheet && 'action' in options && (
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
  sheet: Sheet
  onOptionsChange: (options: GoogleSheetsOptions) => void
}) => {
  const handleInsertColumnsChange = (cellsToInsert: Table<Cell>) =>
    onOptionsChange({ ...options, cellsToInsert } as GoogleSheetsOptions)

  const handleUpsertColumnsChange = (cellsToUpsert: Table<Cell>) =>
    onOptionsChange({ ...options, cellsToUpsert } as GoogleSheetsOptions)

  const handleReferenceCellChange = (referenceCell: Cell) =>
    onOptionsChange({ ...options, referenceCell } as GoogleSheetsOptions)

  const handleExtractingCellsChange = (cellsToExtract: Table<ExtractingCell>) =>
    onOptionsChange({ ...options, cellsToExtract } as GoogleSheetsOptions)

  const UpdatingCellItem = useMemo(
    () => (props: TableListItemProps<Cell>) =>
      <CellWithValueStack {...props} columns={sheet.columns} />,
    [sheet.columns]
  )

  const ExtractingCellItem = useMemo(
    () => (props: TableListItemProps<ExtractingCell>) =>
      <CellWithVariableIdStack {...props} columns={sheet.columns} />,
    [sheet.columns]
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
            id={'reference'}
            columns={sheet.columns}
            item={options.referenceCell ?? {}}
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
            id={'reference'}
            columns={sheet.columns}
            item={options.referenceCell ?? {}}
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
