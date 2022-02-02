import { MenuList, MenuItem } from '@chakra-ui/react'
import { TrashIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'

export const ButtonNodeContextMenu = ({ itemId }: { itemId: string }) => {
  const { deleteChoiceItem } = useTypebot()

  const handleDeleteClick = () => deleteChoiceItem(itemId)

  return (
    <MenuList>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        Delete
      </MenuItem>
    </MenuList>
  )
}
