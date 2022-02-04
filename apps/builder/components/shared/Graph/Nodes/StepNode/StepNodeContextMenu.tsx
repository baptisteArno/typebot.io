import { MenuList, MenuItem } from '@chakra-ui/react'
import { TrashIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { StepIndices } from 'models'

type Props = { indices: StepIndices }
export const StepNodeContextMenu = ({ indices }: Props) => {
  const { deleteStep } = useTypebot()

  const handleDeleteClick = () => deleteStep(indices)

  return (
    <MenuList>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        Delete
      </MenuItem>
    </MenuList>
  )
}
