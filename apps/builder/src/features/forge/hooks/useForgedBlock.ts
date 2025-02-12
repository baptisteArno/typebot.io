import { isForgedBlockType } from "@typebot.io/blocks-core/helpers";
import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import type { TEventWithOptions } from "@typebot.io/events/schemas";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { forgedBlockSchemas } from "@typebot.io/forge-repository/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import { useMemo } from "react";

export const useForgedBlock = ({
  nodeType,
  action,
  feature,
}: {
  nodeType: BlockV6["type"] | TEventWithOptions["type"];
  action?: string;
  feature?: string;
}) =>
  useMemo(() => {
    if (!isForgedBlockType(nodeType)) return {};
    const blockDef = forgedBlocks[nodeType];
    return {
      blockDef,
      blockSchema: forgedBlockSchemas[nodeType],
      actionDef: action
        ? blockDef?.actions.find((a) => a.name === action)
        : feature
          ? blockDef?.actions.find((a) =>
              isDefined(a[feature as keyof typeof a]),
            )
          : undefined,
    };
  }, [action, nodeType, feature]);
