import { StartEventNode } from "@/features/events/components/StartEventNode";
import { EventType } from "@typebot.io/events/constants";
import type { TEvent } from "@typebot.io/events/schemas";
import { CommandEventNode } from "./CommandEventNode";
import { OnMessageEventNode } from "./OnMessageEventNode";

type Props = {
  event: TEvent;
};

export const EventNodeContent = ({ event }: Props): JSX.Element => {
  switch (event.type) {
    case EventType.START:
      return <StartEventNode />;
    case EventType.COMMAND:
      return <CommandEventNode options={event.options} />;
    case EventType.ON_MESSAGE:
      return <OnMessageEventNode options={event.options} />;
  }
};
