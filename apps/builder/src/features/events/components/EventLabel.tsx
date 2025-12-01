import { type TFnType, useTranslate } from "@tolgee/react";
import { EventType } from "@typebot.io/events/constants";
import type { TEvent } from "@typebot.io/events/schemas";
import { cn } from "@typebot.io/ui/lib/cn";
import type { JSX } from "react";

type Props = { type: TEvent["type"]; className?: string };

export const EventLabel = ({ type, className }: Props): JSX.Element => {
  const { t } = useTranslate();
  const label = getEventBlockLabel(t)[type];

  return <p className={cn("text-sm", className)}>{label}</p>;
};

export const getEventBlockLabel = (
  t: TFnType,
): { [key in EventType]: string } => ({
  [EventType.START]: t("editor.sidebarBlock.start.label"),
  [EventType.COMMAND]: t("editor.sidebarBlock.command.label"),
  [EventType.REPLY]: t("editor.sidebarBlock.reply.label"),
  [EventType.INVALID_REPLY]: t("editor.sidebarBlock.invalidReply.label"),
});
