import { MenuList, MenuItem } from '@chakra-ui/react'
import { CopyIcon, TrashIcon } from '@/components/icons'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { ItemIndices } from '@sniper.io/schemas'

type Props = {
  indices: ItemIndices
}
export const ItemNodeContextMenu = ({ indices }: Props) => {
  const { deleteItem, duplicateItem } = useSniper()

  return (
    <MenuList>
      <MenuItem icon={<CopyIcon />} onClick={() => duplicateItem(indices)}>
        Duplicate
      </MenuItem>
      <MenuItem icon={<TrashIcon />} onClick={() => deleteItem(indices)}>
        Delete
      </MenuItem>
    </MenuList>
  )
}
