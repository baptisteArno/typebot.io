import { Divider, Stack, Text } from '@chakra-ui/react'
import { CredentialsDropdown } from 'components/shared/CredentialsDropdown'
import { DropdownList } from 'components/shared/DropdownList'
import { useTypebot } from 'contexts/TypebotContext'
import { CredentialsType } from 'db'
import {
  Cell,
  ExtractingCell,
  GoogleSheetsAction,
  GoogleSheetsOptions,
  Table,
} from 'models'
import React, { useMemo } from 'react'
import {
  getGoogleSheetsConsentScreenUrl,
  Sheet,
  useSheets,
} from 'services/integrations'
import { isDefined } from 'utils'
import { ExtractCellList } from './ExtractCellList'
import { SheetsDropdown } from './SheetsDropdown'
import { SpreadsheetsDropdown } from './SpreadsheetDropdown'
import { CellWithValueStack, UpdateCellList } from './UpdateCellList'

type Props = {
  options?: GoogleSheetsOptions
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
  const handleActionChange = (action: GoogleSheetsAction) =>
    onOptionsChange({ ...options, action })

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
              currentItem={options.action}
              onItemSelect={handleActionChange}
              items={Object.values(GoogleSheetsAction)}
              placeholder="Select an operation"
            />
          </>
        )}
      {sheet && options?.action && (
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
  options: GoogleSheetsOptions
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

  switch (options.action) {
    case GoogleSheetsAction.INSERT_ROW:
      return (
        <UpdateCellList
          initialCells={options.cellsToInsert}
          sheet={sheet}
          onCellsChange={handleInsertColumnsChange}
        />
      )
    case GoogleSheetsAction.UPDATE_ROW:
      return (
        <Stack>
          <Text>Row to select</Text>
          <CellWithValueStack
            cell={options.referenceCell ?? {}}
            columns={sheet.columns}
            onCellChange={handleReferenceCellChange}
          />
          <Text>Cells to update</Text>
          <UpdateCellList
            initialCells={options.cellsToUpsert}
            sheet={sheet}
            onCellsChange={handleUpsertColumnsChange}
          />
        </Stack>
      )
    case GoogleSheetsAction.GET:
      return (
        <Stack>
          <Text>Row to select</Text>
          <CellWithValueStack
            cell={options.referenceCell ?? {}}
            columns={sheet.columns}
            onCellChange={handleReferenceCellChange}
          />
          <Text>Cells to extract</Text>
          <ExtractCellList
            initialCells={options.cellsToExtract}
            sheet={sheet}
            onCellsChange={handleExtractingCellsChange}
          />
        </Stack>
      )
    default:
      return <></>
  }
}
