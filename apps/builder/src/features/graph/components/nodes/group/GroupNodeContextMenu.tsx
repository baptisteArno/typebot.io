import { MenuList, MenuItem } from '@chakra-ui/react'
import { CopyIcon, TrashIcon } from '@/components/icons'
import { useTranslate } from '@tolgee/react'

type Props = {
  onDuplicateClick: () => void
  onDeleteClick: () => void
}

export const GroupNodeContextMenu = ({
  onDuplicateClick,
  onDeleteClick,
}: Props) => {
  const { t } = useTranslate()

  return (
    <MenuList>
      <MenuItem icon={<CopyIcon />} onClick={onDuplicateClick}>
        {t('copy')}
      </MenuItem>
      <MenuItem icon={<TrashIcon />} onClick={onDeleteClick}>
        {t('delete')}
      </MenuItem>
    </MenuList>
  )
}
