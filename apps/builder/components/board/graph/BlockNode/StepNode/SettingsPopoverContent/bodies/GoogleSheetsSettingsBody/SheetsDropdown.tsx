import { SearchableDropdown } from 'components/shared/SearchableDropdown'
import { useMemo } from 'react'
import { Sheet } from 'services/integrations'
import { isDefined } from 'utils'

type Props = {
  sheets: Sheet[]
  isLoading: boolean
  sheetId?: string
  onSelectSheetId: (id: string) => void
}

export const SheetsDropdown = ({
  sheets,
  isLoading,
  sheetId,
  onSelectSheetId,
}: Props) => {
  const currentSheet = useMemo(
    () => sheets?.find((s) => s.id === sheetId),
    [sheetId, sheets]
  )

  const handleSpreadsheetSelect = (name: string) => {
    const id = sheets?.find((s) => s.name === name)?.id
    if (isDefined(id)) onSelectSheetId(id)
  }
  return (
    <SearchableDropdown
      selectedItem={currentSheet?.name}
      items={(sheets ?? []).map((s) => s.name)}
      onSelectItem={handleSpreadsheetSelect}
      placeholder={isLoading ? 'Loading...' : 'Select the sheet'}
      isDisabled={isLoading}
    />
  )
}
