import { SearchableDropdown } from 'components/shared/SearchableDropdown'
import { useMemo } from 'react'
import { useSpreadsheets } from 'services/integrations'

type Props = {
  credentialsId: string
  spreadsheetId?: string
  onSelectSpreadsheetId: (id: string) => void
}

export const SpreadsheetsDropdown = ({
  credentialsId,
  spreadsheetId,
  onSelectSpreadsheetId,
}: Props) => {
  const { spreadsheets, isLoading } = useSpreadsheets({ credentialsId })
  const currentSpreadsheet = useMemo(
    () => spreadsheets?.find((s) => s.id === spreadsheetId),
    [spreadsheetId, spreadsheets]
  )

  const handleSpreadsheetSelect = (name: string) => {
    const id = spreadsheets?.find((s) => s.name === name)?.id
    if (id) onSelectSpreadsheetId(id)
  }
  return (
    <SearchableDropdown
      selectedItem={currentSpreadsheet?.name}
      items={(spreadsheets ?? []).map((s) => s.name)}
      onValueChange={handleSpreadsheetSelect}
      placeholder={isLoading ? 'Loading...' : 'Search for spreadsheet'}
      isDisabled={isLoading}
    />
  )
}
