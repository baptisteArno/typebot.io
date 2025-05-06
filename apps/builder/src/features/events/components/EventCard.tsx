import { useTranslate } from "@tolgee/react";
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
  const { t } = useTranslate();
  switch (props.type) {
    case EventType.START:
      return (
        <EventCardLayout
          {...props}
          tooltip={t("blocks.events.start.eventCard.tooltip")}
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
          tooltip={t("blocks.events.command.eventCard.tooltip")}
        >
          <EventIcon type={props.type} />
          <EventLabel type={props.type} />
        </EventCardLayout>
      );
    case EventType.REPLY:
      return (
        <EventCardLayout
          {...props}
          tooltip={t("blocks.events.reply.eventCard.tooltip")}
        >
          <EventIcon type={props.type} />
          <EventLabel type={props.type} />
        </EventCardLayout>
      );
    case EventType.INVALID_REPLY:
      return (
        <EventCardLayout
          {...props}
          tooltip={t("blocks.events.invalidReply.eventCard.tooltip")}
        >
          <EventIcon type={props.type} />
          <EventLabel type={props.type} />
        </EventCardLayout>
      );
  }
};
