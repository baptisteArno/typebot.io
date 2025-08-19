import { ForgedBlockIcon } from "@/features/forge/ForgedBlockIcon";
import { useForgedBlock } from "@/features/forge/hooks/useForgedBlock";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import type { TurnableIntoParam } from "@typebot.io/forge/types";
import { ContextMenu } from "@typebot.io/ui/components/ContextMenu";
import type { ZodObject } from "zod";

type Props = {
  turnableInto: TurnableIntoParam[];
  onTurnIntoClick: (
    params: TurnableIntoParam,
    blockSchema: ZodObject<any>,
  ) => void;
};

export const ForgedBlockTurnIntoContextMenuPopup = ({
  turnableInto,
  onTurnIntoClick,
}: Props) => {
  return (
    <ContextMenu.Popup side="right" align="start" offset={1}>
      {turnableInto.map((params) => (
        <TurnIntoMenuItem
          key={params.blockId}
          blockType={params.blockId as ForgedBlock["type"]}
          onClick={(blockSchema) => onTurnIntoClick(params, blockSchema)}
        />
      ))}
    </ContextMenu.Popup>
  );
};

const TurnIntoMenuItem = ({
  blockType,
  onClick,
}: {
  blockType: ForgedBlock["type"];
  onClick: (blockSchema: ZodObject<any>) => void;
}) => {
  const { blockDef, blockSchema } = useForgedBlock({ nodeType: blockType });

  if (!blockDef || !blockSchema) return null;
  return (
    <ContextMenu.Item onClick={() => onClick(blockSchema)}>
      <ForgedBlockIcon type={blockType} />
      {blockDef.name}
    </ContextMenu.Item>
  );
};
