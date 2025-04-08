import type { SessionState } from "@typebot.io/chat-session/schemas";
import { EventType } from "@typebot.io/events/constants";
import type { ReplyEvent } from "@typebot.io/events/schemas";

export function findReplyEvent(state: SessionState): ReplyEvent | undefined {
  return state.typebotsQueue[0].typebot.events?.find(
    (e) => e.type === EventType.REPLY,
  ) as ReplyEvent | undefined;
}
