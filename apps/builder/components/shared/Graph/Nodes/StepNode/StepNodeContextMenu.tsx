import { MenuList, MenuItem } from '@chakra-ui/react'
import { CopyIcon, TrashIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { StepIndices } from 'models'

type Props = { indices: StepIndices }
export const StepNodeContextMenu = ({ indices }: Props) => {
  const { deleteStep, duplicateStep } = useTypebot()

  const handleDuplicateClick = () => duplicateStep(indices)

  const handleDeleteClick = () => deleteStep(indices)

  return (
    <MenuList>
      <MenuItem icon={<CopyIcon />} onClick={handleDuplicateClick}>
        Duplicar
      </MenuItem>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        Deletar
      </MenuItem>
    </MenuList>
  )
}
