import { EventType } from "@typebot.io/events/constants";
import type { TDraggableEvent, TEvent } from "@typebot.io/events/schemas";
import type React from "react";
import { EventCardLayout } from "./EventCardLayout";
import { EventIcon } from "./EventIcon";
import { EventLabel } from "./EventLabel";

type Props = {
  type: TEvent["type"];
  tooltip?: string;
  isDisabled?: boolean;
  children: React.ReactNode;
  onMouseDown: (e: React.MouseEvent, type: TDraggableEvent["type"]) => void;
};

export const EventCard = (
  props: Pick<Props, "type" | "onMouseDown">,
): JSX.Element => {
  switch (props.type) {
    case EventType.START:
      return (
        <EventCardLayout
          {...props}
          tooltip={"Already added in the bot flow"}
          isDisabled
        >
          <EventIcon type={props.type} />
          <EventLabel type={props.type} />
        </EventCardLayout>
      );
    case EventType.COMMAND:
      return (
        <EventCardLayout
          {...props}
          tooltip={"Triggered when a custom command is sent"}
        >
          <EventIcon type={props.type} />
          <EventLabel type={props.type} />
        </EventCardLayout>
      );
  }
};
