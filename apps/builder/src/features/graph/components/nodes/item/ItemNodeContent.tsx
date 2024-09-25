import { ButtonsItemNode } from "@/features/blocks/inputs/buttons/components/ButtonsItemNode";
import { PictureChoiceItemNode } from "@/features/blocks/inputs/pictureChoice/components/PictureChoiceItemNode";
import { ConditionItemNode } from "@/features/blocks/logic/condition/components/ConditionItemNode";
import type { Item } from "@typebot.io/blocks-core/schemas/items/schema";
import type { ItemIndices } from "@typebot.io/blocks-core/schemas/items/types";
import type { BlockWithItems } from "@typebot.io/blocks-core/schemas/schema";
import type { ButtonItem } from "@typebot.io/blocks-inputs/choice/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { ConditionItem } from "@typebot.io/blocks-logic/condition/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import React from "react";

type Props = {
  item: Item;
  blockType: BlockWithItems["type"];
  indices: ItemIndices;
  isMouseOver: boolean;
};

export const ItemNodeContent = ({
  item,
  blockType,
  indices,
  isMouseOver,
}: Props): JSX.Element => {
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
          item={item}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      );
    case LogicBlockType.CONDITION:
      return (
        <ConditionItemNode
          item={item as ConditionItem}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      );
    case LogicBlockType.AB_TEST:
      return <></>;
  }
};
