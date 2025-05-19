import { TRPCError } from "@trpc/server";
import { defaultAbTestOptions } from "@typebot.io/blocks-logic/abTest/constants";
import type { AbTestBlock } from "@typebot.io/blocks-logic/abTest/schema";
import type { ExecuteLogicResponse } from "../../../types";

export const executeAbTest = (block: AbTestBlock): ExecuteLogicResponse => {
  const aEdgeId = block.items[0].outgoingEdgeId;
  const random = Math.random() * 100;
  if (
    random < (block.options?.aPercent ?? defaultAbTestOptions.aPercent) &&
    aEdgeId
  ) {
    return { outgoingEdgeId: aEdgeId };
  }
  const bEdgeId = block.items[1].outgoingEdgeId;
  if (bEdgeId) return { outgoingEdgeId: bEdgeId };
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "No outgoing edge found for AB Test block",
  });
};
