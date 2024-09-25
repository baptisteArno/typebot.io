import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { BlockCardLayout } from "../editor/components/BlockCardLayout";
import { BlockIcon } from "../editor/components/BlockIcon";
import { BlockLabel } from "../editor/components/BlockLabel";
import { useForgedBlock } from "./hooks/useForgedBlock";

export const ForgedBlockCard = (props: {
  type: ForgedBlock["type"];
  onMouseDown: (e: React.MouseEvent, type: BlockV6["type"]) => void;
}) => {
  const { blockDef } = useForgedBlock(props.type);

  return (
    <BlockCardLayout
      {...props}
      tooltip={blockDef?.fullName ? blockDef.fullName : undefined}
    >
      <BlockIcon type={props.type} />
      <BlockLabel type={props.type} />
    </BlockCardLayout>
  );
};
