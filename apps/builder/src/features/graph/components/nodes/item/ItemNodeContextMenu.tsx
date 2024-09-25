import { CopyIcon, TrashIcon } from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { MenuItem, MenuList } from "@chakra-ui/react";
import type { ItemIndices } from "@typebot.io/blocks-core/schemas/items/types";

type Props = {
  indices: ItemIndices;
};
export const ItemNodeContextMenu = ({ indices }: Props) => {
  const { deleteItem, duplicateItem } = useTypebot();

  return (
    <MenuList>
      <MenuItem icon={<CopyIcon />} onClick={() => duplicateItem(indices)}>
        Duplicate
      </MenuItem>
      <MenuItem icon={<TrashIcon />} onClick={() => deleteItem(indices)}>
        Delete
      </MenuItem>
    </MenuList>
  );
};
