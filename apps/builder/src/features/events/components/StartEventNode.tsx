import { EventType } from "@typebot.io/events/constants";
import { EventIcon } from "@/features/events/components/EventIcon";
import { EventLabel } from "@/features/events/components/EventLabel";

export const StartEventNode = () => (
  <div className="flex items-center gap-3">
    <EventIcon type={EventType.START} />
    <EventLabel type={EventType.START} />
  </div>
);
