import { HStack, Input } from '@chakra-ui/react'
import { MoreInfoTooltip } from 'components/shared/MoreInfoTooltip'
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

  if (isLoading) return <Input value="Loading..." isDisabled />
  if (!sheets || sheets.length === 0)
    return (
      <HStack>
        <Input value="No sheets found" isDisabled />
        <MoreInfoTooltip>
          Make sure your spreadsheet contains at least a sheet with a header
          row.
        </MoreInfoTooltip>
      </HStack>
    )
  return (
    <SearchableDropdown
      selectedItem={currentSheet?.name}
      items={(sheets ?? []).map((s) => s.name)}
      onValueChange={handleSpreadsheetSelect}
      placeholder={'Select the sheet'}
    />
  )
}
