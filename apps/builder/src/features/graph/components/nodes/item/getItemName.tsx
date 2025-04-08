import type { BlockWithItems } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";

export const getItemName = (blockType: BlockWithItems["type"]): string => {
  switch (blockType) {
    case InputBlockType.CHOICE:
      return "Button";
    case InputBlockType.PICTURE_CHOICE:
      return "Picture Choice";
    case InputBlockType.CARDS:
      return "Card";
    case LogicBlockType.CONDITION:
      return "Condition";
    case LogicBlockType.AB_TEST:
      return "AB Test";
  }
};
