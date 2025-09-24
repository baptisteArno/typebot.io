import type {
  ContinueChatResponse,
  CustomEmbedBubble,
} from "@typebot.io/chat-api/schemas";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { Prisma } from "@typebot.io/prisma/types";
import type {
  SetVariableHistoryItem,
  VariableWithUnknowValue,
} from "@typebot.io/variables/schemas";

export type ExecuteLogicResponse = {
  outgoingEdgeId: string | undefined | null;
  newSessionState?: SessionState;
  newSetVariableHistory?: SetVariableHistoryItem[];
} & Pick<ContinueChatResponse, "clientSideActions" | "logs">;

export type ExecuteIntegrationResponse = {
  outgoingEdgeId: string | undefined;
  newSessionState?: SessionState;
  startTimeShouldBeUpdated?: boolean;
  customEmbedBubble?: CustomEmbedBubble;
  newSetVariableHistory?: SetVariableHistoryItem[];
} & Pick<ContinueChatResponse, "clientSideActions" | "logs">;

export type SuccessReply = {
  status: "success";
  content: string;
  outgoingEdgeId?: string;
  variablesToUpdate?: VariableWithUnknowValue[];
};

export type SkipReply = {
  status: "skip";
};

type FailReply = {
  status: "fail";
};

export type ParsedReply = SuccessReply | SkipReply | FailReply;

export type ContinueBotFlowResponse = ContinueChatResponse & {
  newSessionState: SessionState;
  visitedEdges: Prisma.VisitedEdge[];
  setVariableHistory: SetVariableHistoryItem[];
};
