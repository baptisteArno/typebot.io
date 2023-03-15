import { MenuList, MenuItem } from '@chakra-ui/react'
import { TrashIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { ItemIndices } from '@typebot.io/schemas'

type Props = {
  indices: ItemIndices
}
export const ItemNodeContextMenu = ({ indices }: Props) => {
  const { deleteItem } = useTypebot()

  const handleDeleteClick = () => deleteItem(indices)

  return (
    <MenuList>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        Delete
      </MenuItem>
    </MenuList>
  )
}
