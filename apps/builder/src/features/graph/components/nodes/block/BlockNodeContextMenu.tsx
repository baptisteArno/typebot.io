import { MenuList, MenuItem } from '@chakra-ui/react'
import { CopyIcon, TrashIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { BlockIndices } from '@typebot.io/schemas'
import { useTranslate } from '@tolgee/react'

type Props = { indices: BlockIndices }
export const BlockNodeContextMenu = ({ indices }: Props) => {
  const { t } = useTranslate()
  const { deleteBlock, duplicateBlock } = useTypebot()

  const handleDuplicateClick = () => duplicateBlock(indices)

  const handleDeleteClick = () => deleteBlock(indices)

  return (
    <MenuList>
      <MenuItem icon={<CopyIcon />} onClick={handleDuplicateClick}>
        {t('duplicate')}
      </MenuItem>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        {t('delete')}
      </MenuItem>
    </MenuList>
  )
}
