import type {
  Item,
  ItemIndices,
} from "@typebot.io/blocks-core/schemas/items/schema";
import type { BlockWithItems } from "@typebot.io/blocks-core/schemas/schema";
import type { CardsItem } from "@typebot.io/blocks-inputs/cards/schema";
import type { ButtonItem } from "@typebot.io/blocks-inputs/choice/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { PictureChoiceItem } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import type { ConditionItem } from "@typebot.io/blocks-logic/condition/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { ButtonsItemNode } from "@/features/blocks/inputs/buttons/components/ButtonsItemNode";
import { CardsItemNode } from "@/features/blocks/inputs/cards/components/CardsItemNode";
import { PictureChoiceItemNode } from "@/features/blocks/inputs/pictureChoice/components/PictureChoiceItemNode";
import { ConditionItemNode } from "@/features/blocks/logic/condition/components/ConditionItemNode";

type Props = {
  item: Item;
  blockType: BlockWithItems["type"];
  indices: ItemIndices;
  isMouseOver: boolean;
  blockId: string;
  groupId: string;
};

export const ItemNodeContent = ({
  item,
  blockType,
  indices,
  isMouseOver,
  blockId,
  groupId,
}: Props): JSX.Element | null => {
  switch (blockType) {
    case InputBlockType.CHOICE:
      return (
        <ButtonsItemNode
          item={item as ButtonItem}
          key={`${item.id}-${(item as ButtonItem).content}`}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      );
    case InputBlockType.PICTURE_CHOICE:
      return (
        <PictureChoiceItemNode
          item={item as PictureChoiceItem}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      );
    case LogicBlockType.CONDITION:
      return (
        <ConditionItemNode item={item as ConditionItem} indices={indices} />
      );
    case LogicBlockType.AB_TEST:
      return null;
    case InputBlockType.CARDS:
      return (
        <CardsItemNode
          item={item as CardsItem}
          indices={indices}
          isMouseOver={isMouseOver}
          blockId={blockId}
          groupId={groupId}
        />
      );
  }
};
