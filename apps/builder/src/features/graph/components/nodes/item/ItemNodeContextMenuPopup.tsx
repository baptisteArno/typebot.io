import { CopyIcon } from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import type { ItemIndices } from "@typebot.io/blocks-core/schemas/items/schema";
import { ContextMenu } from "@typebot.io/ui/components/ContextMenu";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";

type Props = {
  indices: ItemIndices;
};
export const ItemNodeContextMenuPopup = ({ indices }: Props) => {
  const { deleteItem, duplicateItem } = useTypebot();

  return (
    <ContextMenu.Popup>
      <ContextMenu.Item onClick={() => duplicateItem(indices)}>
        <CopyIcon />
        Duplicate
      </ContextMenu.Item>
      <ContextMenu.Item
        onClick={() => deleteItem(indices)}
        className="text-red-10"
      >
        <TrashIcon />
        Delete
      </ContextMenu.Item>
    </ContextMenu.Popup>
  );
};
