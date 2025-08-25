import { ChevronRightIcon, CopyIcon, RepeatIcon } from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { ForgedBlockTurnIntoContextMenuPopup } from "@/features/forge/components/ForgedBlockTurnIntoMenu";
import { useForgedBlock } from "@/features/forge/hooks/useForgedBlock";
import { useTranslate } from "@tolgee/react";
import type {
  BlockIndices,
  BlockV6,
} from "@typebot.io/blocks-core/schemas/schema";
import type { TurnableIntoParam } from "@typebot.io/forge/types";
import { ContextMenu } from "@typebot.io/ui/components/ContextMenu";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import type { ZodObject } from "zod";

type Props = {
  indices: BlockIndices;
  block: BlockV6;
  onTurnIntoClick: (params: TurnableIntoParam, schema: ZodObject<any>) => void;
};

export const BlockNodeContextMenuPopup = ({
  indices,
  block,
  onTurnIntoClick,
}: Props) => {
  const { t } = useTranslate();
  const { deleteBlock, duplicateBlock } = useTypebot();

  const handleDuplicateClick = () => duplicateBlock(indices);

  const handleDeleteClick = () => deleteBlock(indices);

  const { actionDef } = useForgedBlock({
    nodeType: block.type,
    action: "options" in block ? block.options?.action : undefined,
  });

  return (
    <ContextMenu.Popup>
      {actionDef &&
        actionDef?.turnableInto &&
        actionDef?.turnableInto.length > 0 && (
          <ContextMenu.SubmenuRoot>
            <ContextMenu.SubmenuTrigger>
              <RepeatIcon /> Turn into <ChevronRightIcon />
            </ContextMenu.SubmenuTrigger>
            <ForgedBlockTurnIntoContextMenuPopup
              turnableInto={actionDef.turnableInto}
              onTurnIntoClick={onTurnIntoClick}
            />
          </ContextMenu.SubmenuRoot>
        )}
      <ContextMenu.Item onClick={handleDuplicateClick}>
        <CopyIcon />
        {t("duplicate")}
      </ContextMenu.Item>
      <ContextMenu.Item onClick={handleDeleteClick} className="text-red-10">
        <TrashIcon />
        {t("delete")}
      </ContextMenu.Item>
    </ContextMenu.Popup>
  );
};
