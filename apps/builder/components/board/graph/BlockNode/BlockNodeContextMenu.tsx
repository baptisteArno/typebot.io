import { MenuList, MenuItem } from '@chakra-ui/react'
import { TrashIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'

export const BlockNodeContextMenu = ({ blockId }: { blockId: string }) => {
  const { deleteBlock } = useTypebot()

  const handleDeleteClick = () => deleteBlock(blockId)

  return (
    <MenuList>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        Delete
      </MenuItem>
    </MenuList>
  )
}
