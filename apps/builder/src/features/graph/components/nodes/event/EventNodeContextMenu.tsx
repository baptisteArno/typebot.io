import { MenuList, MenuItem } from '@chakra-ui/react'
import { CopyIcon, TrashIcon } from '@/components/icons'

type Props = {
  onDuplicateClick?: () => void
  onDeleteClick?: () => void
}
export const EventNodeContextMenu = ({
  onDuplicateClick,
  onDeleteClick,
}: Props) => (
  <MenuList>
    {onDuplicateClick && (
      <MenuItem icon={<CopyIcon />} onClick={onDuplicateClick}>
        Duplicate
      </MenuItem>
    )}
    {onDeleteClick && (
      <MenuItem icon={<TrashIcon />} onClick={onDeleteClick}>
        Delete
      </MenuItem>
    )}
  </MenuList>
)
