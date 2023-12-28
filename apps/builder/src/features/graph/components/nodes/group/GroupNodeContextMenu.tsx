import { MenuList, MenuItem } from '@chakra-ui/react'
import { CopyIcon, TrashIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useTranslate } from '@tolgee/react'

export const GroupNodeContextMenu = ({
  groupIndex,
}: {
  groupIndex: number
}) => {
  const { t } = useTranslate()
  const { deleteGroup, duplicateGroup } = useTypebot()

  const handleDeleteClick = () => deleteGroup(groupIndex)

  const handleDuplicateClick = () => duplicateGroup(groupIndex)

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
