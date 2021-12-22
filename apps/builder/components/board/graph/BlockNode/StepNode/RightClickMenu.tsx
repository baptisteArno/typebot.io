import { MenuList, MenuItem } from '@chakra-ui/react'
import { TrashIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext'

export const StepNodeContextMenu = ({
  blockId,
  stepId,
}: {
  blockId: string
  stepId: string
}) => {
  const { removeStepFromBlock } = useTypebot()

  const handleDeleteClick = () => {
    removeStepFromBlock(blockId, stepId)
  }
  return (
    <MenuList>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        Delete
      </MenuItem>
    </MenuList>
  )
}
