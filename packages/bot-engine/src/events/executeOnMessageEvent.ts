import type { SessionState } from "@typebot.io/chat-session/schemas";
import { EventType } from "@typebot.io/events/constants";
import type { OnMessageEvent } from "@typebot.io/events/schemas";
import type { InputMessage } from "../schemas/api";
import { executeEvent } from "./executeEvent";

type Props = {
  state: SessionState;
  reply: InputMessage;
};

export const executeOnMessageEvent = async ({ state, reply }: Props) => {
  const event =
    reply.type === "text"
      ? (state.typebotsQueue[0].typebot.events?.find(
          (e) =>
            e.type === EventType.ON_MESSAGE &&
            e.options?.message === reply.text,
        ) as OnMessageEvent | undefined)
      : undefined;

  if (!event) {
    return {
      ...state,
      currentBlockId: state.currentBlockId,
    };
  }

  return await executeEvent({
    state,
    event,
  });
};
