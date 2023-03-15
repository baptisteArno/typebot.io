import { Select } from '@/components/inputs/Select'
import { Input } from '@chakra-ui/react'
import { Group } from '@typebot.io/schemas'
import { parseGroupTitle } from '@typebot.io/lib'

type Props = {
  groups: Group[]
  groupId?: string
  onGroupIdSelected: (groupId: string | undefined) => void
  isLoading?: boolean
}

export const GroupsDropdown = ({
  groups,
  groupId,
  onGroupIdSelected,
  isLoading,
}: Props) => {
  if (isLoading) return <Input value="Loading..." isDisabled />
  if (!groups || groups.length === 0)
    return <Input value="No groups found" isDisabled />
  return (
    <Select
      selectedItem={groupId}
      items={(groups ?? []).map((group) => ({
        label: parseGroupTitle(group.title),
        value: group.id,
      }))}
      onSelect={onGroupIdSelected}
      placeholder={'Select a block'}
    />
  )
}
