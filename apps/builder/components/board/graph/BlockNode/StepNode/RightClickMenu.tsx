import { MenuList, MenuItem } from '@chakra-ui/react'
import { TrashIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'

export const StepNodeContextMenu = ({ stepId }: { stepId: string }) => {
  const { deleteStep } = useTypebot()

  const handleDeleteClick = () => deleteStep(stepId)

  return (
    <MenuList>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        Delete
      </MenuItem>
    </MenuList>
  )
}
