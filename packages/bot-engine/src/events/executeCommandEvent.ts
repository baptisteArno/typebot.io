import { TRPCError } from "@trpc/server";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { EventType } from "@typebot.io/events/constants";
import type { CommandEvent } from "@typebot.io/events/schemas";
import { executeEvent } from "./executeEvent";

type Props = {
  state: SessionState;
  command: string;
};
export const executeCommandEvent = async ({
  state,
  command,
}: Props): Promise<SessionState> => {
  const event = state.typebotsQueue[0].typebot.events?.find(
    (e) => e.type === EventType.COMMAND && e.options?.command === command,
  ) as CommandEvent | undefined;
  if (!event)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Command event not found",
    });

  return await executeEvent({
    state,
    event,
  });
};
