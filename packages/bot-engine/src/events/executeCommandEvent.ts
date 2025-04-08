import { TRPCError } from "@trpc/server";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { EventType } from "@typebot.io/events/constants";
import type { CommandEvent } from "@typebot.io/events/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { connectEdgeToNextBlock } from "./connectEdgeToNextBlock";
import { updateCurrentBlockIdWithEvent } from "./updateCurrentBlockIdWithEvent";

type Props = {
  state: SessionState;
  command: string;
  sessionStore: SessionStore;
};
export const executeCommandEvent = async ({
  state,
  command,
  sessionStore,
}: Props): Promise<SessionState> => {
  const event = state.typebotsQueue[0].typebot.events?.find(
    (e) => e.type === EventType.COMMAND && e.options?.command === command,
  ) as CommandEvent | undefined;

  if (!event)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Command event not found",
    });

  let newSessionState = state;
  if (event.options?.resumeAfter) {
    newSessionState = await connectEdgeToNextBlock({
      state: newSessionState,
      event,
      sessionStore,
    });
  }

  return await updateCurrentBlockIdWithEvent({
    state,
    event,
    sessionStore,
  });
};
