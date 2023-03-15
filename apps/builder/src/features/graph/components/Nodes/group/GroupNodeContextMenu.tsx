import { MenuList, MenuItem } from '@chakra-ui/react'
import { CopyIcon, TrashIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'

export const GroupNodeContextMenu = ({
  groupIndex,
}: {
  groupIndex: number
}) => {
  const { deleteGroup, duplicateGroup } = useTypebot()

  const handleDeleteClick = () => deleteGroup(groupIndex)

  const handleDuplicateClick = () => duplicateGroup(groupIndex)

  return (
    <MenuList>
      <MenuItem icon={<CopyIcon />} onClick={handleDuplicateClick}>
        Duplicate
      </MenuItem>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        Delete
      </MenuItem>
    </MenuList>
  )
}
