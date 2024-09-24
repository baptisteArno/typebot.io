import { StartEventNode } from "@/features/events/start/StartEventNode";
import type { TEvent } from "@typebot.io/typebot/schemas/types";

type Props = {
  event: TEvent;
};
export const EventNodeContent = ({ event }: Props) => {
  switch (event.type) {
    case "start":
      return <StartEventNode />;
    default:
      return null;
  }
};
