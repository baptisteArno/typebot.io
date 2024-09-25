import { CopyIcon, TrashIcon } from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { ForgedBlockTurnIntoMenu } from "@/features/forge/components/ForgedBlockTurnIntoMenu";
import { MenuItem, MenuList } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type {
  BlockIndices,
  BlockV6,
} from "@typebot.io/blocks-core/schemas/schema";
import type { TurnableIntoParam } from "@typebot.io/forge/types";
import type { ZodObject } from "zod";

type Props = {
  indices: BlockIndices;
  block: BlockV6;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  onTurnIntoClick: (params: TurnableIntoParam, schema: ZodObject<any>) => void;
};

export const BlockNodeContextMenu = ({
  indices,
  block,
  onTurnIntoClick,
}: Props) => {
  const { t } = useTranslate();
  const { deleteBlock, duplicateBlock } = useTypebot();

  const handleDuplicateClick = () => duplicateBlock(indices);

  const handleDeleteClick = () => deleteBlock(indices);

  return (
    <MenuList>
      <ForgedBlockTurnIntoMenu
        block={block}
        onTurnIntoClick={onTurnIntoClick}
      />
      <MenuItem icon={<CopyIcon />} onClick={handleDuplicateClick}>
        {t("duplicate")}
      </MenuItem>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        {t("delete")}
      </MenuItem>
    </MenuList>
  );
};
