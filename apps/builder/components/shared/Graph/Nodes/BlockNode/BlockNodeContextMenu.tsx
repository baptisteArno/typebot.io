import { MenuList, MenuItem } from '@chakra-ui/react'
import { CopyIcon, TrashIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'

export const BlockNodeContextMenu = ({
  blockIndex,
}: {
  blockIndex: number
}) => {
  const { deleteBlock, duplicateBlock } = useTypebot()

  const handleDeleteClick = () => deleteBlock(blockIndex)

  const handleDuplicateClick = () => duplicateBlock(blockIndex)

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
