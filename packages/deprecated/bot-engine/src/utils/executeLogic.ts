import type { TypebotViewerProps } from "@/components/TypebotViewer";
import { executeCondition } from "@/features/blocks/logic/condition";
import { executeRedirect } from "@/features/blocks/logic/redirect";
import { executeScript } from "@/features/blocks/logic/script/executeScript";
import { executeSetVariable } from "@/features/blocks/logic/setVariable";
import { executeTypebotLink } from "@/features/blocks/logic/typebotLink";
import { executeWait } from "@/features/blocks/logic/wait";
import type { LinkedTypebot } from "@/providers/TypebotProvider";
import type { EdgeId, LogicState } from "@/types";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import type { LogicBlock } from "@typebot.io/blocks-logic/schema";

export const executeLogic = async (
  block: LogicBlock,
  context: LogicState,
): Promise<{
  nextEdgeId?: EdgeId;
  linkedTypebot?: TypebotViewerProps["typebot"] | LinkedTypebot;
  blockedPopupUrl?: string;
}> => {
  switch (block.type) {
    case LogicBlockType.SET_VARIABLE:
      return { nextEdgeId: executeSetVariable(block, context) };
    case LogicBlockType.CONDITION:
      return { nextEdgeId: executeCondition(block, context) };
    case LogicBlockType.REDIRECT:
      return executeRedirect(block, context);
    case LogicBlockType.SCRIPT:
      return { nextEdgeId: await executeScript(block, context) };
    case LogicBlockType.TYPEBOT_LINK:
      return executeTypebotLink(block, context);
    case LogicBlockType.WAIT:
      return { nextEdgeId: await executeWait(block, context) };
    default:
      return {};
  }
};
