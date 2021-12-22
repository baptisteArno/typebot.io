import { MenuList, MenuItem } from '@chakra-ui/react'
import { TrashIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext'

export const BlockNodeContextMenu = ({ blockId }: { blockId: string }) => {
  const { removeBlock } = useTypebot()

  const handleDeleteClick = () => {
    removeBlock(blockId)
  }
  return (
    <MenuList>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        Delete
      </MenuItem>
    </MenuList>
  )
}
