import { isForgedBlockType } from "@typebot.io/blocks-core/helpers";
import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { forgedBlockSchemas } from "@typebot.io/forge-repository/schemas";
import { useMemo } from "react";

export const useForgedBlock = (blockType: BlockV6["type"], action?: string) =>
  useMemo(() => {
    if (!isForgedBlockType(blockType)) return {};
    const blockDef = forgedBlocks[blockType];
    return {
      blockDef,
      blockSchema: forgedBlockSchemas[blockType],
      actionDef: action
        ? blockDef?.actions.find((a) => a.name === action)
        : undefined,
    };
  }, [action, blockType]);
