import { EventType } from "@typebot.io/events/constants";
import type { TEvent } from "@typebot.io/events/schemas";
import type { JSX } from "react";
import { StartEventNode } from "@/features/events/components/StartEventNode";
import { CommandEventNode } from "./CommandEventNode";
import { InvalidReplyEventNode } from "./InvalidReplyEventNode";
import { ReplyEventNode } from "./ReplyEventNode";

type Props = {
  event: TEvent;
};

export const EventNodeContent = ({ event }: Props): JSX.Element => {
  switch (event.type) {
    case EventType.START:
      return <StartEventNode />;
    case EventType.COMMAND:
      return <CommandEventNode options={event.options} />;
    case EventType.REPLY:
      return <ReplyEventNode options={event.options} />;
    case EventType.INVALID_REPLY:
      return <InvalidReplyEventNode options={event.options} />;
  }
};
