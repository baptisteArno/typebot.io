import { SearchableDropdown } from '@/components/SearchableDropdown'
import { Input } from '@chakra-ui/react'
import { Group } from 'models'
import { useMemo } from 'react'
import { byId } from 'utils'

type Props = {
  groups: Group[]
  groupId?: string
  onGroupIdSelected: (groupId: string) => void
  isLoading?: boolean
}

export const GroupsDropdown = ({
  groups,
  groupId,
  onGroupIdSelected,
  isLoading,
}: Props) => {
  const currentGroup = useMemo(
    () => groups?.find(byId(groupId)),
    [groupId, groups]
  )

  const handleGroupSelect = (title: string) => {
    const id = groups?.find((b) => b.title === title)?.id
    if (id) onGroupIdSelected(id)
  }

  if (isLoading) return <Input value="Loading..." isDisabled />
  if (!groups || groups.length === 0)
    return <Input value="No groups found" isDisabled />
  return (
    <SearchableDropdown
      selectedItem={currentGroup?.title}
      items={(groups ?? []).map((b) => b.title)}
      onValueChange={handleGroupSelect}
      placeholder={'Select a block'}
    />
  )
}
